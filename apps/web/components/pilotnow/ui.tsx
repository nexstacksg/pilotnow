import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import type { BillingStatus, JobStatus, Officer, PaymentStatus, RequestRow } from '@/lib/pilotnow/types';

export function StatusPill({
  status,
}: {
  status: JobStatus | BillingStatus | PaymentStatus | RequestRow['status'] | Officer['status'];
}) {
  const tone =
    status === 'Ongoing' || status === 'New' ? 'blue' :
    status === 'Completed' || status === 'Billed' || status === 'Paid' || status === 'Converted' || status === 'Active' ? 'green' :
    status === 'Waiting for Officers' || status === 'Pending' || status === 'Not Billed' ? 'amber' :
    status === 'Cancelled' || status === 'Blocked' ? 'red' : '';

  return <span className={`pn-pill ${tone}`}><span />{status}</span>;
}

export function Kpi({
  label,
  value,
  hint,
  icon: Icon = CalendarDays,
  danger,
  warning,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon?: LucideIcon;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="pn-kpi">
      <div>
        <span>{label}</span>
        <i className={danger ? 'danger' : warning ? 'warning' : ''}><Icon size={16} /></i>
      </div>
      <strong>{value}</strong>
      <small className={danger ? 'danger' : warning ? 'warning' : ''}>{hint}</small>
    </div>
  );
}

export function Section({
  title,
  children,
  action,
  count,
  danger,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  count?: number;
  danger?: boolean;
}) {
  return (
    <section className="pn-section">
      <div className="pn-section-head">
        {danger && <span className="pn-dot danger" />}
        <h2>{title}</h2>
        {typeof count === 'number' && <small>{count}</small>}
        <div className="pn-section-action">{action}</div>
      </div>
      {children}
    </section>
  );
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <table className="pn-table">
      <thead>
        <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
