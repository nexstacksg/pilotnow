import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

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
  error,
  errorId,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  errorId?: string;
}) {
  return (
    <label className={`pn-field ${error ? 'pn-field-invalid' : ''}`}>
      <span>
        {label}
        {required ? <b> *</b> : null}
      </span>
      {children}
      {error ? (
        <p className="pn-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
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
  showSinglePage = false,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  label?: string;
  showSinglePage?: boolean;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1 && !showSinglePage) return null;

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
  headerIcon,
  onClose,
  hideHeader = false,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  headerIcon?: ReactNode;
  onClose: () => void;
  hideHeader?: boolean;
  wide?: boolean;
}) {
  const titleId = useId();
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');

    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="pn-modal-backdrop">
      <section
        ref={modalRef}
        className={`pn-modal ${wide ? 'pn-modal-wide' : ''} ${hideHeader ? 'pn-modal-chromeless' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hideHeader ? undefined : titleId}
        aria-label={hideHeader ? title : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {hideHeader ? null : (
          <header className="pn-modal-header">
            <div className="pn-modal-title-row">
              {headerIcon ? <span className="pn-modal-header-icon">{headerIcon}</span> : null}
              <div>
                <h2 id={titleId}>{title}</h2>
                {subtitle ? <p>{subtitle}</p> : null}
              </div>
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
