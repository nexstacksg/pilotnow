import { hours } from './format';
import type { OfficerAssignmentHistory } from './officers-api';
import type { Job, JobStatus, Officer, Payment, PaymentStatus } from '../types';

export type OfficerHistoryRow = {
  jobId: string;
  customer: string;
  date: string;
  worked: number;
  pay: number;
  status: JobStatus;
  paymentId: string;
  paymentStatus: PaymentStatus;
};

export function buildOfficerHistoryRows({
  assignmentHistory,
  jobs,
  officer,
  payments,
}: {
  assignmentHistory: OfficerAssignmentHistory[];
  jobs: Job[];
  officer: Officer;
  payments: Payment[];
}) {
  const paymentStatusForHistory = createPaymentStatusResolver(payments, officer.name);

  const apiRows = assignmentHistory.map((item): OfficerHistoryRow => ({
    jobId: item.jobId,
    customer: item.customerName,
    date: item.date,
    worked: item.hours,
    pay: item.payable,
    status: item.status,
    paymentId: item.id,
    paymentStatus: paymentStatusForHistory(item.id, item.jobId, item.paymentStatus),
  }));

  const localRows = jobs
    .map((job) => {
      const assigned = job.officers.find((item) => item.oid === officer.id);
      if (!assigned) return null;
      const scheduled = hours(job.start, job.end);
      const worked = assigned.actualStart && assigned.actualEnd ? hours(assigned.actualStart, assigned.actualEnd) : job.status === 'Completed' || assigned.actualStart ? scheduled : 0;

      return {
        jobId: job.id,
        customer: job.customer,
        date: job.date,
        worked,
        pay: worked * assigned.rate,
        status: job.status,
        paymentStatus: paymentStatusForHistory('', job.id, 'Pending'),
        paymentId: '',
      };
    })
    .filter((item): item is OfficerHistoryRow => Boolean(item))
    .sort((a, b) => b.date.localeCompare(a.date) || b.jobId.localeCompare(a.jobId));

  if (!apiRows.length) return localRows;

  const apiJobIds = new Set(apiRows.map((item) => item.jobId));
  return [
    ...apiRows,
    ...localRows.filter((item) => !apiJobIds.has(item.jobId)),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.jobId.localeCompare(a.jobId));
}

export function summarizeOfficerHistory(rows: OfficerHistoryRow[]) {
  const completed = rows.filter((item) => item.status === 'Completed');

  return {
    completed,
    totalHours: completed.reduce((sum, item) => sum + item.worked, 0),
    totalPay: completed.reduce((sum, item) => sum + item.pay, 0),
  };
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number) {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const from = total ? (currentPage - 1) * pageSize + 1 : 0;
  const to = Math.min(currentPage * pageSize, total);

  return {
    currentPage,
    from,
    pageCount,
    rows: rows.slice(from ? from - 1 : 0, to),
    to,
    total,
  };
}

function createPaymentStatusResolver(payments: Payment[], officerName: string) {
  const paymentById = new Map(payments.map((payment) => [payment.id, payment]));
  const paymentByJobOfficer = new Map(payments.map((payment) => [`${payment.jobId}::${payment.officer.toLowerCase()}`, payment]));

  return (id: string, jobId: string, fallback: PaymentStatus): PaymentStatus => {
    const payment = paymentById.get(id) ?? paymentByJobOfficer.get(`${jobId}::${officerName.toLowerCase()}`);
    return payment?.status === 'Paid' || fallback === 'Paid' ? 'Paid' : 'Pending';
  };
}
