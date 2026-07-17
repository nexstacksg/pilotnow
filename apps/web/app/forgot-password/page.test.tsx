import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPasswordPage from './page';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../lib/api', () => ({ http: { post } }));

describe('ForgotPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an invalid email locally', async () => {
    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText('Email Address'), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: 'Get Reset Code' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.');
    expect(post).not.toHaveBeenCalled();
  });

  it('completes the reset-code and new-password flow', async () => {
    post
      .mockResolvedValueOnce({ developmentCode: '1234' })
      .mockResolvedValueOnce({ resetToken: 'reset-token' })
      .mockResolvedValueOnce({});
    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText('Email Address'), 'admin@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Get Reset Code' }));

    expect(await screen.findByText('Enter Authentication Code')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Create New Password')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Enter new password'), 'newpass123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('Password Reset Complete');
    expect(post).toHaveBeenNthCalledWith(1, '/auth/password-reset/request', { email: 'admin@example.com' });
    expect(post).toHaveBeenNthCalledWith(2, '/auth/password-reset/verify', { email: 'admin@example.com', code: '1234' });
    await waitFor(() => expect(post).toHaveBeenNthCalledWith(3, '/auth/password-reset/complete', {
      resetToken: 'reset-token', password: 'newpass123',
    }));
  });

  it('enforces password strength before completing a reset', async () => {
    post.mockResolvedValueOnce({ developmentCode: '1234' }).mockResolvedValueOnce({ resetToken: 'token' });
    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText('Email Address'), 'admin@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Get Reset Code' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await userEvent.type(await screen.findByLabelText('Enter new password'), 'short');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters');
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('enables resend after one minute and requests a fresh code', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    post.mockResolvedValueOnce({ developmentCode: '1234' }).mockResolvedValueOnce({ developmentCode: '5678' });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText('Email Address'), 'admin@example.com');
    await user.click(screen.getByRole('button', { name: 'Get Reset Code' }));
    const resend = await screen.findByRole('button', { name: 'Resend Code' });
    expect(resend).toBeDisabled();

    act(() => vi.advanceTimersByTime(60_000));
    expect(resend).toBeEnabled();
    await user.click(resend);
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(screen.getByText(/Development code:/)).toHaveTextContent('5678');
    vi.useRealTimers();
  });
});
