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
  recordState: ApiRecordState;
  postedToGroupAt: string | null;
  createdAt: string;
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
  if (job.status === 'IN_PROGRESS') return 'Ongoing';
  if (job.status === 'ASSIGNED') return 'Confirmed';
  if (job.recordState === 'DRAFT' || !job.postedToGroupAt) return 'Draft';
  return 'Waiting for Officers';
}

function splitIso(value: string) {
  return { date: value.slice(0, 10), time: value.slice(11, 16) };
}

function jobDateTime(date: string, time: string, nextDay = false) {
  const value = new Date(`${date}T${time}:00.000Z`);
  if (nextDay) value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString();
}

function mergeJob(apiJob: ApiJob, previous?: Job): Job {
  const start = splitIso(apiJob.startAt);
  const end = splitIso(apiJob.endAt);

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
    officers: previous?.officers ?? [],
    photos: previous?.photos ?? [],
    billing: apiJob.billingStatus === 'BILLED' ? 'Billed' : 'Not Billed',
    invoice: previous?.invoice ?? '',
    billedDate: previous?.billedDate ?? '',
  };
}

export async function fetchJobs(current: Job[]) {
  const payload = await withServerMessage(http.get<{ items: ApiJob[] }>('/jobs'));
  return payload.items.map((item) => mergeJob(item, current.find((job) => job.id === item.id)));
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

export async function completeJobInApi(id: string, previous?: Job) {
  const payload = await withServerMessage(http.post<{ item: ApiJob }>(`/jobs/${id}/complete`));
  return mergeJob(payload.item, previous);
}

export async function cancelJobInApi(id: string, previous?: Job) {
  const payload = await withServerMessage(http.delete<{ item: ApiJob }>(`/jobs/${id}`));
  return mergeJob(payload.item, previous);
}
