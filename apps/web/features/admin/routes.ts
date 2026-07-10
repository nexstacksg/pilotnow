import type { Screen } from './types';

export const adminRoutes: Record<Exclude<Screen, 'jobDetail'>, string> = {
  dashboard: '/',
  jobs: '/admin/job',
  officers: '/admin/officers',
  summary: '/admin/summary',
  payments: '/payments',
  billing: '/billing',
  reports: '/reports',
};

export function routeForScreen(screen: Screen, jobId = 'PN-2041') {
  if (screen === 'jobDetail') return `/admin/job/${encodeURIComponent(jobId)}`;
  return adminRoutes[screen];
}
