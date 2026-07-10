import { http } from '../../../lib/api';
import type { BillForm, Job } from '../types';

type ApiBillingJob = {
  id: string;
  customer: { id: string; name: string };
  site: { id: string; name: string; address: string | null };
  startAt: string;
  endAt: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  billingStatus: 'NOT_BILLED' | 'BILLED';
  invoiceNumber: string | null;
  billedAt: string | null;
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

function mergeBillingJob(item: ApiBillingJob, previous?: Job): Job {
  return {
    id: item.id,
    customer: item.customer.name,
    location: item.site.address || item.site.name,
    date: item.startAt.slice(0, 10),
    start: item.startAt.slice(11, 16),
    end: item.endAt.slice(11, 16),
    required: previous?.required ?? 1,
    status: 'Completed',
    posted: previous?.posted ?? true,
    description: previous?.description ?? 'No description provided.',
    instructions: previous?.instructions ?? '',
    cancelReason: '',
    officers: previous?.officers ?? [],
    photos: previous?.photos ?? [],
    billing: item.billingStatus === 'BILLED' ? 'Billed' : 'Not Billed',
    invoice: item.invoiceNumber ?? '',
    billedDate: item.billedAt ? item.billedAt.slice(0, 10) : '',
  };
}

export async function fetchBillingJobs(current: Job[]) {
  const payload = await withServerMessage(http.get<{ items: ApiBillingJob[] }>('/billing'));
  return payload.items.map((item) => mergeBillingJob(item, current.find((job) => job.id === item.id)));
}

export async function markJobBilled(id: string, form: BillForm, previous?: Job) {
  const billedAt = new Date(`${form.billedDate}T00:00:00.000Z`).toISOString();
  const payload = await withServerMessage(
    http.post<{ item: ApiBillingJob }>(`/billing/${id}/mark-billed`, {
      invoiceNumber: form.invoice.trim(),
      billedAt,
    }),
  );
  return mergeBillingJob(payload.item, previous);
}
