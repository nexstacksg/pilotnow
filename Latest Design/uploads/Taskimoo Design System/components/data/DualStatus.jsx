'use client';
import React from 'react';

/**
 * DualStatus — Taskimoo's signature component. Renders the two parallel
 * truths a project carries side by side: COMMERCIAL (idea → … → paid →
 * closed) and DELIVERY (draft → … → released → closed) as stepped
 * pipelines. Each track shows a mono kicker, a segmented stepper filled to
 * the current stage, and the current stage name. A track marked
 * `tone="risk"` turns its current segment + label functional red.
 *
 * `compact` collapses each track to a single label + current-stage pill
 * for dense rows and tables.
 */
function Track({ kicker, stages = [], current = 0, tone = 'normal', compact }) {
  const cur = Math.max(0, Math.min(current, stages.length - 1));
  const risk = tone === 'risk';
  const label = stages[cur];
  if (compact) {
    return (
      <div className="tk-ds__ctrack">
        <span className="tk-ds__kicker">{kicker}</span>
        <span className={`tk-ds__pill${risk ? ' tk-ds__pill--risk' : ''}`}>
          {risk ? <span className="tk-ds__pdot" /> : null}
          {label}
        </span>
      </div>
    );
  }
  return (
    <div className="tk-ds__track">
      <div className="tk-ds__row">
        <span className={`tk-ds__kicker${risk ? ' tk-ds__kicker--risk' : ''}`}>{kicker}</span>
        <span className="tk-ds__stage">
          {label}
          <span className="tk-ds__count">{cur + 1}/{stages.length}</span>
        </span>
      </div>
      <div className="tk-ds__steps" role="img" aria-label={`${kicker}: ${label}, step ${cur + 1} of ${stages.length}`}>
        {stages.map((s, i) => {
          const state = i < cur ? 'done' : i === cur ? 'cur' : 'future';
          const cls = `tk-ds__seg tk-ds__seg--${state}${state === 'cur' && risk ? ' tk-ds__seg--risk' : ''}`;
          return <span key={i} className={cls} title={s} />;
        })}
      </div>
    </div>
  );
}

export function DualStatus({ commercial, delivery, compact = false, bordered = true }) {
  return (
    <div className={`tk-ds${compact ? ' tk-ds--compact' : ''}${bordered ? ' tk-ds--bordered' : ''}`}>
      {commercial ? <Track kicker="Commercial" compact={compact} {...commercial} /> : null}
      {delivery ? <Track kicker="Delivery" compact={compact} {...delivery} /> : null}
      <style>{`
        .tk-ds { display: flex; flex-direction: column; gap: 12px; }
        .tk-ds--bordered { background: var(--bg-0); border: 1px solid var(--border-0); border-radius: var(--radius-md); padding: 14px; }
        .tk-ds--compact { gap: 6px; }
        .tk-ds--compact.tk-ds--bordered { padding: 10px 12px; }

        .tk-ds__track { display: flex; flex-direction: column; gap: 7px; }
        .tk-ds__row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
        .tk-ds__kicker { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-3); font-weight: 500; }
        .tk-ds__kicker--risk { color: var(--red-600); }
        .tk-ds__stage { display: inline-flex; align-items: baseline; gap: 8px; font-size: 13px; font-weight: 600; color: var(--fg-0); white-space: nowrap; }
        .tk-ds__count { font-family: var(--font-mono); font-size: 10px; font-weight: 400; color: var(--fg-3); }

        .tk-ds__steps { display: flex; gap: 3px; }
        .tk-ds__seg { flex: 1; height: 4px; border-radius: 999px; background: var(--bg-3); transition: background var(--dur-med) var(--ease-out); }
        .tk-ds__seg--done { background: var(--fg-1); }
        .tk-ds__seg--cur { background: var(--fg-0); }
        .tk-ds__seg--risk { background: var(--red-500); }

        /* compact */
        .tk-ds__ctrack { display: flex; align-items: center; gap: 8px; }
        .tk-ds__kicker, .tk-ds__ctrack .tk-ds__kicker { min-width: 74px; }
        .tk-ds__pill { display: inline-flex; align-items: center; gap: 5px; padding: 2px 7px; border-radius: var(--radius-xs); font-size: 11px; font-weight: 500; background: var(--bg-2); color: var(--fg-1); border: 1px solid var(--border-0); }
        .tk-ds__pill--risk { background: var(--red-50); color: var(--red-700); border-color: var(--red-100); }
        .tk-ds__pdot { width: 5px; height: 5px; border-radius: 50%; background: var(--red-500); }
      `}</style>
    </div>
  );
}
