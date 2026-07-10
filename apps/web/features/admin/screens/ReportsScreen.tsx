import { Card } from '../components/ui';
import { dateLabel, jobPay, money } from '../lib/format';
import type { OperationsReport } from '../lib/reports-api';
import type { Job, Officer, Payment } from '../types';

export function ReportsScreen({ jobs, officers, payments, report }: { jobs: Job[]; officers: Officer[]; payments: Payment[]; report?: OperationsReport | null }) {
  const completed = jobs.filter((job) => job.status === 'Completed');
  const missing = jobs.flatMap((job) => job.photos.filter((photo) => photo.status === 'missing').map((photo) => ({ job, photo })));
  const metrics = report?.metrics ?? {
    completedJobs: completed.length,
    totalPayroll: payments.reduce((sum, payment) => sum + payment.hours * payment.rate, 0),
    missingCheckpoints: missing.length,
    officers: officers.length,
  };
  const rows = report?.completedJobs ?? completed.map((job) => ({
    id: job.id,
    customer: job.customer,
    date: job.date,
    officers: job.officers.length,
    totalPayable: jobPay(job),
  }));

  return (
    <div className="pn-stack">
      <div className="pn-stats">
        <Card>
          <span className="pn-muted">Completed jobs</span>
          <strong className="pn-compact-metric">{metrics.completedJobs}</strong>
        </Card>
        <Card>
          <span className="pn-muted">Total payroll</span>
          <strong className="pn-compact-metric">{money(metrics.totalPayroll)}</strong>
        </Card>
        <Card>
          <span className="pn-muted">Missing checkpoints</span>
          <strong className="pn-compact-metric">{metrics.missingCheckpoints}</strong>
        </Card>
        <Card>
          <span className="pn-muted">Officers</span>
          <strong className="pn-compact-metric">{metrics.officers}</strong>
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
          {rows.map((job) => (
            <div className="pn-table-row" key={job.id}>
              <span>{job.id}</span>
              <span>{job.customer}</span>
              <span>{dateLabel(job.date)}</span>
              <span>{job.officers}</span>
              <span>{money(job.totalPayable)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
