import { http } from '../../../lib/api';
import type { Job, JobStatus } from '../types';

export type DashboardJob = {
  id: string;
  customer: string;
  location: string;
  startAt: string;
  endAt: string;
  required: number;
  assigned: number;
  status: JobStatus;
  proofStatus: 'MISSING' | 'RECEIVED' | 'NOT_DUE';
  billingStatus: 'NOT_BILLED' | 'BILLED';
  hasUnpaidPayables: boolean;
};

export type DashboardSnapshot = {
  source: 'live' | 'fallback';
  operatingDate: string;
  generatedAt: string;
  metrics: {
    todayJobs: number;
    waitingJobs: number;
    ongoingJobs: number;
    missingPhotos: number;
    officersNeeded: number;
    notBilled: number;
    unpaidPayables: number;
  };
  todayJobs: DashboardJob[];
  missingProofs: { jobId: string; customer: string; officer: string; expectedAt: string }[];
  unbilledJobs: DashboardJob[];
  queues: DashboardQueues;
};

export type DashboardQueues = {
  todayJobs: string[];
  waitingJobs: string[];
  ongoingJobs: string[];
  missingPhotos: string[];
  unbilledJobs: string[];
};

type ApiDashboardJob = Omit<DashboardJob, 'status'> & {
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
};

type ApiDashboardSnapshot = Omit<DashboardSnapshot, 'source' | 'todayJobs' | 'unbilledJobs'> & {
  todayJobs: ApiDashboardJob[];
  unbilledJobs: ApiDashboardJob[];
};

const statusFromApi: Record<ApiDashboardJob['status'], JobStatus> = {
  OPEN: 'Posted/Waiting',
  ASSIGNED: 'Officers confirmed',
  IN_PROGRESS: 'Job ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function operatingDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function localDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+08:00`).toISOString();
}

function fromApiJob(job: ApiDashboardJob): DashboardJob {
  return { ...job, status: statusFromApi[job.status] };
}

export async function fetchDashboard() {
  const payload = await http.get<{ item: ApiDashboardSnapshot }>('/dashboard');
  return {
    ...payload.item,
    source: 'live' as const,
    todayJobs: payload.item.todayJobs.map(fromApiJob),
    unbilledJobs: payload.item.unbilledJobs.map(fromApiJob),
  };
}

export function dashboardFallback(jobs: Job[], now = new Date()): DashboardSnapshot {
  const date = operatingDate(now);
  const toItem = (job: Job): DashboardJob => {
    const startAt = localDateTime(job.date, job.start);
    const sameDayEnd = new Date(localDateTime(job.date, job.end));
    if (sameDayEnd.getTime() <= new Date(startAt).getTime()) sameDayEnd.setUTCDate(sameDayEnd.getUTCDate() + 1);
    return {
      id: job.id,
      customer: job.customer,
      location: job.location,
      startAt,
      endAt: sameDayEnd.toISOString(),
      required: job.required,
      assigned: job.officers.length,
      status: job.status,
      proofStatus: job.photos.some((photo) => photo.status === 'missing') ? 'MISSING' : job.photos.some((photo) => photo.status === 'received') ? 'RECEIVED' : 'NOT_DUE',
      billingStatus: job.billing === 'Billed' ? 'BILLED' : 'NOT_BILLED',
      hasUnpaidPayables: false,
    };
  };
  const items = jobs.map(toItem);
  const todayJobs = jobs.filter((job) => job.date === date && job.status !== 'Cancelled').map(toItem);
  const missingProofs = jobs.flatMap((job) =>
    job.photos
      .filter((photo) => photo.status === 'missing')
      .map((photo) => ({ jobId: job.id, customer: job.customer, officer: photo.by || 'Officer not recorded', expectedAt: localDateTime(job.date, photo.time) })),
  );
  const unbilledJobs = items.filter((job) => job.status === 'Completed' && job.billingStatus === 'NOT_BILLED');
  const waitingJobs = todayJobs.filter((job) => job.status !== 'Completed' && job.assigned < job.required);
  const ongoingJobs = items.filter((job) => job.status === 'Job ongoing');

  return {
    source: 'fallback',
    operatingDate: date,
    generatedAt: now.toISOString(),
    metrics: {
      todayJobs: todayJobs.length,
      waitingJobs: waitingJobs.length,
      ongoingJobs: ongoingJobs.length,
      missingPhotos: missingProofs.length,
      officersNeeded: waitingJobs.reduce((sum, job) => sum + Math.max(0, job.required - job.assigned), 0),
      notBilled: unbilledJobs.length,
      unpaidPayables: 0,
    },
    todayJobs,
    missingProofs,
    unbilledJobs,
    queues: {
      todayJobs: todayJobs.map((job) => job.id),
      waitingJobs: waitingJobs.map((job) => job.id),
      ongoingJobs: ongoingJobs.map((job) => job.id),
      missingPhotos: [...new Set(missingProofs.map((proof) => proof.jobId))],
      unbilledJobs: unbilledJobs.map((job) => job.id),
    },
  };
}
