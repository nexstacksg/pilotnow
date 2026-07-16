import { HttpError } from '@pilotnow/api-client';
import { http } from '../../../lib/api';

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  passwordChangedAt: string | null;
};

export async function fetchProfile() {
  return http.get<{ profile: AdminProfile }>('/auth/profile');
}

export async function saveProfile(profile: Pick<AdminProfile, 'name' | 'email' | 'phone' | 'company' | 'avatarUrl'>) {
  return http.put<{ profile: AdminProfile }>('/auth/profile', profile);
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await http.put('/auth/password', { currentPassword, newPassword });
}

export function profileErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HttpError && error.body && typeof error.body === 'object' && 'error' in error.body) {
    const message = (error.body as { error?: unknown }).error;
    if (typeof message === 'string') return message;
  }
  return fallback;
}
