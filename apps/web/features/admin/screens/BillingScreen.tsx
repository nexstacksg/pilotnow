import { Badge, Button, Card } from '../components/ui';
import { dateLabel } from '../lib/format';
import type { Job } from '../types';

export function BillingScreen({ jobs, openBill }: { jobs: Job[]; openBill: (id: string) => void }) {
  return (
    <Card>
      <h2>Customer billing</h2>
      <div className="pn-table pn-table-billing">
        <div className="pn-table-head">
          <span>Job</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Invoice</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {jobs.map((job) => (
          <div className="pn-table-row" key={job.id}>
            <span className="pn-mono">{job.id}</span>
            <span>{job.customer}</span>
            <span>{dateLabel(job.date)}</span>
            <span>{job.invoice || '-'}</span>
            <span>
              <Badge tone={job.billing === 'Billed' ? 'success' : 'warning'}>{job.billing}</Badge>
            </span>
            <span>{job.billing === 'Not Billed' ? <Button onClick={() => openBill(job.id)}>Bill now</Button> : job.billedDate ? dateLabel(job.billedDate) : '-'}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
