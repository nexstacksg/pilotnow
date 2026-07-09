'use client';
import React from 'react';

/**
 * Chip — a rounded (pill-radius) tag, slightly larger than Pill. Used for
 * filters, metadata tags and the AI/beta markers. `red` tints it; `mono`
 * sets Geist Mono.
 */
export function Chip({ children, dot, red, mono }) {
  const cls = `tk-chip${red ? ' tk-chip--red' : ''}${mono ? ' tk-chip--mono' : ''}`;
  return (
    <span className={cls}>
      {dot ? <span className="tk-chip__dot" style={{ background: dot }} /> : null}
      {children}
      <style>{`
        .tk-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 8px; border-radius: var(--radius-pill);
          font-size: 11px; font-weight: 500; line-height: 1;
          border: 1px solid var(--border-0); background: var(--bg-1); color: var(--fg-1);
        }
        .tk-chip--mono { font-family: var(--font-mono); font-size: 10px; }
        .tk-chip--red { background: var(--red-50); color: var(--red-700); border-color: var(--red-100); }
        .tk-chip__dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
      `}</style>
    </span>
  );
}
