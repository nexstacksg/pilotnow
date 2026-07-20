import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchOfficerPayments, markOfficerPaymentPaid } from './payments-api';

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({ http: { get, post } }));

const unpaidPayable = {
  id: 'assignment-1',
  officer: { id: 'officer-1', name: 'John Tan', phone: '+65 9000 0001' },
  job: {
    id: 'PN-001',
    customerName: 'Acme Pte Ltd',
    siteName: 'Jurong',
    startAt: '2026-07-08T01:00:00.000Z',
    endAt: '2026-07-08T09:00:00.000Z',
  },
  hoursWorked: 8,
  rateAgreed: 18,
  payable: 144,
  currency: 'SGD',
  status: 'UNPAID',
  paidAt: null,
  paymentRef: null,
} as const;

const paidPayable = {
  ...unpaidPayable,
  id: 'assignment-2',
  status: 'PAID',
  paidAt: '2026-07-09T04:30:00.000Z',
  paymentRef: 'BANK-123',
} as const;

describe('payments-api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches officer payables and maps API fields to payment rows', async () => {
    get.mockResolvedValue({ items: [unpaidPayable, paidPayable] });

    await expect(fetchOfficerPayments()).resolves.toEqual([
      {
        id: 'assignment-1',
        officer: 'John Tan',
        jobId: 'PN-001',
        jobDate: '2026-07-08',
        hours: 8,
        rate: 18,
        status: 'Pending',
        paidDate: '',
      },
      {
        id: 'assignment-2',
        officer: 'John Tan',
        jobId: 'PN-001',
        jobDate: '2026-07-08',
        hours: 8,
        rate: 18,
        status: 'Paid',
        paidDate: '2026-07-09',
      },
    ]);
    expect(get).toHaveBeenCalledWith('/payables');
  });

  it('marks an officer payment as paid through the payables endpoint', async () => {
    post.mockResolvedValue({ item: paidPayable });

    await expect(markOfficerPaymentPaid('assignment-2')).resolves.toMatchObject({
      id: 'assignment-2',
      status: 'Paid',
      paidDate: '2026-07-09',
    });
    expect(post).toHaveBeenCalledWith('/payables/assignment-2/mark-paid');
  });

  it('promotes server error bodies to user-facing errors', async () => {
    get.mockRejectedValue({ body: { error: 'Only completed assignments can be paid.' } });

    await expect(fetchOfficerPayments()).rejects.toThrow('Only completed assignments can be paid.');
  });
});
