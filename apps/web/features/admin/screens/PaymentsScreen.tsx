import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon, CheckIcon, ClockIcon } from '../components/icons';
import { Badge, Button, Card, DEFAULT_PAGE_SIZE, Pagination } from '../components/ui';
import { dateLabel, money } from '../lib/format';
import type { Payment, PaymentStatus } from '../types';

type PaymentFilter = 'All' | PaymentStatus;

const paymentFilters: PaymentFilter[] = ['All', 'Pending', 'Paid'];

function paymentAmount(payment: Payment) {
  return payment.hours * payment.rate;
}

export function PaymentsScreen({
  payments,
  markPaid,
  search,
  setPayOfficer,
}: {
  payments: Payment[];
  markPaid: (id: string) => void;
  search: string;
  setPayOfficer: (officer: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<PaymentFilter>('All');
  const [jobDate, setJobDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const query = search.trim().toLowerCase();

  const pending = payments.filter((payment) => payment.status === 'Pending').reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const paid = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
        const matchesDate = !jobDate || payment.jobDate === jobDate;
        const matchesSearch = !query || paymentSearchText(payment).includes(query);
        return matchesStatus && matchesDate && matchesSearch;
      }),
    [jobDate, payments, query, statusFilter],
  );
  const filteredTotal = filteredPayments.reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visiblePayments = filteredPayments.slice(start, start + pageSize);
  const from = filteredPayments.length ? start + 1 : 0;
  const to = Math.min(start + pageSize, filteredPayments.length);

  useEffect(() => {
    setPage(1);
  }, [jobDate, pageSize, query, statusFilter]);

  return (
    <div className="pn-stack">
      <div className="pn-stats pn-stats-2">
        <Card className="pn-payment-stat">
          <span className="pn-payment-stat-icon pn-payment-stat-warning">
            <ClockIcon size={19} strokeWidth={2.1} />
          </span>
          <span>
            <span className="pn-payment-stat-label">Pending payout</span>
            <strong className="pn-compact-metric">{money(pending)}</strong>
          </span>
        </Card>
        <Card className="pn-payment-stat">
          <span className="pn-payment-stat-icon pn-payment-stat-success">
            <CheckIcon size={19} strokeWidth={2.3} />
          </span>
          <span>
            <span className="pn-payment-stat-label">Paid this week</span>
            <strong className="pn-compact-metric">{money(paid)}</strong>
          </span>
        </Card>
      </div>

      <div className="pn-payment-toolbar">
        <div className="pn-tabs" aria-label="Payment status filter">
          {paymentFilters.map((filter) => (
            <button className={statusFilter === filter ? 'active' : ''} key={filter} onClick={() => setStatusFilter(filter)} type="button" aria-pressed={statusFilter === filter}>
              {filter}
            </button>
          ))}
        </div>

        <span className="pn-payment-toolbar-divider" />

        <label className="pn-date-filter">
          <CalendarIcon size={15} stroke="#A3A3A3" strokeWidth={2} />
          <span>Job date</span>
          <input aria-label="Filter payments by job date" type="date" value={jobDate} onChange={(event) => setJobDate(event.target.value)} />
        </label>

        {jobDate ? (
          <Button onClick={() => setJobDate('')}>
            Clear date
          </Button>
        ) : null}

        <span className="pn-payment-filter-total">
          Filtered total <strong>{money(filteredTotal)}</strong>
        </span>
      </div>

      <div className="pn-table pn-table-payments">
        <div className="pn-table-head">
          <span>Officer</span>
          <span>Job</span>
          <span>Date</span>
          <span>Hours</span>
          <span>Rate</span>
          <span>Total</span>
          <span>Status</span>
        </div>
        {visiblePayments.map((payment) => (
          <div className="pn-table-row" key={payment.id}>
            <span>
              <button className="pn-payment-officer-btn" onClick={() => setPayOfficer(payment.officer)} type="button">
                {payment.officer}
                <span aria-hidden="true">›</span>
              </button>
            </span>
            <span className="pn-mono">{payment.jobId}</span>
            <span>{dateLabel(payment.jobDate)}</span>
            <span><strong>{payment.hours.toFixed(2)}h</strong></span>
            <span className="pn-mono">{money(payment.rate)}</span>
            <span><strong>{money(paymentAmount(payment))}</strong></span>
            <span>
              {payment.status === 'Pending' ? (
                <Button variant="primary" onClick={() => markPaid(payment.id)}>
                  Mark paid
                </Button>
              ) : (
                <Badge tone="success">{payment.status}</Badge>
              )}
            </span>
          </div>
        ))}
        {!filteredPayments.length ? <div className="pn-empty">No payments match these filters.</div> : null}
      </div>
      <Pagination from={from} label="Payment" onPageChange={setPage} onPageSizeChange={setPageSize} page={currentPage} pageCount={pageCount} pageSize={pageSize} showSinglePage to={to} total={filteredPayments.length} />
    </div>
  );
}

function paymentSearchText(payment: Payment) {
  const total = paymentAmount(payment);

  return [
    payment.officer,
    payment.jobId,
    payment.jobDate,
    dateLabel(payment.jobDate),
    payment.hours.toFixed(2),
    `${payment.hours.toFixed(2)}h`,
    money(payment.rate),
    payment.rate.toString(),
    money(total),
    total.toString(),
    payment.status,
  ]
    .join(' ')
    .toLowerCase();
}
