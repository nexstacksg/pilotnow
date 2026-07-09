import { Badge, Button, Card } from '../components/ui';
import { dateLabel, money } from '../lib/format';
import type { Payment } from '../types';

export function PaymentsScreen({
  payments,
  markPaid,
  setPayOfficer,
}: {
  payments: Payment[];
  markPaid: (id: string) => void;
  setPayOfficer: (officer: string) => void;
}) {
  const pending = payments.filter((payment) => payment.status === 'Pending').reduce((sum, payment) => sum + payment.hours * payment.rate, 0);
  const paid = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.hours * payment.rate, 0);

  return (
    <div className="pn-stack">
      <div className="pn-stats pn-stats-2">
        <Card>
          <span className="pn-muted">Pending payroll</span>
          <strong className="pn-compact-metric">{money(pending)}</strong>
        </Card>
        <Card>
          <span className="pn-muted">Paid payroll</span>
          <strong className="pn-compact-metric">{money(paid)}</strong>
        </Card>
      </div>
      <Card>
        <h2>Officer payments</h2>
        <div className="pn-table pn-table-payments">
          <div className="pn-table-head">
            <span>Officer</span>
            <span>Job</span>
            <span>Date</span>
            <span>Hours</span>
            <span>Total</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {payments.map((payment) => (
            <div className="pn-table-row" key={payment.id}>
              <button className="pn-link-btn" onClick={() => setPayOfficer(payment.officer)} type="button">
                {payment.officer}
              </button>
              <span>{payment.jobId}</span>
              <span>{dateLabel(payment.jobDate)}</span>
              <span>{payment.hours.toFixed(2)}h</span>
              <span>{money(payment.hours * payment.rate)}</span>
              <span>
                <Badge tone={payment.status === 'Paid' ? 'success' : 'warning'}>{payment.status}</Badge>
              </span>
              <span>{payment.status === 'Pending' ? <Button onClick={() => markPaid(payment.id)}>Mark paid</Button> : payment.paidDate ? dateLabel(payment.paidDate) : '-'}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
