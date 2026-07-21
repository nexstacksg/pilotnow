import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OfficerDetailModal } from './OfficerDetailModal';
import { fetchOfficerAssignmentHistory } from '../lib/officers-api';
import type { Job, Officer, Payment } from '../types';

vi.mock('../lib/officers-api', () => ({
  fetchOfficerAssignmentHistory: vi.fn(),
}));

const officer: Officer = {
  id: 'OF-01',
  code: 'OF-01',
  name: 'Ravi Chandran',
  phone: '+65 8123 4567',
  status: 'Active',
  ic: true,
  rate: 16,
  jobsCount: 6,
  notes: '',
};

const payments: Payment[] = [];

function job(index: number): Job {
  const id = `PN-${String(index).padStart(4, '0')}`;
  return {
    id,
    customer: `Customer ${index}`,
    location: 'Tuas',
    date: `2026-07-${String(index).padStart(2, '0')}`,
    start: '08:00',
    end: '16:00',
    required: 1,
    status: 'Completed',
    posted: true,
    description: '',
    instructions: '',
    cancelReason: '',
    officers: [
      {
        oid: officer.id,
        name: officer.name,
        ic: officer.ic,
        rate: officer.rate,
        confirmed: true,
        onDuty: true,
        actualStart: '08:00',
        actualEnd: '16:00',
      },
    ],
    photos: [],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
  };
}

describe('OfficerDetailModal', () => {
  it('paginates job history with five records by default', async () => {
    vi.mocked(fetchOfficerAssignmentHistory).mockResolvedValue([]);
    const openJob = vi.fn();

    render(
      <OfficerDetailModal
        copyText={vi.fn()}
        jobs={[1, 2, 3, 4, 5, 6].map(job)}
        officer={officer}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onSave={vi.fn()}
        openJob={openJob}
        payments={payments}
      />,
    );

    await waitFor(() => expect(screen.queryByText('Loading assignment history...')).not.toBeInTheDocument());

    expect(screen.getByText('Showing 1-5 of 6')).toBeInTheDocument();
    expect(screen.getByText('PN-0006')).toBeInTheDocument();
    expect(screen.getByText('PN-0002')).toBeInTheDocument();
    expect(screen.queryByText('PN-0001')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Showing 6-6 of 6')).toBeInTheDocument();
    expect(screen.getByText('PN-0001')).toBeInTheDocument();
    expect(screen.queryByText('PN-0006')).not.toBeInTheDocument();
  });
});
