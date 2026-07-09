import type { RouteKey } from './types';

export function routeFromSlug(slug: string[]) {
  if (!slug.length) return { key: 'dashboard' as RouteKey };
  if (slug[0] === 'jobs' && slug[1]) return { key: 'jobDetail' as RouteKey, jobId: slug[1] };
  if (slug[0] === 'jobs') return { key: 'jobs' as RouteKey };
  if (slug[0] === 'requests') return { key: 'requests' as RouteKey };
  if (slug[0] === 'shift') return { key: 'shift' as RouteKey };
  if (slug[0] === 'officers') return { key: 'officers' as RouteKey };
  if (slug[0] === 'reports') return { key: 'reports' as RouteKey };
  if (slug[0] === 'finance' && slug[1] === 'payments') return { key: 'payments' as RouteKey };
  if (slug[0] === 'finance' && slug[1] === 'billing') return { key: 'billing' as RouteKey };
  if (slug[0] === 'finance') return { key: 'summary' as RouteKey };
  return { key: 'dashboard' as RouteKey };
}
