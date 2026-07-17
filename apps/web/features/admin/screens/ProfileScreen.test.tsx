import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileScreen } from './ProfileScreen';

const { fetchProfile, saveProfile, changePassword } = vi.hoisted(() => ({ fetchProfile: vi.fn(), saveProfile: vi.fn(), changePassword: vi.fn() }));
vi.mock('../lib/profile-api', () => ({
  fetchProfile, saveProfile, changePassword,
  profileErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

const account = { id: '1', name: 'Alex Tan', email: 'alex@example.com', phone: '+65 9123 4567', company: 'NexStack', avatarUrl: null, role: 'Admin', createdAt: '2025-01-01T00:00:00Z', passwordChangedAt: null };

describe('ProfileScreen', () => {
  beforeEach(() => { vi.clearAllMocks(); fetchProfile.mockResolvedValue({ profile: account }); });

  it('loads and saves edited profile details', async () => {
    saveProfile.mockImplementation(async (details) => ({ profile: { ...account, ...details } }));
    render(<ProfileScreen />);
    const name = await screen.findByLabelText('Full Name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Alexandra Tan');
    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(saveProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alexandra Tan' })));
    expect(await screen.findByRole('status')).toHaveTextContent('Profile changes saved');
  });

  it('validates and changes the password', async () => {
    changePassword.mockResolvedValue(undefined);
    render(<ProfileScreen />);
    await screen.findByDisplayValue('Alex Tan');
    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    await userEvent.type(screen.getByLabelText('Current Password'), 'oldpass123');
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    await waitFor(() => expect(changePassword).toHaveBeenCalledWith('oldpass123', 'newpass123'));
    expect(await screen.findByRole('status')).toHaveTextContent('Password updated');
  });

  it('reports a profile loading failure', async () => {
    fetchProfile.mockRejectedValue(new Error('offline'));
    render(<ProfileScreen />);
    expect(await screen.findByRole('status')).toHaveTextContent('Could not load profile');
  });

  it('rejects mismatched passwords without calling the API', async () => {
    render(<ProfileScreen />);
    await screen.findByDisplayValue('Alex Tan');
    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    await userEvent.type(screen.getByLabelText('Current Password'), 'oldpass123');
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'different123');
    await userEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    expect(screen.getByRole('status')).toHaveTextContent('New passwords do not match');
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('rejects unsupported profile photos before upload', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProfileScreen />);
    await screen.findByDisplayValue('Alex Tan');
    const file = new File(['not an image'], 'avatar.txt', { type: 'text/plain' });
    await user.upload(screen.getByLabelText('Change Photo'), file);
    expect(screen.getByRole('status')).toHaveTextContent('Choose a PNG, JPEG, or WebP image under 1 MB');
    expect(saveProfile).not.toHaveBeenCalled();
  });
});
