import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchOperationsReport } from './reports-api';

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('../../../lib/api', () => ({ http: { get } }));

const report = {
  metrics: {
    completedJobs: 2,
    totalPayroll: 224,
    missingCheckpoints: 1,
    officers: 2,
  },
  completedJobs: [
    {
      id: 'PN-001',
      customer: 'Acme Pte Ltd',
      site: 'Jurong',
      date: '2026-07-08',
      officers: 1,
      totalPayable: 144,
      billingStatus: 'NOT_BILLED',
    },
  ],
};

describe('reports-api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches the operations report from the reports endpoint', async () => {
    get.mockResolvedValue({ item: report });

    await expect(fetchOperationsReport()).resolves.toEqual(report);
    expect(get).toHaveBeenCalledWith('/reports');
  });

  it('promotes server error bodies to user-facing errors', async () => {
    get.mockRejectedValue({ body: { error: 'Reports are temporarily unavailable.' } });

    await expect(fetchOperationsReport()).rejects.toThrow('Reports are temporarily unavailable.');
  });
});
