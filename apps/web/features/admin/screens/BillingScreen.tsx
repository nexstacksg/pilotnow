import { Badge, Button } from '../components/ui';
import { dateLabel } from '../lib/format';
import type { BillingFilter, Job } from '../types';

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
  const filters: BillingFilter[] = ['All', 'Not Billed', 'Billed'];
  const filtered = filter === 'All' ? jobs : jobs.filter((job) => job.billing === filter);

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
        {filtered.map((job) => (
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
    </div>
  );
}
