import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BillingScreen } from './BillingScreen';
import type { Job } from '../types';

const jobs: Job[] = [
  makeJob({ id: 'PN-001', customer: 'Acme Pte Ltd', location: 'Jurong', date: '2026-07-08', billing: 'Not Billed' }),
  makeJob({ id: 'PN-002', customer: 'Beta Logistics', location: 'Tuas', date: '2026-07-09', billing: 'Billed', invoice: 'INV-002', billedDate: '2026-07-10' }),
  makeJob({ id: 'PN-003', customer: 'Crest Retail', location: 'Woodlands', date: '2026-07-10', billing: 'Not Billed' }),
];

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'PN-000',
    customer: 'Customer',
    location: 'Site',
    date: '2026-07-08',
    start: '09:00',
    end: '17:00',
    required: 1,
    status: 'Completed',
    posted: true,
    description: 'Guarding service',
    instructions: '',
    cancelReason: '',
    officers: [],
    photos: [],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
    ...overrides,
  };
}

function renderBilling(props: Partial<ComponentProps<typeof BillingScreen>> = {}) {
  const actions = {
    openBill: vi.fn(),
    setFilter: vi.fn(),
  };

  return {
    actions,
    ...render(
      <BillingScreen
        jobs={jobs}
        filter="All"
        search=""
        openBill={actions.openBill}
        setFilter={actions.setFilter}
        {...props}
      />,
    ),
  };
}

describe('BillingScreen', () => {
  it('renders customer billing rows and routes mark-billed actions', async () => {
    const { actions } = renderBilling();

    expect(screen.getByText('Completed jobs and their customer billing status.')).toBeInTheDocument();
    expect(screen.getByText('PN-001')).toBeInTheDocument();
    expect(screen.getByText('Acme Pte Ltd')).toBeInTheDocument();
    expect(screen.getByText('08 Jul 2026')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();
    expect(screen.getAllByText('10 Jul 2026')).toHaveLength(2);

    await userEvent.click(screen.getAllByRole('button', { name: 'Mark billed' })[0]!);
    expect(actions.openBill).toHaveBeenCalledWith('PN-001');

    await userEvent.click(screen.getByRole('button', { name: /Not Billed/ }));
    expect(actions.setFilter).toHaveBeenCalledWith('Not Billed');
  });

  it('filters jobs by billing status and search text', () => {
    const { rerender } = renderBilling({ filter: 'Not Billed' });

    expect(screen.getByText('PN-001')).toBeInTheDocument();
    expect(screen.getByText('PN-003')).toBeInTheDocument();
    expect(screen.queryByText('PN-002')).not.toBeInTheDocument();

    rerender(<BillingScreen jobs={jobs} filter="All" search="beta" openBill={vi.fn()} setFilter={vi.fn()} />);
    expect(screen.getByText('PN-002')).toBeInTheDocument();
    expect(screen.queryByText('PN-001')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1-1 of 1')).toBeInTheDocument();
  });

  it('shows an empty state when no completed jobs match the billing filter', () => {
    renderBilling({ filter: 'Billed', jobs: jobs.filter((job) => job.billing === 'Not Billed') });

    expect(screen.getByText('No completed jobs match this billing filter.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Billing pagination')).not.toBeInTheDocument();
  });

  it('paginates billing rows and resets to the first page when search changes', async () => {
    const manyJobs = Array.from({ length: 11 }, (_, index) => {
      const sequence = String(index + 1).padStart(3, '0');
      return makeJob({ id: `PN-${sequence}`, customer: `Customer ${sequence}` });
    });
    const { rerender } = renderBilling({ jobs: manyJobs });

    expect(screen.getByText('PN-001')).toBeInTheDocument();
    expect(screen.queryByText('PN-011')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('PN-011')).toBeInTheDocument();

    rerender(<BillingScreen jobs={manyJobs} filter="All" search="Customer 001" openBill={vi.fn()} setFilter={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('PN-001')).toBeInTheDocument());
    expect(screen.queryByText('PN-011')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1-1 of 1')).toBeInTheDocument();
  });
});
