import { Card } from '../components/ui';
import { dateLabel, jobPay, money } from '../lib/format';
import type { Job, Officer, Payment } from '../types';

export function ReportsScreen({ jobs, officers, payments }: { jobs: Job[]; officers: Officer[]; payments: Payment[] }) {
  const completed = jobs.filter((job) => job.status === 'Completed');
  const missing = jobs.flatMap((job) => job.photos.filter((photo) => photo.status === 'missing').map((photo) => ({ job, photo })));

  return (
    <div className="pn-stack">
      <div className="pn-stats">
        <Card>
          <span className="pn-muted">Completed jobs</span>
          <strong className="pn-compact-metric">{completed.length}</strong>
        </Card>
        <Card>
          <span className="pn-muted">Total payroll</span>
          <strong className="pn-compact-metric">{money(payments.reduce((sum, payment) => sum + payment.hours * payment.rate, 0))}</strong>
        </Card>
        <Card>
          <span className="pn-muted">Missing checkpoints</span>
          <strong className="pn-compact-metric">{missing.length}</strong>
        </Card>
        <Card>
          <span className="pn-muted">Officers</span>
          <strong className="pn-compact-metric">{officers.length}</strong>
        </Card>
      </div>
      <Card>
        <h2>Completed job report</h2>
        <div className="pn-table pn-table-report">
          <div className="pn-table-head">
            <span>Job</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Officers</span>
            <span>Total payable</span>
          </div>
          {completed.map((job) => (
            <div className="pn-table-row" key={job.id}>
              <span>{job.id}</span>
              <span>{job.customer}</span>
              <span>{dateLabel(job.date)}</span>
              <span>{job.officers.length}</span>
              <span>{money(jobPay(job))}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
