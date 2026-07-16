import { SignReportPage } from './sign-report-page';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { jobId } = await params;
  const { token = '' } = await searchParams;
  return <SignReportPage jobId={decodeURIComponent(jobId)} token={token} />;
}
