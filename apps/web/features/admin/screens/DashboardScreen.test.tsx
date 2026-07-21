import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DashboardScreen } from './DashboardScreen';
import type { DashboardSnapshot } from '../lib/dashboard-api';

const snapshot: DashboardSnapshot = {
  source: 'live', operatingDate: '2026-07-17', generatedAt: '2026-07-17T00:00:00Z',
  metrics: { todayJobs: 1, waitingJobs: 1, ongoingJobs: 0, missingPhotos: 1, officersNeeded: 2, notBilled: 1, unpaidPayables: 3 },
  todayJobs: [{ id: 'PN-42', customer: 'Acme', location: 'Jurong', startAt: '2026-07-17T01:00:00Z', endAt: '2026-07-17T09:00:00Z', required: 2, assigned: 1, status: 'Officers confirmed', proofStatus: 'NOT_DUE', billingStatus: 'NOT_BILLED', hasUnpaidPayables: true }],
  missingProofs: [{ jobId: 'PN-42', customer: 'Acme', officer: 'Alicia', expectedAt: '2026-07-17T03:00:00Z' }],
  unbilledJobs: [{ id: 'PN-41', customer: 'Beta', location: 'Tuas', startAt: '2026-07-16T01:00:00Z', endAt: '2026-07-16T09:00:00Z', required: 1, assigned: 1, status: 'Completed', proofStatus: 'RECEIVED', billingStatus: 'NOT_BILLED', hasUnpaidPayables: false }],
  queues: { todayJobs: ['PN-42'], waitingJobs: ['PN-42'], ongoingJobs: [], missingPhotos: ['PN-42'], unbilledJobs: ['PN-41'] },
};

describe('DashboardScreen', () => {
  it('renders operational data and routes dashboard actions', async () => {
    const actions = { openCreateJob: vi.fn(), openJob: vi.fn(), openJobs: vi.fn(), openBilling: vi.fn(), setScreen: vi.fn() };
    render(<DashboardScreen snapshot={snapshot} {...actions} />);
    expect(screen.getByText('Jurong')).toBeInTheDocument();
    expect(screen.getByText('Alicia', { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText('Open jobs waiting for officers')).toHaveTextContent('2 officers still needed');

    await userEvent.click(screen.getByText('PN-42'));
    expect(actions.openJob).toHaveBeenCalledWith('PN-42');
    await userEvent.click(screen.getByRole('button', { name: /Create Job/ }));
    expect(actions.openCreateJob).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Run Payments/ }));
    expect(actions.setScreen).toHaveBeenCalledWith('payments');
    await userEvent.click(screen.getByRole('button', { name: /Review Billing/ }));
    expect(actions.openBilling).toHaveBeenCalledWith(undefined, 'All');
  });

  it('renders useful empty states when no work needs attention', () => {
    const emptySnapshot: DashboardSnapshot = {
      ...snapshot,
      metrics: { todayJobs: 0, waitingJobs: 0, ongoingJobs: 0, missingPhotos: 0, officersNeeded: 0, notBilled: 0, unpaidPayables: 0 },
      todayJobs: [], missingProofs: [], unbilledJobs: [],
      queues: { todayJobs: [], waitingJobs: [], ongoingJobs: [], missingPhotos: [], unbilledJobs: [] },
    };
    render(<DashboardScreen snapshot={emptySnapshot} openCreateJob={vi.fn()} openJob={vi.fn()} openJobs={vi.fn()} openBilling={vi.fn()} setScreen={vi.fn()} />);
    expect(screen.getByText('No jobs are scheduled for this operating day.')).toBeInTheDocument();
    expect(screen.getByText('No missing proof checkpoints.')).toBeInTheDocument();
    expect(screen.getByText('No completed jobs are waiting for billing.')).toBeInTheDocument();
  });
});
