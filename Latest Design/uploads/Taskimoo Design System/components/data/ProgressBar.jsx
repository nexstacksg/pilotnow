'use client';
import React from 'react';

/**
 * ProgressBar — a thin determinate bar for milestone / completion counts
 * ("5 of 8 milestones done"). Ink fill by default; `tone` switches to a
 * semantic color. Optional label row with a mono count on the right.
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  valueText,
  tone = 'ink',
  size = 'md',
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const auto = `${value} / ${max}`;
  return (
    <div className="tk-prog">
      {(label || showValue) && (
        <div className="tk-prog__head">
          {label ? <span className="tk-prog__label">{label}</span> : <span />}
          {showValue ? <span className="tk-prog__val">{valueText ?? auto}</span> : null}
        </div>
      )}
      <div className={`tk-prog__track tk-prog__track--${size}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className={`tk-prog__fill tk-prog__fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <style>{`
        .tk-prog { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .tk-prog__head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
        .tk-prog__label { font-size: 12px; color: var(--fg-1); font-weight: 500; }
        .tk-prog__val { font-family: var(--font-mono); font-size: 10.5px; color: var(--fg-3); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .tk-prog__track { width: 100%; background: var(--bg-3); border-radius: 999px; overflow: hidden; }
        .tk-prog__track--sm { height: 4px; }
        .tk-prog__track--md { height: 6px; }
        .tk-prog__fill { height: 100%; border-radius: 999px; transition: width var(--dur-med) var(--ease-out); }
        .tk-prog__fill--ink { background: var(--fg-0); }
        .tk-prog__fill--red { background: var(--red-500); }
        .tk-prog__fill--green { background: var(--success); }
        .tk-prog__fill--amber { background: var(--warning); }
        .tk-prog__fill--blue { background: var(--info); }
      `}</style>
    </div>
  );
}
