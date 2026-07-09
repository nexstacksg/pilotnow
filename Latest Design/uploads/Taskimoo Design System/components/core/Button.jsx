'use client';
import React from 'react';

/**
 * Taskimoo primary action button. Variants follow the editorial system:
 * ink-filled `primary`, functional `red`, hairline `secondary`, and
 * quiet `ghost`. Icons are passed as nodes (use a Lucide SVG).
 */
export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  type = 'button',
  onClick,
  title,
}) {
  const iconOnly = !children && (icon || iconRight);
  const cls = `tk-btn tk-btn--${variant}${iconOnly ? ' tk-btn--icon' : ''} tk-btn--${size}`;
  return (
    <button className={cls} type={type} disabled={disabled} onClick={onClick} title={title}>
      {icon ? <span className="tk-btn__i">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
      {iconRight ? <span className="tk-btn__i">{iconRight}</span> : null}
      <style>{`
        .tk-btn {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans); font-weight: 500;
          border: 1px solid transparent; cursor: pointer;
          background: transparent; color: var(--fg-0);
          transition: all var(--dur-fast) var(--ease-out);
          line-height: 1; white-space: nowrap;
        }
        .tk-btn--sm { padding: 5px 8px; font-size: 11px; }
        .tk-btn--md { padding: 6px 10px; font-size: 12px; }
        .tk-btn--icon { padding: 6px; }
        .tk-btn--sm.tk-btn--icon { padding: 5px; }
        .tk-btn__i { display: inline-flex; }
        .tk-btn__i svg { width: 14px; height: 14px; display: block; }
        .tk-btn--sm .tk-btn__i svg { width: 12px; height: 12px; }
        .tk-btn--primary { background: var(--fg-0); color: var(--bg-0); }
        .tk-btn--primary:hover:not(:disabled) { opacity: 0.9; }
        .tk-btn--red { background: var(--red-500); color: #fff; }
        .tk-btn--red:hover:not(:disabled) { background: var(--red-600); }
        .tk-btn--secondary { background: var(--bg-0); color: var(--fg-0); border-color: var(--border-1); }
        .tk-btn--secondary:hover:not(:disabled) { background: var(--bg-2); }
        .tk-btn--ghost:hover:not(:disabled) { background: var(--bg-2); }
        .tk-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>
    </button>
  );
}
