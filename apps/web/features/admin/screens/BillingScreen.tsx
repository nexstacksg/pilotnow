import { Badge, Button } from '../components/ui';
import { dateLabel } from '../lib/format';
import type { Job } from '../types';

export function BillingScreen({ jobs, openBill }: { jobs: Job[]; openBill: (id: string) => void }) {
  return (
    <div className="pn-billing-screen">
      <p className="pn-billing-intro">Completed jobs and their customer billing status.</p>
      <div className="pn-table pn-table-billing">
        <div className="pn-table-head">
          <span>Job</span>
          <span>Customer</span>
          <span>Job date</span>
          <span>Invoice</span>
          <span>Billed</span>
          <span>Status</span>
        </div>
        {jobs.map((job) => (
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
        {!jobs.length ? <div className="pn-empty">No completed jobs are ready for billing.</div> : null}
      </div>
    </div>
  );
}
