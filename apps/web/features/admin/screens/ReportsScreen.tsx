import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon, DownloadIcon } from '../components/icons';
import { Button, Card } from '../components/ui';
import { dateLabel, jobPay, money } from '../lib/format';
import type { OperationsReport } from '../lib/reports-api';
import type { Job, Officer, Payment } from '../types';

type ReportKey = 'completed' | 'payments' | 'missingPhotos' | 'billing' | 'officerHistory';
type ReportColumn = {
  key: string;
  label: string;
};
type ReportRow = {
  id: string;
  date: string;
  cells: Record<string, string | number>;
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

export function ReportsScreen({ jobs, officers, payments, report }: { jobs: Job[]; officers: Officer[]; payments: Payment[]; report?: OperationsReport | null }) {
  const [activeReport, setActiveReport] = useState<ReportKey>('completed');
  const defaultRange = useMemo(() => defaultDateRange(jobs, payments), [jobs, payments]);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [dateRangeEdited, setDateRangeEdited] = useState(false);

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
        cells: {
          job: job.id,
          customer: job.customer,
          date: dateLabel(job.date),
          officers: job.officers,
          totalPayable: money(job.totalPayable),
        },
      })),
    [jobs, payments, report],
  );
  const reportRows = useMemo(
    () => ({
      completed: completedRows,
      payments: buildPaymentRows(payments),
      missingPhotos: buildMissingPhotoRows(jobs),
      billing: buildBillingRows(jobs),
      officerHistory: buildOfficerHistoryRows(jobs),
    }),
    [completedRows, jobs, payments],
  );
  const rows = reportRows[activeReport].filter((row) => isWithinDateRange(row.date, startDate, endDate));
  const columns = reportColumns[activeReport];
  const active = reportTabs.find((tab) => tab.key === activeReport) ?? defaultReportTab;
  const totalPayable = activeReport === 'completed' ? rows.reduce((sum, row) => sum + parseMoney(String(row.cells.totalPayable)), 0) : null;

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
          {rows.map((row) => (
            <div className="pn-table-row" key={row.id}>
              {columns.map((column) => (
                <span key={column.key}>{row.cells[column.key]}</span>
              ))}
            </div>
          ))}
          {!rows.length ? <div className="pn-empty">No records match this report date range.</div> : null}
        </div>

        {totalPayable !== null ? <div className="pn-report-total">Total payable across jobs: {money(totalPayable)}</div> : null}
      </Card>
    </div>
  );
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

function buildPaymentRows(payments: Payment[]): ReportRow[] {
  return payments.map((payment) => ({
    id: payment.id,
    date: payment.jobDate,
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

function buildMissingPhotoRows(jobs: Job[]): ReportRow[] {
  return jobs.flatMap((job) =>
    job.photos
      .filter((photo) => photo.status === 'missing')
      .map((photo, index) => ({
        id: `${job.id}-${photo.time}-${index}`,
        date: job.date,
        cells: {
          job: job.id,
          customer: job.customer,
          date: dateLabel(job.date),
          checkpoint: photo.time,
          note: photo.note || 'Missing checkpoint photo',
        },
      })),
  );
}

function buildBillingRows(jobs: Job[]): ReportRow[] {
  return jobs
    .filter((job) => job.status === 'Completed')
    .map((job) => ({
      id: job.id,
      date: job.date,
      cells: {
        job: job.id,
        customer: job.customer,
        date: dateLabel(job.date),
        invoice: job.invoice || '-',
        status: job.billing,
      },
    }));
}

function buildOfficerHistoryRows(jobs: Job[]): ReportRow[] {
  return jobs.flatMap((job) =>
    job.officers.map((officer) => ({
      id: `${job.id}-${officer.oid}`,
      date: job.date,
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

function defaultDateRange(jobs: Job[], payments: Payment[]) {
  const dates = [...jobs.map((job) => job.date), ...payments.map((payment) => payment.jobDate)].filter(Boolean).sort();
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

function exportReport(title: string, columns: ReportColumn[], rows: ReportRow[], startDate: string, endDate: string) {
  const header = columns.map((column) => column.label);
  const body = rows.map((row) => columns.map((column) => row.cells[column.key]));
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
