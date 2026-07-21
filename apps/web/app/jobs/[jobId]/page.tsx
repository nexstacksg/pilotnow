import { AdminApp } from '../../../features/admin';
import { OfficerJobAccessPage } from './OfficerJobAccessPage';

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ hp?: string; token?: string }>;
}) {
  const { jobId } = await params;
  const query = await searchParams;
  if (query.hp && query.token) {
    return <OfficerJobAccessPage hp={query.hp} jobId={decodeURIComponent(jobId)} token={query.token} />;
  }

  return <AdminApp initialScreen="jobDetail" initialJobId={decodeURIComponent(jobId)} />;
}
