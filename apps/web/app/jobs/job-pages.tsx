import { AdminApp } from '../../features/admin';

export function JobsPageContent() {
  return <AdminApp initialScreen="jobs" />;
}

export async function JobDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminApp initialScreen="jobDetail" initialJobId={decodeURIComponent(id)} />;
}
