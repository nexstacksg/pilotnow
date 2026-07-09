'use client';
import React from 'react';

/**
 * Breadcrumb — the topbar trail. Faint chevron separators; the last item
 * renders as the current page (ink, medium weight). Earlier items are
 * links/buttons. Pass items as strings or {label, href, onClick}.
 */
export function Breadcrumb({ items = [] }) {
  const norm = items.map((c) => (typeof c === 'object' ? c : { label: c }));
  return (
    <nav className="tk-crumb" aria-label="Breadcrumb">
      {norm.map((c, i) => {
        const last = i === norm.length - 1;
        return (
          <React.Fragment key={i}>
            {last ? (
              <span className="tk-crumb__current" aria-current="page">{c.label}</span>
            ) : c.href || c.onClick ? (
              <a className="tk-crumb__link" href={c.href} onClick={c.onClick}>{c.label}</a>
            ) : (
              <span className="tk-crumb__link">{c.label}</span>
            )}
            {!last ? (
              <svg className="tk-crumb__sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            ) : null}
          </React.Fragment>
        );
      })}
      <style>{`
        .tk-crumb { display: flex; align-items: center; gap: 6px; font-size: 13px; min-width: 0; }
        .tk-crumb__link { color: var(--fg-2); cursor: pointer; white-space: nowrap; transition: color var(--dur-fast) var(--ease-out); }
        .tk-crumb__link:hover { color: var(--fg-0); }
        .tk-crumb__current { color: var(--fg-0); font-weight: 500; white-space: nowrap; }
        .tk-crumb__sep { width: 13px; height: 13px; color: var(--fg-4); flex-shrink: 0; }
      `}</style>
    </nav>
  );
}
