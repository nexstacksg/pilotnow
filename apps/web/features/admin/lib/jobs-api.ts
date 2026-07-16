import { http } from '../../../lib/api';
import type { Job, JobForm, JobStatus } from '../types';

type ApiJobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ApiBillingStatus = 'NOT_BILLED' | 'BILLED';
type ApiRecordState = 'DRAFT' | 'CONFIRMED';

type ApiJob = {
  id: string;
  customer: { id: string; name: string; contact: string | null };
  site: { id: string; name: string; address: string | null };
  startAt: string;
  endAt: string;
  headcountRequired: number;
  instructions: string | null;
  requestSource: string | null;
  requestRaw: string | null;
  status: ApiJobStatus;
  billingStatus: ApiBillingStatus;
  invoiceNumber: string | null;
  billedAt: string | null;
  recordState: ApiRecordState;
  postedToGroupAt: string | null;
  createdAt: string;
  assignments?: {
    officerId: string;
    officerName: string;
    icVerified: boolean;
    rate: string | number | null;
    confirmed: boolean;
    onDuty: boolean;
    checkInAt: string | null;
    checkOutAt: string | null;
  }[];
  proofPhotos?: {
    id: string;
    officerId: string;
    officerName: string;
    mediaRef: string;
    proofWindow: string | null;
    receivedAt: string;
  }[];
};

async function withServerMessage<T>(request: Promise<T>) {
  try {
    return await request;
  } catch (error) {
    if (error && typeof error === 'object' && 'body' in error) {
      const body = (error as { body?: unknown }).body;
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        throw new Error(body.error);
      }
    }
    throw error;
  }
}

function statusFromApi(job: ApiJob): JobStatus {
  if (job.status === 'CANCELLED') return 'Cancelled';
  if (job.status === 'COMPLETED') return 'Completed';
  if (job.status === 'IN_PROGRESS') return 'Job ongoing';
  if (job.status === 'ASSIGNED') return 'Officers confirmed';
  if (!job.postedToGroupAt) return 'Draft Created';
  return 'Posted/Waiting';
}

function splitIso(value: string) {
  return { date: value.slice(0, 10), time: value.slice(11, 16) };
}

function jobDateTime(date: string, time: string, nextDay = false) {
  const value = new Date(`${date}T${time}:00.000Z`);
  if (nextDay) value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString();
}

function timeLabel(value: string | null) {
  return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
}

function proofTimeLabel(proofWindow: string | null, receivedAt: string) {
  if (proofWindow && !proofWindow.includes('T')) return proofWindow;
  if (proofWindow?.includes('T')) return timeLabel(proofWindow.slice(0, 16));
  return timeLabel(receivedAt);
}

function mergeJob(apiJob: ApiJob, previous?: Job): Job {
  const start = splitIso(apiJob.startAt);
  const end = splitIso(apiJob.endAt);
  const previousOfficers = previous?.officers ?? [];
  const officers = apiJob.assignments?.length
    ? apiJob.assignments.map((assignment) => {
      const existing = previousOfficers.find((officer) => officer.oid === assignment.officerId);
      return {
        oid: assignment.officerId,
        name: assignment.officerName,
        ic: assignment.icVerified,
        rate: Number(assignment.rate ?? existing?.rate ?? 0),
        confirmed: assignment.confirmed,
        onDuty: assignment.onDuty,
        actualStart: timeLabel(assignment.checkInAt) || existing?.actualStart || '',
        actualEnd: timeLabel(assignment.checkOutAt) || existing?.actualEnd || '',
      };
    })
    : previousOfficers;
  const photos = apiJob.proofPhotos?.length
    ? apiJob.proofPhotos.map((photo) => ({
      time: proofTimeLabel(photo.proofWindow, photo.receivedAt),
      status: 'received' as const,
      by: photo.officerName,
      at: timeLabel(photo.receivedAt),
      mediaRef: `/api/jobs/${encodeURIComponent(apiJob.id)}/proof-photos/${encodeURIComponent(photo.id)}`,
      note: photo.proofWindow ?? undefined,
    }))
    : previous?.photos ?? [];

  return {
    id: apiJob.id,
    customer: apiJob.customer.name,
    location: apiJob.site.address || apiJob.site.name,
    date: start.date,
    start: start.time,
    end: end.time,
    required: apiJob.headcountRequired,
    status: statusFromApi(apiJob),
    posted: Boolean(apiJob.postedToGroupAt),
    description: apiJob.requestRaw || previous?.description || 'No description provided.',
    instructions: apiJob.instructions || '',
    cancelReason: apiJob.status === 'CANCELLED' ? previous?.cancelReason || 'Cancelled by admin' : '',
    officers,
    photos,
    billing: apiJob.billingStatus === 'BILLED' ? 'Billed' : 'Not Billed',
    invoice: apiJob.invoiceNumber ?? previous?.invoice ?? '',
    billedDate: apiJob.billedAt ? apiJob.billedAt.slice(0, 10) : previous?.billedDate ?? '',
  };
}

