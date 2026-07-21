import { useEffect, useState } from 'react';
import { Badge, Button, DEFAULT_PAGE_SIZE, Pagination } from '../components/ui';
import { dateLabel } from '../lib/format';
import type { BillingFilter, Job } from '../types';

export function BillingScreen({
  jobs,
  filter,
  search,
  setFilter,
  openBill,
}: {
  jobs: Job[];
  filter: BillingFilter;
  search: string;
  setFilter: (filter: BillingFilter) => void;
  openBill: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const filters: BillingFilter[] = ['All', 'Not Billed', 'Billed'];
  const query = search.trim().toLowerCase();
  const filtered = jobs
    .filter((job) => filter === 'All' || job.billing === filter)
    .filter((job) => !query || billingSearchText(job).includes(query));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleJobs = filtered.slice(start, start + pageSize);
  const from = filtered.length ? start + 1 : 0;
  const to = Math.min(start + pageSize, filtered.length);
  const statusMessage = completedBillingMessage(jobs);

  useEffect(() => {
    setPage(1);
  }, [filter, pageSize, query]);

  return (
    <div className="pn-billing-screen">
      <p className="pn-billing-intro">Completed jobs and their customer billing status.</p>
      {statusMessage ? <p className="pn-billing-complete-message">{statusMessage}</p> : null}
      <div className="pn-tabs">
        {filters.map((item) => (
          <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">
            {item} · {item === 'All' ? jobs.length : jobs.filter((job) => job.billing === item).length}
          </button>
        ))}
      </div>
      <div className="pn-table pn-table-billing">
        <div className="pn-table-head">
          <span>Job</span>
          <span>Customer</span>
          <span>Job date</span>
          <span>Invoice</span>
          <span>Billed</span>
          <span>Status</span>
        </div>
        {visibleJobs.map((job) => (
          <div className="pn-table-row" key={job.id}>
            <span className="pn-mono pn-billing-job">{job.id}</span>
            <span className="pn-billing-customer">{job.customer}</span>
            <span>{dateLabel(job.date)}</span>
            <span className="pn-mono">{job.invoice || '-'}</span>
            <span>{job.billedDate ? dateLabel(job.billedDate) : '-'}</span>
            <span className="pn-billing-status">
              {job.billing === 'Not Billed' ? (
                <Button variant="primary" onClick={() => openBill(job.id)}>
                  Mark billed
                </Button>
              ) : (
                <Badge tone="success">Billed</Badge>
              )}
            </span>
          </div>
        ))}
        {!filtered.length ? <div className="pn-empty">No completed jobs match this billing filter.</div> : null}
      </div>
      <Pagination
        from={from}
        label="Billing"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        page={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        showSinglePage={filtered.length > 0}
        to={to}
        total={filtered.length}
      />
    </div>
  );
}

export function completedBillingMessage(jobs: Job[]) {
  if (!jobs.length) return '';
  const notBilled = jobs.filter((job) => job.billing === 'Not Billed').length;
  if (notBilled) return `${notBilled} completed job${notBilled === 1 ? '' : 's'} ready for billing.`;
  return `${jobs.length} completed job${jobs.length === 1 ? '' : 's'} billed.`;
}

function billingSearchText(job: Job) {
  return [
    job.id,
    job.customer,
    job.location,
    job.date,
    dateLabel(job.date),
    job.invoice,
    job.billedDate,
    job.billedDate ? dateLabel(job.billedDate) : '',
    job.billing,
    job.status,
  ]
    .join(' ')
    .toLowerCase();
}
