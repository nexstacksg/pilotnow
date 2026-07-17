import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@pilotnow/api-client';
import LoginPage from './page';

const { post, replace, refresh } = vi.hoisted(() => ({
  post: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ http: { post } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }));

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates missing credentials without calling the API', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email address and password.');
    expect(post).not.toHaveBeenCalled();
  });

  it('submits trimmed credentials and redirects after login', async () => {
    post.mockResolvedValue({});
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/Email Address/), ' admin@example.com ');
    await userEvent.type(screen.getByLabelText(/Password/), 'secret123');
    await userEvent.click(screen.getByLabelText('Remember Me'));
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@example.com', password: 'secret123', remember: false,
    }));
    expect(replace).toHaveBeenCalledWith('/');
    expect(refresh).toHaveBeenCalled();
  });

  it('shows a recoverable message when login fails', async () => {
    post.mockRejectedValue(new Error('offline'));
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/Email Address/), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/Password/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to sign in');
  });

  it('shows a specific message for rejected credentials', async () => {
    post.mockRejectedValue(new HttpError(401, 'POST', '/auth/login', { error: 'Unauthorized' }));
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/Email Address/), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/Password/), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email address or password is incorrect.');
  });
});
