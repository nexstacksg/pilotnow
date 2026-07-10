import { http } from '../../../lib/api';
import type { Payment } from '../types';

type ApiPaymentStatus = 'UNPAID' | 'PAID';

type ApiPayable = {
  id: string;
  officer: {
    id: string;
    name: string;
    phone: string;
  };
  job: {
    id: string;
    customerName: string;
    siteName: string;
    startAt: string;
    endAt: string;
  };
  hoursWorked: number;
  rateAgreed: number;
  payable: number;
  currency: string;
  status: ApiPaymentStatus;
  paidAt: string | null;
  paymentRef: string | null;
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

function dateOnly(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

function mapPayable(item: ApiPayable): Payment {
  return {
    id: item.id,
    officer: item.officer.name,
    jobId: item.job.id,
    jobDate: dateOnly(item.job.startAt),
    hours: item.hoursWorked,
    rate: item.rateAgreed,
    status: item.status === 'PAID' ? 'Paid' : 'Pending',
    paidDate: dateOnly(item.paidAt),
  };
}

export async function fetchOfficerPayments() {
  const payload = await withServerMessage(http.get<{ items: ApiPayable[] }>('/payables'));
  return payload.items.map(mapPayable);
}

export async function markOfficerPaymentPaid(id: string) {
  const payload = await withServerMessage(http.post<{ item: ApiPayable }>(`/payables/${id}/mark-paid`));
  return mapPayable(payload.item);
}
