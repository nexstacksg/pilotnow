import { http } from '../../../lib/api';
import type { JobStatus, Officer, OfficerForm, OfficerStatus, PaymentStatus } from '../types';

type ApiOfficerStatus = 'NEW' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
type ApiJobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ApiPaymentStatus = 'UNPAID' | 'PAID';

type ApiOfficer = {
  id: string;
  officerCode?: string;
  name: string;
  phone: string;
  status: ApiOfficerStatus;
  active: boolean;
  icVerified: boolean;
  icMasked: string | null;
  defaultHourlyRate: number;
  onboardingNote: unknown;
  jobsCount: number;
  createdAt: string;
};

type ApiOfficerAssignment = {
  id: string;
  jobId: string;
  customerName: string;
  siteName: string;
  date: string;
  startAt: string;
  endAt: string;
  rateAgreed: number;
  hoursWorked: number;
  payable: number;
  currency: string;
  status: ApiJobStatus;
  ackStatus: 'PENDING' | 'ACKNOWLEDGED' | 'DECLINED' | 'NO_RESPONSE';
  paymentStatus: ApiPaymentStatus;
};

export type OfficerAssignmentHistory = {
  id: string;
  jobId: string;
  customerName: string;
  siteName: string;
  date: string;
  rate: number;
  hours: number;
  payable: number;
  status: JobStatus;
  paymentStatus: PaymentStatus;
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

function statusFromApi(status: ApiOfficerStatus): OfficerStatus {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'INACTIVE') return 'Inactive';
  if (status === 'BLOCKED') return 'Blocked';
  return 'New';
}

function statusToApi(status: OfficerStatus): ApiOfficerStatus {
  if (status === 'Active') return 'ACTIVE';
  if (status === 'Inactive') return 'INACTIVE';
  if (status === 'Blocked') return 'BLOCKED';
  return 'NEW';
}

function jobStatusFromApi(status: ApiJobStatus): JobStatus {
  if (status === 'ASSIGNED') return 'Assigned';
  if (status === 'IN_PROGRESS') return 'Ongoing';
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'CANCELLED') return 'Cancelled';
  return 'Open';
}

function paymentStatusFromApi(status: ApiPaymentStatus): PaymentStatus {
  return status === 'PAID' ? 'Paid' : 'Pending';
}

function fallbackOfficerCode(id: string, index = 0) {
  if (/^OF-\d+$/i.test(id)) return id.toUpperCase();
  return `OF-${String(index + 1).padStart(2, '0')}`;
}

function noteFromApi(value: unknown) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  if ('notes' in value && typeof value.notes === 'string') return value.notes;
  if ('note' in value && typeof value.note === 'string') return value.note;
  if ('text' in value && typeof value.text === 'string') return value.text;
  return '';
}

function mergeOfficer(apiOfficer: ApiOfficer, index = 0): Officer {
  const code = apiOfficer.officerCode ?? fallbackOfficerCode(apiOfficer.id, index);
  return {
    id: apiOfficer.id,
    code,
    name: apiOfficer.name,
    phone: apiOfficer.phone,
    status: statusFromApi(apiOfficer.status),
    ic: apiOfficer.icVerified,
    rate: apiOfficer.defaultHourlyRate,
    jobsCount: apiOfficer.jobsCount,
    notes: noteFromApi(apiOfficer.onboardingNote),
  };
}

export async function fetchOfficers() {
  const payload = await withServerMessage(http.get<{ items: ApiOfficer[] }>('/officers'));
  return payload.items.map((item, index) => mergeOfficer(item, index));
}

export async function fetchOfficerAssignmentHistory(id: string) {
  const payload = await withServerMessage(http.get<{ items: ApiOfficerAssignment[] }>(`/officers/${id}/jobs`));
  return payload.items.map((item): OfficerAssignmentHistory => ({
    id: item.id,
    jobId: item.jobId,
    customerName: item.customerName,
    siteName: item.siteName,
    date: item.date,
    rate: item.rateAgreed,
    hours: item.hoursWorked,
    payable: item.payable,
    status: jobStatusFromApi(item.status),
    paymentStatus: paymentStatusFromApi(item.paymentStatus),
  }));
}

export async function createOfficerFromForm(form: OfficerForm) {
  const payload = await withServerMessage(http.post<{ item: ApiOfficer }>('/officers', {
    name: form.name.trim(),
    phone: form.phone.trim(),
    status: form.ic ? 'ACTIVE' : 'NEW',
    icVerified: form.ic,
    defaultHourlyRate: Number(form.rate) || 14,
    onboardingNote: form.notes.trim() || undefined,
  }));

  return mergeOfficer(payload.item);
}

export async function updateOfficerFromForm(id: string, form: OfficerForm) {
  const payload = await withServerMessage(http.patch<{ item: ApiOfficer }>(`/officers/${id}`, {
    name: form.name.trim(),
    phone: form.phone.trim(),
    status: statusToApi(form.status),
    icVerified: form.ic,
    defaultHourlyRate: Number(form.rate) || 14,
    onboardingNote: form.notes.trim() || null,
  }));

  return mergeOfficer(payload.item);
}

export async function deleteOfficer(id: string) {
  await withServerMessage(http.delete<{ ok: true }>(`/officers/${id}`));
}
