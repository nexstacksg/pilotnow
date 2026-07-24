import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon, DownloadIcon, EyeIcon } from '../components/icons';
import { Button, Card, DEFAULT_PAGE_SIZE, Pagination } from '../components/ui';
import { dateLabel, jobPay, money } from '../lib/format';
import type { OperationsReport } from '../lib/reports-api';
import type { Job, Officer, Payment } from '../types';

type ReportKey = 'completed' | 'payments' | 'missingPhotos' | 'billing' | 'officerHistory';
type ReportColumn = {
  key: string;
  label: string;
  exportable?: boolean;
};
type ReportRow = {
  id: string;
  date: string;
  cells: Record<string, string | number>;
  canOpenJob?: boolean;
  canViewJobReport?: boolean;
  jobId?: string;
};

const reportTabs: { key: ReportKey; label: string; title: string }[] = [
  { key: 'completed', label: 'Completed job report', title: 'Completed job report' },
  { key: 'payments', label: 'Officer payment report', title: 'Officer payment report' },
  { key: 'missingPhotos', label: 'Missing photo report', title: 'Missing photo report' },
  { key: 'billing', label: 'Customer billing report', title: 'Customer billing report' },
  { key: 'officerHistory', label: 'Officer job history report', title: 'Officer job history report' },
];
const defaultReportTab = reportTabs[0] as { key: ReportKey; label: string; title: string };

