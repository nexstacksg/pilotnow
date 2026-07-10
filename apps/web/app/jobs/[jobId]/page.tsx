import { AdminApp } from '../../../features/admin';

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return <AdminApp initialScreen="jobDetail" initialJobId={decodeURIComponent(jobId)} />;
}
