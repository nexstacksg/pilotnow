import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PaymentsScreen } from './PaymentsScreen';
import type { Payment } from '../types';

const payments: Payment[] = [
  { id: 'pay-1', officer: 'John Tan', jobId: 'PN-001', jobDate: '2026-07-08', hours: 8, rate: 18, status: 'Pending', paidDate: '' },
  { id: 'pay-2', officer: 'Mei Lin', jobId: 'PN-002', jobDate: '2026-07-08', hours: 4.5, rate: 20, status: 'Paid', paidDate: '2026-07-09' },
  { id: 'pay-3', officer: 'John Tan', jobId: 'PN-003', jobDate: '2026-07-09', hours: 6, rate: 22, status: 'Pending', paidDate: '' },
];

function renderPayments(props: Partial<ComponentProps<typeof PaymentsScreen>> = {}) {
  const actions = {
    markPaid: vi.fn(),
    setPayOfficer: vi.fn(),
  };

  return {
    actions,
    ...render(
      <PaymentsScreen
        payments={payments}
        search=""
        markPaid={actions.markPaid}
        setPayOfficer={actions.setPayOfficer}
        {...props}
      />,
    ),
  };
}

describe('PaymentsScreen', () => {
  it('renders payout totals and routes row actions', async () => {
    const { actions } = renderPayments();

    expect(screen.getByText('Pending payout').closest('.pn-payment-stat')).toHaveTextContent('S$276.00');
    expect(screen.getByText('Paid this week').closest('.pn-payment-stat')).toHaveTextContent('S$90.00');
    expect(screen.getByText('Filtered total')).toHaveTextContent('S$366.00');
    expect(screen.getByText('PN-001')).toBeInTheDocument();
    expect(screen.getByText('8.00h')).toBeInTheDocument();
    expect(screen.getByText('S$144.00')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: /John Tan/ })[0]!);
    expect(actions.setPayOfficer).toHaveBeenCalledWith('John Tan');

    await userEvent.click(screen.getAllByRole('button', { name: 'Mark paid' })[0]!);
    expect(actions.markPaid).toHaveBeenCalledWith('pay-1');
  });

  it('filters payments by status, date, and global search text', async () => {
    const { rerender } = renderPayments();

    await userEvent.click(screen.getByRole('button', { name: 'Paid' }));
    expect(screen.getByText('PN-002')).toBeInTheDocument();
    expect(screen.queryByText('PN-001')).not.toBeInTheDocument();
    expect(screen.getByText('Filtered total')).toHaveTextContent('S$90.00');

    await userEvent.click(screen.getByRole('button', { name: 'All' }));
    await userEvent.type(screen.getByLabelText('Filter payments by job date'), '2026-07-09');
    expect(screen.getByText('PN-003')).toBeInTheDocument();
    expect(screen.queryByText('PN-001')).not.toBeInTheDocument();
    expect(screen.getByText('Filtered total')).toHaveTextContent('S$132.00');

    await userEvent.click(screen.getByRole('button', { name: 'Clear date' }));
    rerender(<PaymentsScreen payments={payments} search="mei" markPaid={vi.fn()} setPayOfficer={vi.fn()} />);
    expect(screen.getByText('PN-002')).toBeInTheDocument();
    expect(screen.queryByText('PN-003')).not.toBeInTheDocument();
  });

  it('paginates payment rows and resets to the first page when filters change', async () => {
    const manyPayments = Array.from({ length: 11 }, (_, index): Payment => {
      const sequence = String(index + 1).padStart(3, '0');
      return {
        id: `pay-${sequence}`,
        officer: `Officer ${sequence}`,
        jobId: `PN-${sequence}`,
        jobDate: '2026-07-08',
        hours: 8,
        rate: 18,
        status: 'Pending',
        paidDate: '',
      };
    });
    const { rerender } = renderPayments({ payments: manyPayments });

    expect(screen.getByText('PN-001')).toBeInTheDocument();
    expect(screen.queryByText('PN-011')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('PN-011')).toBeInTheDocument();

    rerender(<PaymentsScreen payments={manyPayments} search="Officer 001" markPaid={vi.fn()} setPayOfficer={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('PN-001')).toBeInTheDocument());
    expect(screen.queryByText('PN-011')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1-1 of 1')).toBeInTheDocument();
  });
});
