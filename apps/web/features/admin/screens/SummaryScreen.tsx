import { useState } from 'react';
import { Badge, Button, Card } from '../components/ui';
import { dateLabel, hours, icDocumentLabel, jobPay, money } from '../lib/format';
import type { Job } from '../types';

export function SummaryScreen({ jobs }: { jobs: Job[] }) {
  const [detailJobId, setDetailJobId] = useState<string | null>(null);
  const detailJob = jobs.find((job) => job.id === detailJobId);

  if (detailJob) {
    return (
      <Card>
        <SummaryDetail job={detailJob} onBack={() => setDetailJobId(null)} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="pn-section-head">
        <div>
          <h2>Completed jobs</h2>
          <p className="pn-muted">Completed jobs ready for payment and billing review. Click a row to see the full summary.</p>
        </div>
      </div>
      <div className="pn-table pn-table-summary">
        <div className="pn-table-head">
          <span>Job</span>
          <span>Customer</span>
          <span>Location</span>
          <span>Date</span>
          <span>Officers</span>
          <span>Photos</span>
          <span>Total</span>
          <span>Billing</span>
        </div>
        {jobs.map((job) => (
          <button className="pn-table-row pn-click-row" key={job.id} onClick={() => setDetailJobId(job.id)} type="button">
            <span className="pn-mono">{job.id}</span>
            <span>{job.customer}</span>
            <span>{job.location}</span>
            <span>{dateLabel(job.date)}</span>
            <span>{job.officers.length}</span>
            <span>{job.photos.filter((photo) => photo.status === 'received').length}/{job.photos.length}</span>
            <span>{money(jobPay(job))}</span>
            <span>
              <Badge tone={job.billing === 'Billed' ? 'success' : 'warning'}>{job.billing}</Badge>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function SummaryDetail({ job, onBack }: { job: Job; onBack: () => void }) {
  const scheduled = hours(job.start, job.end);
  const rows = job.officers.map((officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled;
    return { officer, worked, pay: worked * officer.rate };
  });
  const total = rows.reduce((sum, row) => sum + row.pay, 0);
  const photoCount = job.photos.filter((photo) => photo.status === 'received').length;

  return (
    <>
      <div className="pn-section-head">
        <div>
          <h2>Completed job summary</h2>
          <p className="pn-muted">{job.id} / {job.customer}</p>
        </div>
        <Button onClick={onBack}>Back to table</Button>
      </div>
      <div className="pn-summary-detail-head">
        <div>
          <span className="pn-id">{job.id}</span>
          <Badge tone={job.billing === 'Billed' ? 'success' : 'warning'}>{job.billing}</Badge>
        </div>
        <h2>{job.customer}</h2>
        <p>{job.location} / {dateLabel(job.date)} / {job.start}-{job.end}</p>
      </div>

      <div className="pn-summary-metrics">
        <div>
          <span>Officers</span>
          <strong>{job.officers.length}</strong>
        </div>
        <div>
          <span>Photo proof</span>
          <strong>{photoCount} / {job.photos.length}</strong>
        </div>
        <div>
          <span>Total payable</span>
          <strong>{money(total)}</strong>
        </div>
      </div>

      <div className="pn-table pn-table-summary-detail">
        <div className="pn-table-head">
          <span>Officer</span>
          <span>Actual</span>
          <span>Hours</span>
          <span>Rate</span>
          <span>Pay</span>
          <span>Identity docs</span>
        </div>
        {rows.map(({ officer, worked, pay }) => (
          <div className="pn-table-row" key={officer.oid}>
            <span>{officer.name}</span>
            <span>{officer.actualStart || '-'} - {officer.actualEnd || '-'}</span>
            <span>{worked.toFixed(2)}h</span>
            <span>{money(officer.rate)}/h</span>
            <span>{money(pay)}</span>
            <span>
              <Badge tone={officer.ic ? 'success' : 'danger'}>{icDocumentLabel(officer.ic)}</Badge>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
