'use client';
import React from 'react';

/**
 * Empty state — the dashed-border placeholder for empty lists, boards and
 * search results. Optional icon, title, description, and an action.
 */
export function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <div className={`tk-empty${compact ? ' tk-empty--compact' : ''}`}>
      {icon ? <span className="tk-empty__icon">{icon}</span> : null}
      {title ? <div className="tk-empty__title">{title}</div> : null}
      {description ? <div className="tk-empty__desc">{description}</div> : null}
      {action ? <div className="tk-empty__action">{action}</div> : null}
      <style>{`
        .tk-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; padding: 40px 24px; border: 1px dashed var(--border-1); border-radius: var(--radius-md); color: var(--fg-2); background: var(--bg-0); }
        .tk-empty--compact { padding: 24px 16px; }
        .tk-empty__icon { display: inline-flex; color: var(--fg-3); margin-bottom: 2px; }
        .tk-empty__icon svg { width: 22px; height: 22px; display: block; }
        .tk-empty--compact .tk-empty__icon svg { width: 18px; height: 18px; }
        .tk-empty__title { font-size: 13.5px; font-weight: 600; color: var(--fg-0); }
        .tk-empty__desc { font-size: 12px; line-height: 1.45; color: var(--fg-2); max-width: 36ch; }
        .tk-empty__action { margin-top: 6px; }
      `}</style>
    </div>
  );
}