function newestApiJobsFirst(a: ApiJob, b: ApiJob) {
  return b.createdAt.localeCompare(a.createdAt);
}

export async function fetchJobs(current: Job[]) {
  const payload = await withServerMessage(http.get<{ items: ApiJob[] }>('/jobs'));
  return payload.items.slice().sort(newestApiJobsFirst).map((item) => mergeJob(item, current.find((job) => job.id === item.id)));
}

export async function fetchCompletedJobs(current: Job[]) {
  const payload = await withServerMessage(http.get<{ items: ApiJob[] }>('/jobs?status=COMPLETED'));
  return payload.items.slice().sort(newestApiJobsFirst).map((item) => mergeJob(item, current.find((job) => job.id === item.id)));
}

export async function createJobFromForm(form: JobForm) {
  const endNextDay = form.end <= form.start;
  const payload = await withServerMessage(http.post<{ item: ApiJob }>('/jobs', {
    customerName: form.customer.trim(),
    siteName: form.location.trim(),
    siteAddress: form.location.trim(),
    startAt: jobDateTime(form.date, form.start),
    endAt: jobDateTime(form.date, form.end, endNextDay),
    headcountRequired: Number(form.required) || 1,
    instructions: form.instructions.trim() || undefined,
    requestSource: 'admin',
    requestRaw: form.description.trim() || undefined,
  }));

  return mergeJob(payload.item);
}

export async function updateJobFromForm(id: string, form: JobForm, previous?: Job) {
  const endNextDay = form.end <= form.start;
  const payload = await withServerMessage(http.patch<{ item: ApiJob }>(`/jobs/${id}`, {
    customerName: form.customer.trim(),
    siteName: form.location.trim(),
    siteAddress: form.location.trim(),
    startAt: jobDateTime(form.date, form.start),
    endAt: jobDateTime(form.date, form.end, endNextDay),
    headcountRequired: Number(form.required) || 1,
    instructions: form.instructions.trim() || null,
    requestSource: 'admin',
    requestRaw: form.description.trim() || null,
  }));

  return mergeJob(payload.item, previous);
}

export async function markJobPostedInApi(id: string, previous?: Job) {
  const payload = await withServerMessage(http.post<{ item: ApiJob }>(`/jobs/${id}/post`, {}));
  return mergeJob(payload.item, previous);
}

export async function completeJobInApi(id: string, previous?: Job) {
  const payload = await withServerMessage(http.post<{ item: ApiJob }>(`/jobs/${id}/complete`));
  return mergeJob(payload.item, previous);
}

export async function cancelJobInApi(id: string, previous?: Job) {
  const payload = await withServerMessage(http.delete<{ item: ApiJob }>(`/jobs/${id}`));
  return mergeJob(payload.item, previous);
}

export async function createOfficerJobToken(jobId: string, hp: string) {
  return withServerMessage(http.post<{ token: string; expiresAt: string }>(`/officer-jobs/${encodeURIComponent(jobId)}/token`, { hp }));
}

export async function createSignReportToken(jobId: string) {
  return withServerMessage(http.post<{ token: string }>(`/jobs/${encodeURIComponent(jobId)}/sign-token`, {}));
}
