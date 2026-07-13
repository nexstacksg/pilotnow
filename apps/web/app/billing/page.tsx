import { AdminApp } from '../../features/admin';
import type { BillingFilter } from '../../features/admin/types';

const billingFilters: BillingFilter[] = ['All', 'Not Billed', 'Billed'];

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ job?: string | string[]; view?: string | string[] }> }) {
  const { job, view } = await searchParams;
  const requestedView = Array.isArray(view) ? view[0] : view;
  const requestedJob = Array.isArray(job) ? job[0] : job;
  const initialBillingFilter = billingFilters.find((filter) => filter === requestedView) ?? 'All';

  return <AdminApp initialBillId={requestedJob ?? null} initialBillingFilter={initialBillingFilter} initialScreen="billing" />;
}
