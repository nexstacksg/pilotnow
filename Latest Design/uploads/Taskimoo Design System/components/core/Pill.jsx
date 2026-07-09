'use client';
import React from 'react';

/**
 * Status pill — Taskimoo's smallest status marker. Tones map to semantic
 * colors; an optional leading dot carries an arbitrary status color.
 */
export function Pill({ children, tone, dot, mono }) {
  const cls = `tk-pill${tone ? ` tk-pill--${tone}` : ''}${mono ? ' tk-pill--mono' : ''}`;
  return (
    <span className={cls}>
      {dot ? <span className="tk-pill__dot" style={{ background: dot }} /> : null}
      {children}
      <style>{`
        .tk-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 6px; border-radius: var(--radius-xs);
          font-size: 10.5px; font-weight: 500; line-height: 1.4;
          font-family: var(--font-sans);
          border: 1px solid var(--border-0); background: var(--bg-1); color: var(--fg-1);
        }
        .tk-pill--mono { font-family: var(--font-mono); }
        .tk-pill__dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
        .tk-pill--red   { background: var(--red-50); color: var(--red-700); border-color: var(--red-100); }
        .tk-pill--green { background: var(--success-bg); color: var(--success); border-color: rgba(10,122,59,0.18); }
        .tk-pill--amber { background: var(--warning-bg); color: var(--warning); border-color: rgba(138,90,0,0.18); }
        .tk-pill--blue  { background: var(--info-bg); color: var(--info); border-color: rgba(31,79,163,0.18); }
      `}</style>
    </span>
  );
}
