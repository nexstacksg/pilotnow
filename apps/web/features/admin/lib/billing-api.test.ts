import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchBillingJobs, markJobBilled } from './billing-api';
import type { Job } from '../types';

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({ http: { get, post } }));

const previousJob: Job = {
  id: 'PN-001',
  customer: 'Old Customer',
  location: 'Old Site',
  date: '2026-07-01',
  start: '08:00',
  end: '16:00',
  required: 3,
  status: 'Completed',
  posted: false,
  description: 'Preserved description',
  instructions: 'Preserved instructions',
  cancelReason: 'Ignored cancel reason',
  officers: [{ oid: 'officer-1', name: 'John Tan', ic: true, rate: 18, confirmed: true, onDuty: true, actualStart: '08:00', actualEnd: '16:00' }],
  photos: [{ time: '10:00', status: 'received', by: 'John Tan', at: '2026-07-01T10:00:00.000Z' }],
  billing: 'Not Billed',
  invoice: '',
  billedDate: '',
};

const unbilledApiJob = {
  id: 'PN-001',
  customer: { id: 'customer-1', name: 'Acme Pte Ltd' },
  site: { id: 'site-1', name: 'Jurong Site', address: '10 Jurong Road' },
  startAt: '2026-07-08T01:00:00.000Z',
  endAt: '2026-07-08T09:00:00.000Z',
  status: 'COMPLETED',
  billingStatus: 'NOT_BILLED',
  invoiceNumber: null,
  billedAt: null,
} as const;

const billedApiJob = {
  ...unbilledApiJob,
  billingStatus: 'BILLED',
  invoiceNumber: 'INV-001',
  billedAt: '2026-07-10T00:00:00.000Z',
} as const;

describe('billing-api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches customer billing jobs and preserves local job details when available', async () => {
    get.mockResolvedValue({ items: [unbilledApiJob, billedApiJob] });

    await expect(fetchBillingJobs([previousJob])).resolves.toEqual([
      expect.objectContaining({
        id: 'PN-001',
        customer: 'Acme Pte Ltd',
        location: '10 Jurong Road',
        date: '2026-07-08',
        start: '01:00',
        end: '09:00',
        required: 3,
        posted: false,
        description: 'Preserved description',
        instructions: 'Preserved instructions',
        officers: previousJob.officers,
        photos: previousJob.photos,
        billing: 'Not Billed',
        invoice: '',
        billedDate: '',
      }),
      expect.objectContaining({
        billing: 'Billed',
        invoice: 'INV-001',
        billedDate: '2026-07-10',
      }),
    ]);
    expect(get).toHaveBeenCalledWith('/billing');
  });

  it('marks a customer job as billed with a trimmed invoice and UTC billed date', async () => {
    post.mockResolvedValue({ item: billedApiJob });

    await expect(markJobBilled('PN-001', { invoice: ' INV-001 ', billedDate: '2026-07-10' }, previousJob)).resolves.toMatchObject({
      id: 'PN-001',
      billing: 'Billed',
      invoice: 'INV-001',
      billedDate: '2026-07-10',
      required: 3,
    });
    expect(post).toHaveBeenCalledWith('/billing/PN-001/mark-billed', {
      invoiceNumber: 'INV-001',
      billedAt: '2026-07-10T00:00:00.000Z',
    });
  });

  it('uses the site name when no site address is returned', async () => {
    get.mockResolvedValue({ items: [{ ...unbilledApiJob, site: { ...unbilledApiJob.site, address: null } }] });

    await expect(fetchBillingJobs([])).resolves.toEqual([
      expect.objectContaining({
        location: 'Jurong Site',
        required: 1,
        posted: true,
        description: 'No description provided.',
      }),
    ]);
  });

  it('promotes server error bodies to user-facing errors', async () => {
    post.mockRejectedValue({ body: { error: 'Invoice number is required.' } });

    await expect(markJobBilled('PN-001', { invoice: '', billedDate: '2026-07-10' })).rejects.toThrow('Invoice number is required.');
  });
});
