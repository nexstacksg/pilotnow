'use client';
import React from 'react';

/**
 * KPI strip — the `.run-bar` summary pattern: a bordered row of stat cells,
 * each a mono label + a large tabular number. Tones (pass/fail/block) color
 * the value for test-run and finance summaries.
 */
export function KPIStrip({ items }) {
  return (
    <div className="tk-runbar">
      {items.map((it, i) => (
        <div key={i} className={it.tone ? `tk-runbar__cell tk-runbar__cell--${it.tone}` : 'tk-runbar__cell'}>
          <span className="tk-runbar__l">{it.label}</span>
          <span className="tk-runbar__n">{it.value}</span>
        </div>
      ))}
      <style>{`
        .tk-runbar { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); border: 1px solid var(--border-0); border-radius: var(--radius-md); background: var(--bg-0); overflow: hidden; }
        .tk-runbar__cell { padding: 10px 12px; border-right: 1px solid var(--border-0); display: flex; flex-direction: column; gap: 2px; }
        .tk-runbar__cell:last-child { border-right: none; }
        .tk-runbar__l { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-3); }
        .tk-runbar__n { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: var(--fg-0); }
        .tk-runbar__cell--pass .tk-runbar__n { color: var(--success); }
        .tk-runbar__cell--fail .tk-runbar__n { color: var(--red-600); }
        .tk-runbar__cell--block .tk-runbar__n { color: var(--warning); }
      `}</style>
    </div>
  );
}
