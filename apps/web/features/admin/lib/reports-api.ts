import { http } from '../../../lib/api';

export type OperationsReport = {
  metrics: {
    completedJobs: number;
    totalPayroll: number;
    missingCheckpoints: number;
    officers: number;
  };
  completedJobs: {
    id: string;
    customer: string;
    site: string;
    date: string;
    officers: number;
    totalPayable: number;
    billingStatus: 'NOT_BILLED' | 'BILLED';
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

export async function fetchOperationsReport() {
  const payload = await withServerMessage(http.get<{ item: OperationsReport }>('/reports'));
  return payload.item;
}