const reportColumns: Record<ReportKey, ReportColumn[]> = {
  completed: [
    { key: 'job', label: 'Job' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'officers', label: 'Officers' },
    { key: 'totalPayable', label: 'Total payable' },
    { key: 'jobReport', label: 'Job report', exportable: false },
  ],
  payments: [
    { key: 'officer', label: 'Officer' },
    { key: 'job', label: 'Job' },
    { key: 'date', label: 'Date' },
    { key: 'hours', label: 'Hours' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
  ],
  missingPhotos: [
    { key: 'job', label: 'Job' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'checkpoint', label: 'Checkpoint' },
    { key: 'note', label: 'Note' },
  ],
  billing: [
    { key: 'job', label: 'Job' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'status', label: 'Status' },
  ],
  officerHistory: [
    { key: 'officer', label: 'Officer' },
    { key: 'job', label: 'Job' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ],
};

export function ReportsScreen({
  jobs,
  officers,
  payments,
  report,
  search,
  onOpenJob,
  onViewJobReport,
}: {
  jobs: Job[];
  officers: Officer[];
  payments: Payment[];
  report?: OperationsReport | null;
  search: string;
  onOpenJob?: (id: string) => void;
  onViewJobReport?: (id: string) => void;
}) {
  const [activeReport, setActiveReport] = useState<ReportKey>('completed');
  const defaultRange = useMemo(() => defaultDateRange(jobs, payments, report), [jobs, payments, report]);
  const localJobIds = useMemo(() => new Set(jobs.map((job) => job.id)), [jobs]);
  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [dateRangeEdited, setDateRangeEdited] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const query = search.trim().toLowerCase();

  useEffect(() => {
    if (dateRangeEdited) return;
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
  }, [dateRangeEdited, defaultRange.end, defaultRange.start]);

  const completedRows = useMemo<ReportRow[]>(
    () =>
      buildCompletedReportRows(jobs, payments, report).map((job) => ({
        id: job.id,
        date: job.date,
        canOpenJob: localJobIds.has(job.id),
        canViewJobReport: Boolean(jobsById.get(job.id)?.siteManagerSignedAt),
        jobId: job.id,
        cells: {
          job: job.id,
          customer: job.customer,
          date: dateLabel(job.date),
          officers: job.officers,
          totalPayable: money(job.totalPayable),
        },
      })),
    [jobs, jobsById, localJobIds, payments, report],
  );
  const reportRows = useMemo(
    () => ({
      completed: completedRows,
      payments: buildPaymentRows(payments, localJobIds),
      missingPhotos: buildMissingPhotoRows(jobs, localJobIds, report),
      billing: buildBillingRows(jobs, localJobIds),
      officerHistory: buildOfficerHistoryRows(jobs, localJobIds),
    }),
    [completedRows, jobs, localJobIds, payments, report],
  );
  const rows = reportRows[activeReport]
    .filter((row) => isWithinDateRange(row.date, startDate, endDate))
    .filter((row) => !query || reportRowSearchText(row).includes(query));
  const columns = reportColumns[activeReport];
  const active = reportTabs.find((tab) => tab.key === activeReport) ?? defaultReportTab;
  const reportSummary = buildReportSummary(activeReport, rows, officers);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = rows.slice(start, start + pageSize);
  const from = rows.length ? start + 1 : 0;
  const to = Math.min(start + pageSize, rows.length);

  useEffect(() => {
    setPage(1);
  }, [activeReport, endDate, pageSize, query, startDate]);

  return (
    <div className="pn-reports-screen">
      <div className="pn-report-tabs" aria-label="Report type">
        {reportTabs.map((tab) => (
          <button className={activeReport === tab.key ? 'active' : ''} key={tab.key} onClick={() => setActiveReport(tab.key)} type="button" aria-pressed={activeReport === tab.key}>
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="pn-report-card">
        <div className="pn-report-card-head">
          <h2>{active.title}</h2>
          <div className="pn-report-actions">
            <label className="pn-report-date-control">
              <CalendarIcon size={15} stroke="#A3A3A3" strokeWidth={2} />
              <input
                aria-label="Report start date"
                type="date"
                value={startDate}
                onChange={(event) => {
                  setDateRangeEdited(true);
                  setStartDate(event.target.value);
                }}
              />
              <span>-</span>
              <input
                aria-label="Report end date"
                type="date"
                value={endDate}
                onChange={(event) => {
                  setDateRangeEdited(true);
                  setEndDate(event.target.value);
                }}
              />
            </label>
            <Button variant="primary" onClick={() => exportReport(active.title, columns, rows, startDate, endDate)}>
              <DownloadIcon size={15} strokeWidth={2.1} />
              Export
            </Button>
          </div>
        </div>

        <div className={`pn-table pn-table-report pn-table-report-${activeReport}`}>
          <div className="pn-table-head">
            {columns.map((column) => (
              <span key={column.key}>{column.label}</span>
            ))}
          </div>
          {visibleRows.map((row) => (
            <div className="pn-table-row" key={row.id}>
              {columns.map((column) => (
                <span key={column.key}>{renderReportCell(activeReport, row, column, onOpenJob, onViewJobReport)}</span>
              ))}
            </div>
          ))}
          {!rows.length ? <div className="pn-empty">No records match this report date range.</div> : null}
        </div>

        <div className="pn-report-total">{reportSummary}</div>
      </Card>
      <Pagination
        from={from}
        label="Report"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        page={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        showSinglePage={rows.length > 0}
        to={to}
        total={rows.length}
      />
    </div>
  );
}

function reportRowSearchText(row: ReportRow) {
  return [
    row.id,
    row.date,
    dateLabel(row.date),
    ...Object.values(row.cells).map((value) => String(value)),
  ]
    .join(' ')
    .toLowerCase();
}

function renderReportCell(activeReport: ReportKey, row: ReportRow, column: ReportColumn, onOpenJob?: (id: string) => void, onViewJobReport?: (id: string) => void) {
  if (column.key === 'job') {
    const jobId = row.jobId ?? String(row.cells.job ?? '');
    const canOpenJob = Boolean(row.canOpenJob && jobId && onOpenJob);

    if (canOpenJob) {
      return (
        <button
          aria-label={`Open job ${jobId}`}
          className="pn-report-job-link"
          onClick={() => {
            onOpenJob?.(jobId);
          }}
          type="button"
        >
          {row.cells[column.key]}
        </button>
      );
    }
  }

  if (activeReport === 'completed' && column.key === 'jobReport') {
    const canOpenReport = Boolean(row.canViewJobReport && row.jobId && onViewJobReport);

    return (
      <button
        aria-label={`View job report for ${row.id}`}
        className="pn-report-view-btn"
        disabled={!canOpenReport}
        onClick={() => {
          if (row.jobId) onViewJobReport?.(row.jobId);
        }}
        type="button"
      >
        <EyeIcon size={13} strokeWidth={2} />
        View
      </button>
    );
  }

  return row.cells[column.key];
}

function buildCompletedReportRows(jobs: Job[], payments: Payment[], report?: OperationsReport | null) {
  const localRows = buildCompletedRows(jobs, payments);
  if (!report?.completedJobs.length) return localRows;

  const localById = new Map(localRows.map((job) => [job.id, job]));
  const rows = report.completedJobs.map((apiJob) => {
    const localJob = localById.get(apiJob.id);
    if (!localJob) return apiJob;
    return {
      ...apiJob,
      ...localJob,
      billingStatus: apiJob.billingStatus,
    };
  });

  localRows.forEach((job) => {
    if (!rows.some((row) => row.id === job.id)) rows.push(job);
  });

  return rows;
}

function buildCompletedRows(jobs: Job[], payments: Payment[]): OperationsReport['completedJobs'] {
  const paymentsByJob = payments.reduce<Record<string, { officers: Set<string>; totalPayable: number }>>((totals, payment) => {
    const total = totals[payment.jobId] ?? { officers: new Set<string>(), totalPayable: 0 };
    total.officers.add(payment.officer);
    total.totalPayable += payment.hours * payment.rate;
    totals[payment.jobId] = total;
    return totals;
  }, {});

  return jobs
    .filter((job) => job.status === 'Completed')
    .map((job) => ({
      id: job.id,
      customer: job.customer,
      site: job.location,
      date: job.date,
      officers: job.officers.length || paymentsByJob[job.id]?.officers.size || 0,
      totalPayable: jobPay(job) || paymentsByJob[job.id]?.totalPayable || 0,
      billingStatus: job.billing === 'Billed' ? 'BILLED' : 'NOT_BILLED',
    }));
}

function buildPaymentRows(payments: Payment[], localJobIds: Set<string>): ReportRow[] {
  return payments.map((payment) => ({
    id: payment.id,
    date: payment.jobDate,
    canOpenJob: localJobIds.has(payment.jobId),
    jobId: payment.jobId,
    cells: {
      officer: payment.officer,
      job: payment.jobId,
      date: dateLabel(payment.jobDate),
      hours: `${payment.hours.toFixed(2)}h`,
      total: money(payment.hours * payment.rate),
      status: payment.status,
    },
  }));
}

function buildMissingPhotoRows(jobs: Job[], localJobIds: Set<string>, report?: OperationsReport | null): ReportRow[] {
  const localRows = jobs.flatMap((job) =>
    job.photos
      .filter((photo) => photo.status === 'missing')
      .map((photo, index) => ({
        id: `${job.id}-${photo.time}-${index}`,
        date: job.date,
        canOpenJob: localJobIds.has(job.id),
        jobId: job.id,
        cells: {
          job: job.id,
          customer: job.customer,
          date: dateLabel(job.date),
          checkpoint: photo.time,
          note: photo.note || 'Missing checkpoint photo',
        },
      })),
  );

  if (!report?.missingCheckpoints.length) return localRows;

  const rows: ReportRow[] = report.missingCheckpoints.map((checkpoint) => ({
    id: checkpoint.id,
    date: checkpoint.date,
    canOpenJob: localJobIds.has(checkpoint.job),
    jobId: checkpoint.job,
    cells: {
      job: checkpoint.job,
      customer: checkpoint.customer,
      date: dateLabel(checkpoint.date),
      checkpoint: checkpoint.checkpoint,
      note: checkpoint.note,
    },
  }));
  const apiKeys = new Set(rows.map((row) => missingPhotoRowKey(row)));

  localRows.forEach((row) => {
    if (!apiKeys.has(missingPhotoRowKey(row))) rows.push(row);
  });

  return rows;
}

function missingPhotoRowKey(row: ReportRow) {
  return `${row.cells.job}|${row.date}|${row.cells.checkpoint}`;
}

function buildBillingRows(jobs: Job[], localJobIds: Set<string>): ReportRow[] {
  return jobs
    .filter((job) => job.status === 'Completed')
    .map((job) => ({
      id: job.id,
      date: job.date,
      canOpenJob: localJobIds.has(job.id),
      jobId: job.id,
      cells: {
        job: job.id,
        customer: job.customer,
        date: dateLabel(job.date),
        invoice: job.invoice || '-',
        status: job.billing,
      },
    }));
}

function buildOfficerHistoryRows(jobs: Job[], localJobIds: Set<string>): ReportRow[] {
  return jobs.flatMap((job) =>
    job.officers.map((officer) => ({
      id: `${job.id}-${officer.oid}`,
      date: job.date,
      canOpenJob: localJobIds.has(job.id),
      jobId: job.id,
      cells: {
        officer: officer.name,
        job: job.id,
        customer: job.customer,
        date: dateLabel(job.date),
        status: job.status,
      },
    })),
  );
}

function defaultDateRange(jobs: Job[], payments: Payment[], report?: OperationsReport | null) {
  const dates = [
    ...jobs.map((job) => job.date),
    ...payments.map((payment) => payment.jobDate),
    ...(report?.completedJobs.map((job) => job.date) ?? []),
    ...(report?.missingCheckpoints.map((checkpoint) => checkpoint.date) ?? []),
  ].filter(Boolean).sort();
  return {
    start: dates[0] ?? '',
    end: dates[dates.length - 1] ?? '',
  };
}

function isWithinDateRange(date: string, start: string, end: string) {
  return (!start || date >= start) && (!end || date <= end);
}

function parseMoney(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildReportSummary(activeReport: ReportKey, rows: ReportRow[], officers: Officer[]) {
  if (activeReport === 'completed') {
    const totalPayroll = rows.reduce((sum, row) => sum + parseMoney(String(row.cells.totalPayable)), 0);
    return `${rows.length} completed job(s), Total payroll: ${money(totalPayroll)}`;
  }

  if (activeReport === 'payments') {
    const totalPayroll = rows.reduce((sum, row) => sum + parseMoney(String(row.cells.total)), 0);
    const pending = rows.filter((row) => row.cells.status === 'Pending').length;
    const paid = rows.filter((row) => row.cells.status === 'Paid').length;
    return `Total payroll: ${money(totalPayroll)}, ${pending} pending payout(s), ${paid} paid payout(s)`;
  }

  if (activeReport === 'missingPhotos') {
    return `${rows.length} missing checkpoint(s)`;
  }

  if (activeReport === 'billing') {
    const notBilled = rows.filter((row) => row.cells.status === 'Not Billed').length;
    return `${notBilled} job(s) not yet billed`;
  }

  return `${officers.length} officers on record`;
}

function exportReport(title: string, columns: ReportColumn[], rows: ReportRow[], startDate: string, endDate: string) {
  const exportColumns = columns.filter((column) => column.exportable !== false);
  const header = exportColumns.map((column) => column.label);
  const body = rows.map((row) => exportColumns.map((column) => row.cells[column.key]));
  const csv = [
    [title],
    [`Date range: ${startDate || 'All'} to ${endDate || 'All'}`],
    [],
    header,
    ...body,
  ]
    .map((line) => line.map(csvCell).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | undefined) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
