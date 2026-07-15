import { useEffect, useState } from 'react';
import { Badge, Button, Pagination } from '../components/ui';
import { dateLabel } from '../lib/format';
import type { BillingFilter, Job } from '../types';

const PAGE_SIZE = 8;

export function BillingScreen({
  jobs,
  filter,
  setFilter,
  openBill,
}: {
  jobs: Job[];
  filter: BillingFilter;
  setFilter: (filter: BillingFilter) => void;
  openBill: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const filters: BillingFilter[] = ['All', 'Not Billed', 'Billed'];
  const filtered = filter === 'All' ? jobs : jobs.filter((job) => job.billing === filter);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleJobs = filtered.slice(start, start + PAGE_SIZE);
  const from = filtered.length ? start + 1 : 0;
  const to = Math.min(start + PAGE_SIZE, filtered.length);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  return (
    <div className="pn-billing-screen">
      <p className="pn-billing-intro">Completed jobs and their customer billing status.</p>
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
        page={currentPage}
        pageCount={pageCount}
        showSinglePage={filtered.length > 0}
        to={to}
        total={filtered.length}
      />
    </div>
  );
}
