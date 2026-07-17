import { useEffect, useState } from 'react';
import { ChevronLeftIcon, CopyIcon } from '../components/icons';
import { Badge, Button, Card, DEFAULT_PAGE_SIZE, Pagination } from '../components/ui';
import { fetchCompletedJobs } from '../lib/jobs-api';
import { dateLabel, hours, icDocumentLabel, jobPay, money } from '../lib/format';
import type { Job } from '../types';

export function SummaryScreen({
  jobs,
  detailJobId = null,
  openSummaryJob,
  closeSummaryJob,
}: {
  jobs: Job[];
  detailJobId?: string | null;
  openSummaryJob?: (id: string) => void;
  closeSummaryJob?: () => void;
}) {
  const [summaryJobs, setSummaryJobs] = useState(jobs);
  const [localDetailJobId, setLocalDetailJobId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const activeDetailJobId = detailJobId ?? localDetailJobId;
  const detailJob = summaryJobs.find((job) => job.id === activeDetailJobId);
  const openDetail = openSummaryJob ?? setLocalDetailJobId;
  const closeDetail = closeSummaryJob ?? (() => setLocalDetailJobId(null));
  const pageCount = Math.max(1, Math.ceil(summaryJobs.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleJobs = summaryJobs.slice(start, start + pageSize);
  const from = summaryJobs.length ? start + 1 : 0;
  const to = Math.min(start + pageSize, summaryJobs.length);

  useEffect(() => {
    setSummaryJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, summaryJobs.length]);

  useEffect(() => {
    let cancelled = false;

    void fetchCompletedJobs(jobs)
      .then((items) => {
        if (cancelled) return;
        setSummaryJobs((current) =>
          items.map((item) => {
            const existing = current.find((job) => job.id === item.id) ?? jobs.find((job) => job.id === item.id);
            return {
              ...item,
              officers: existing?.officers.length ? existing.officers : item.officers,
              photos: existing?.photos.length ? existing.photos : item.photos,
            };
          }),
        );
        setLoadError('');
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load completed jobs from the API. Showing local data.');
      });

    return () => {
      cancelled = true;
    };
  }, [jobs]);

  if (detailJob) {
    return <SummaryDetail job={detailJob} onBack={closeDetail} />;
  }

  return (
    <div className="pn-stack">
      <p className="pn-summary-intro">Completed jobs ready for payment and billing review. Click a row to see the full summary.</p>
      {loadError ? <p className="pn-muted">{loadError}</p> : null}
      <div className="pn-table pn-table-summary">
        <div className="pn-table-head">
          <span>Job</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Officers</span>
          <span>Photos</span>
          <span>Payable</span>
          <span>Billing</span>
          <span />
        </div>
        {visibleJobs.map((job) => (
          <button className="pn-table-row pn-click-row" key={job.id} onClick={() => openDetail(job.id)} type="button">
            <span className="pn-mono">{job.id}</span>
            <span>
              <strong>{job.customer}</strong>
              <small>{job.location}</small>
            </span>
            <span>{dateLabel(job.date)}</span>
            <span>{job.officers.length}</span>
            <span>{job.photos.filter((photo) => photo.status === 'received').length}/{job.photos.length}</span>
            <span>{money(jobPay(job))}</span>
            <span>
              <Badge tone={job.billing === 'Billed' ? 'success' : 'warning'}>{job.billing}</Badge>
            </span>
            <span className="pn-row-chevron">›</span>
          </button>
        ))}
      </div>
      <Pagination from={from} label="Completed job" onPageChange={setPage} onPageSizeChange={setPageSize} page={currentPage} pageCount={pageCount} pageSize={pageSize} showSinglePage to={to} total={summaryJobs.length} />
      {!summaryJobs.length ? <p className="pn-muted">No completed jobs recorded yet.</p> : null}
    </div>
  );
}

function SummaryDetail({ job, onBack }: { job: Job; onBack: () => void }) {
  const scheduled = hours(job.start, job.end);
  const rows = job.officers.map((officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled;
    const actual = `${officer.actualStart || job.start} - ${officer.actualEnd || job.end}`;
    return { officer, actual, worked, pay: worked * officer.rate };
  });
  const total = rows.reduce((sum, row) => sum + row.pay, 0);
  const photoCount = job.photos.filter((photo) => photo.status === 'received').length;
  const summaryText = [
    `Completed job summary - ${job.id}`,
    `${job.customer}`,
    `${job.location} - ${dateLabel(job.date)} - ${job.start}-${job.end}`,
    '',
    ...rows.map(({ officer, actual, worked, pay }) => `${officer.name}: ${actual}, ${worked.toFixed(2)}h x ${money(officer.rate)}/h = ${money(pay)}`),
    '',
    `Photo proof: ${photoCount} / ${job.photos.length} received`,
    `Total payable: ${money(total)}`,
  ].join('\n');

  return (
    <div className="pn-stack">
      <button className="pn-back" onClick={onBack} type="button">
        <ChevronLeftIcon size={15} strokeWidth={2.2} />
        All completed jobs
      </button>
      <Card className="pn-summary-detail-card">
        <div className="pn-summary-detail-hero">
          <div>
            <div className="pn-row">
              <span className="pn-id">{job.id}</span>
              <Badge tone={job.billing === 'Billed' ? 'success' : 'warning'}>{job.billing}</Badge>
            </div>
            <h2>{job.customer}</h2>
            <p>{job.location} · {dateLabel(job.date)} · {job.start}-{job.end}</p>
          </div>
          <Button onClick={() => exportSummary(summaryText, job.id)}>
            <CopyIcon size={14} strokeWidth={2} />
            Export summary
          </Button>
        </div>

        <div className="pn-summary-pay-table">
          <div className="pn-summary-pay-head">
            <span>Officer</span>
            <span>Actual hours</span>
            <span>Hrs</span>
            <span>Rate</span>
            <span>Payable</span>
          </div>
          {rows.map(({ officer, actual, worked, pay }) => (
            <div className="pn-summary-pay-row" key={officer.oid}>
              <span>
                <strong>{officer.name}</strong>
                <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC ✓' : 'No IC'}</Badge>
              </span>
              <span className="pn-mono">{actual}</span>
              <span><strong>{worked.toFixed(2)}h</strong></span>
              <span className="pn-mono">{money(officer.rate)}</span>
              <span><strong>{money(pay)}</strong></span>
            </div>
          ))}
        </div>

        <div className="pn-summary-detail-total">
          <div>
            <span>Photo proof</span>
            <strong>{photoCount} / {job.photos.length} received</strong>
          </div>
          <aside>
            <span>Total payable</span>
            <strong>{money(total)}</strong>
          </aside>
        </div>
      </Card>
    </div>
  );
}

function exportSummary(text: string, jobId: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${jobId.replace(/[^a-z0-9-]/gi, '_')}-summary.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
