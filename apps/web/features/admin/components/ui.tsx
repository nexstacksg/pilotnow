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
}: {
  label: string;
  value: string | number;
  hint: string;
  icon?: ReactNode;
  tone?: 'muted' | 'success' | 'warning' | 'info' | 'danger';
}) {
  return (
    <Card>
      <div className="pn-stat-head">
        <span>{label}</span>
        <span className={`pn-stat-dot pn-stat-${tone}`}>{icon}</span>
      </div>
      <strong className="pn-stat-value">{value}</strong>
      <p className={`pn-stat-hint pn-text-${tone}`}>{hint}</p>
    </Card>
  );
}
