import type { Job, JobStatus, OfficerStatus } from '../types';

export const TODAY = '2026-07-08';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function money(value: number) {
  return 'S$' + value.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function dateLabel(value: string) {
  const [year, month, day] = value.split('-');
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function hours(start: string, end: string) {
  if (!start || !end) return 0;
  const [h1 = 0, m1 = 0] = start.split(':').map(Number);
  const [h2 = 0, m2 = 0] = end.split(':').map(Number);
  let delta = h2 * 60 + m2 - (h1 * 60 + m1);
  if (delta < 0) delta += 1440;
  return Math.round((delta / 60) * 100) / 100;
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function nextId(prefix: string, ids: string[], pad = 0) {
  const next = Math.max(0, ...ids.map((id) => Number(id.replace(prefix, '')) || 0)) + 1;
  return prefix + String(next).padStart(pad, '0');
}

export function jobPay(job: Job) {
  const scheduled = hours(job.start, job.end);
  return job.officers.reduce((sum, officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled;
    return sum + worked * officer.rate;
  }, 0);
}

export function scheduledStatus(job: Job, now = new Date()): JobStatus {
  if (job.status === 'Cancelled' || job.status === 'Completed') return job.status;
  if (job.status === 'Draft Created' && !job.posted) return job.status;
  if (job.officers.length && job.officers.every((officer) => officer.actualEnd)) return 'Awaiting sign-off';
  const start = new Date(`${job.date}T${job.start}:00`);
  const end = new Date(`${job.date}T${job.end}:00`);
  if (end <= start) end.setDate(end.getDate() + 1);
  if (now >= start) return 'Job ongoing';
  return job.officers.length >= job.required && job.officers.every((officer) => officer.confirmed) ? 'Officers confirmed' : 'Posted/Waiting';
}

export function normalizeJobStage(job: Job, now = new Date()): Job {
  const status = scheduledStatus(job, now);
  if (status !== 'Completed') return status === job.status ? job : { ...job, status };
  const officers = job.officers.map((officer) => ({
    ...officer,
    confirmed: true,
    onDuty: true,
    actualStart: officer.actualStart || job.start,
    actualEnd: officer.actualEnd || job.end,
  }));
  return { ...job, status, officers };
}

export const statusTone: Record<JobStatus, 'muted' | 'success' | 'warning' | 'info' | 'danger'> = {
  'Draft Created': 'muted',
  'Posted/Waiting': 'warning',
  'Officers confirmed': 'info',
  'Job ongoing': 'info',
  'Awaiting sign-off': 'warning',
  Completed: 'success',
  Cancelled: 'danger',
};

export const officerStatusLabel: Record<OfficerStatus, string> = {
  New: 'Onboarding',
  Active: 'Active',
  Inactive: 'Inactive',
  Blocked: 'Blocked',
};

export const officerStatusTone: Record<OfficerStatus, 'muted' | 'success' | 'warning' | 'info' | 'danger'> = {
  New: 'warning',
  Active: 'success',
  Inactive: 'muted',
  Blocked: 'danger',
};

export function icDocumentLabel(hasIc: boolean) {
  return hasIc ? 'IC verified' : 'IC missing';
}
