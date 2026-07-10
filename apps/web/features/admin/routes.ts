import type { Screen } from './types';

export const adminRoutes: Record<Exclude<Screen, 'jobDetail'>, string> = {
  dashboard: '/',
  jobs: '/jobs',
  officers: '/officers',
  summary: '/summary',
  payments: '/payments',
  billing: '/billing',
  reports: '/reports',
};

export function routeForScreen(screen: Screen, jobId = 'PN-2041') {
  if (screen === 'jobDetail') return `/jobs/${encodeURIComponent(jobId)}`;
  return adminRoutes[screen];
}
