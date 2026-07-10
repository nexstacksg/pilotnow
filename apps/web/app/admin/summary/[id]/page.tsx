import { AdminApp } from '../../../../features/admin';

export default async function SummaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminApp initialScreen="summary" initialSummaryJobId={decodeURIComponent(id)} />;
}
