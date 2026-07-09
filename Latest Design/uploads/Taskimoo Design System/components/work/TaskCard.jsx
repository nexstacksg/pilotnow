'use client';
import React from 'react';

/**
 * Task card — a kanban work-item card. Shows the work-item id (mono),
 * title, optional tags, a status dot + label, an optional due date
 * (turns red when overdue), and assignee initials. `selected` adds the
 * red left rail.
 */
export function TaskCard({ id, title, tags = [], statusLabel, statusColor, due, overdue, assignee, selected, onClick }) {
  return (
    <div className={`tk-kcard${selected ? ' tk-kcard--selected' : ''}`} onClick={onClick}>
      <div className="tk-kcard__top">
        <span className="tk-kcard__id">{id}</span>
        {due ? <span className={`tk-kcard__due${overdue ? ' tk-kcard__due--over' : ''}`}>{due}</span> : null}
      </div>
      <div className="tk-kcard__title">{title}</div>
      {tags.length > 0 && (
        <div className="tk-kcard__tags">
          {tags.map((t, i) => (
            <span key={i} className={`tk-kcard__tag${t.red ? ' tk-kcard__tag--red' : ''}`}>{t.label}</span>
          ))}
        </div>
      )}
      <div className="tk-kcard__meta">
        <span className="tk-kcard__status">
          {statusColor ? <span className="tk-kcard__dot" style={{ background: statusColor }} /> : null}
          {statusLabel}
        </span>
        {assignee ? <span className="tk-kcard__who">{assignee}</span> : null}
      </div>
      <style>{`
        .tk-kcard { background: var(--bg-0); border: 1px solid var(--border-0); border-radius: var(--radius-md); padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: all var(--dur-fast) var(--ease-out); }
        .tk-kcard:hover { border-color: var(--border-1); box-shadow: var(--shadow-sm); }
        .tk-kcard--selected { border-left: 2px solid var(--red-500); }
        .tk-kcard__top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .tk-kcard__id { font-family: var(--font-mono); font-size: 10px; color: var(--fg-3); }
        .tk-kcard__due { font-family: var(--font-mono); font-size: 10px; color: var(--fg-2); }
        .tk-kcard__due--over { color: var(--red-600); }
        .tk-kcard__title { font-size: 13px; font-weight: 500; line-height: 1.35; color: var(--fg-0); }
        .tk-kcard__tags { display: flex; gap: 4px; flex-wrap: wrap; }
        .tk-kcard__tag { font-size: 10px; padding: 1px 6px; border-radius: var(--radius-xs); border: 1px solid var(--border-0); background: var(--bg-1); color: var(--fg-1); font-weight: 500; }
        .tk-kcard__tag--red { background: var(--red-50); color: var(--red-700); border-color: var(--red-100); }
        .tk-kcard__meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .tk-kcard__status { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--fg-2); }
        .tk-kcard__dot { width: 7px; height: 7px; border-radius: 50%; }
        .tk-kcard__who { width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--border-1); background: var(--bg-2); color: var(--fg-1); display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; }
      `}</style>
    </div>
  );
}
