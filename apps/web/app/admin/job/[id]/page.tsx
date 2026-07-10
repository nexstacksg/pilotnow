import { AdminApp } from '../../../../features/admin/AdminApp';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminApp initialScreen="jobDetail" initialJobId={decodeURIComponent(id)} />;
}
