import { AdminApp } from '../../features/admin';
import type { JobListFilter } from '../../features/admin/types';

export function JobsPageContent({ initialJobFilter = 'All' }: { initialJobFilter?: JobListFilter }) {
  return <AdminApp initialJobFilter={initialJobFilter} initialScreen="jobs" />;
}

export async function JobDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminApp initialScreen="jobDetail" initialJobId={decodeURIComponent(id)} />;
}
