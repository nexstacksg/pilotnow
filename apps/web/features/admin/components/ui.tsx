import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`pn-card ${className}`}>{children}</section>;
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button className={`pn-btn pn-btn-${variant}`} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = 'muted',
  dot = false,
}: {
  children: ReactNode;
  tone?: 'muted' | 'success' | 'warning' | 'info' | 'danger';
  dot?: boolean;
}) {
  return (
    <span className={`pn-badge pn-badge-${tone}`}>
      {dot ? <span className="pn-badge-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="pn-field">
      <span>
        {label}
        {required ? <b> *</b> : null}
      </span>
      {children}
    </label>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="pn-empty">{children}</div>;
}

export function Pagination({
  page,
  pageCount,
  from,
  to,
  total,
  label = 'records',
  onPageChange,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  label?: string;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="pn-pagination" aria-label={`${label} pagination`}>
      <span>
        Showing {from}-{to} of {total}
      </span>
      <div>
        <Button disabled={page === 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
          Previous
        </Button>
        <strong>
          Page {page} of {pageCount}
        </strong>
        <Button disabled={page === pageCount} onClick={() => onPageChange(Math.min(pageCount, page + 1))}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  children,
  footer,
  headerActions,
  onClose,
  hideHeader = false,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  onClose: () => void;
  hideHeader?: boolean;
  wide?: boolean;
}) {
  return (
    <div className="pn-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className={`pn-modal ${wide ? 'pn-modal-wide' : ''} ${hideHeader ? 'pn-modal-chromeless' : ''}`}>
        {hideHeader ? null : (
          <header className="pn-modal-header">
            <div>
              <h2>{title}</h2>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
            {headerActions}
            <button className="pn-icon-btn" onClick={onClose} type="button" aria-label="Close">
              x
            </button>
          </header>
        )}
        <div className="pn-modal-body">{children}</div>
        {footer ? <footer className="pn-modal-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'muted',
  onClick,
  ariaLabel,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon?: ReactNode;
  tone?: 'muted' | 'success' | 'warning' | 'info' | 'danger';
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const content = (
    <>
      <div className="pn-stat-head">
        <span>{label}</span>
        <span className={`pn-stat-dot pn-stat-${tone}`}>{icon}</span>
      </div>
      <strong className="pn-stat-value">{value}</strong>
      <p className={`pn-stat-hint pn-text-${tone}`}>{hint}</p>
    </>
  );

  return onClick ? (
    <button aria-label={ariaLabel ?? label} className="pn-card pn-stat-card-action" onClick={onClick} type="button">
      {content}
    </button>
  ) : (
    <Card>{content}</Card>
  );
}
