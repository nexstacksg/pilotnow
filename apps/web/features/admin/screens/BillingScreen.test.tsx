import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BillingScreen, completedBillingMessage } from './BillingScreen';
import type { Job } from '../types';

const job = (billing: Job['billing'], overrides: Partial<Job> = {}): Job => ({
  id: 'PN-1',
  customer: 'Acme',
  location: 'Jurong',
  date: '2026-07-21',
  start: '09:00',
  end: '18:00',
  required: 1,
  status: 'Completed',
  billing,
  posted: true,
  officers: [],
  photos: [],
  invoice: '',
  billedDate: '',
  cancelReason: '',
  description: '',
  instructions: '',
  ...overrides,
});

const billingJobs: Job[] = [
  job('Not Billed', { id: 'PN-001', customer: 'Acme Security', date: '2026-07-21' }),
  job('Billed', { id: 'PN-002', customer: 'Bravo Retail', date: '2026-07-22', invoice: 'INV-002', billedDate: '2026-07-23' }),
  job('Not Billed', { id: 'PN-003', customer: 'Delta Services', date: '2026-07-22' }),
];

function renderBilling(props: Partial<ComponentProps<typeof BillingScreen>> = {}) {
  return render(
    <BillingScreen
      filter="All"
      jobs={billingJobs}
      openBill={vi.fn()}
      search=""
      setFilter={vi.fn()}
      {...props}
    />,
  );
}

describe('completedBillingMessage', () => {
  it('shows a completed job ready message for one unbilled job', () => {
    expect(completedBillingMessage([job('Not Billed')])).toBe('1 completed job ready for billing.');
  });

  it('shows billed when all completed jobs are billed', () => {
    expect(completedBillingMessage([job('Billed')])).toBe('1 completed job billed.');
  });
});

describe('BillingScreen', () => {
  it('filters customer billing rows by job date', async () => {
    renderBilling();

    await userEvent.type(screen.getByLabelText('Filter billing by job date'), '2026-07-22');
    expect(screen.getByText('PN-002')).toBeInTheDocument();
    expect(screen.getByText('PN-003')).toBeInTheDocument();
    expect(screen.queryByText('PN-001')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(screen.getByText('PN-001')).toBeInTheDocument();
  });
});
