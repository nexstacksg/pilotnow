import { JobsPageContent } from './job-pages';
import type { JobListFilter } from '../../features/admin/types';

const jobFilters: JobListFilter[] = ['All', 'Today', 'Needs staffing', 'Ongoing', 'Missing photos', 'Draft', 'Open', 'Assigned', 'Completed', 'Cancelled'];

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ view?: string | string[] }> }) {
  const { view } = await searchParams;
  const requestedView = Array.isArray(view) ? view[0] : view;
  const initialJobFilter = jobFilters.find((filter) => filter === requestedView) ?? 'All';

  return <JobsPageContent initialJobFilter={initialJobFilter} />;
}
