'use client';
import React from 'react';

/**
 * Banner / callout — an inline message strip. Tones map to the semantic
 * palette (`info`, `success`, `warning`, `danger`) plus `ai` for the
 * red-shifted agent surface. Left accent rule, optional icon, title +
 * body, optional right-aligned actions and a dismiss button.
 */
export function Banner({ tone = 'info', title, children, icon, actions, onDismiss }) {
  return (
    <div className={`tk-banner tk-banner--${tone}`} role="status">
      {icon ? <span className="tk-banner__icon">{icon}</span> : null}
      <div className="tk-banner__body">
        {title ? <div className="tk-banner__title">{title}</div> : null}
        {children ? <div className="tk-banner__text">{children}</div> : null}
        {actions ? <div className="tk-banner__actions">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button className="tk-banner__x" onClick={onDismiss} aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      ) : null}
      <style>{`
        .tk-banner { display: flex; align-items: flex-start; gap: 10px; padding: 11px 12px; border: 1px solid var(--border-0); border-left-width: 2px; border-radius: var(--radius-sm); background: var(--bg-1); color: var(--fg-1); }
        .tk-banner__icon { display: inline-flex; flex-shrink: 0; margin-top: 1px; }
        .tk-banner__icon svg { width: 15px; height: 15px; display: block; }
        .tk-banner__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .tk-banner__title { font-size: 12.5px; font-weight: 600; color: var(--fg-0); }
        .tk-banner__text { font-size: 12px; line-height: 1.45; color: var(--fg-1); }
        .tk-banner__actions { display: flex; gap: 6px; margin-top: 6px; }
        .tk-banner__x { flex-shrink: 0; display: inline-flex; padding: 2px; border: 0; background: transparent; color: var(--fg-3); cursor: pointer; border-radius: 3px; opacity: 0.8; transition: opacity var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }
        .tk-banner__x:hover { opacity: 1; background: var(--bg-2); color: var(--fg-0); }
        .tk-banner__x svg { width: 14px; height: 14px; display: block; }

        .tk-banner--info { background: var(--info-bg); border-color: color-mix(in srgb, var(--info) 22%, transparent); border-left-color: var(--info); }
        .tk-banner--info .tk-banner__icon { color: var(--info); }
        .tk-banner--success { background: var(--success-bg); border-color: color-mix(in srgb, var(--success) 22%, transparent); border-left-color: var(--success); }
        .tk-banner--success .tk-banner__icon { color: var(--success); }
        .tk-banner--warning { background: var(--warning-bg); border-color: color-mix(in srgb, var(--warning) 22%, transparent); border-left-color: var(--warning); }
        .tk-banner--warning .tk-banner__icon { color: var(--warning); }
        .tk-banner--danger { background: var(--danger-bg); border-color: var(--red-100); border-left-color: var(--red-500); }
        .tk-banner--danger .tk-banner__icon { color: var(--red-600); }
        .tk-banner--ai { background: var(--ai-tint); border-color: var(--ai-border); border-left-color: var(--ai-fg); }
        .tk-banner--ai .tk-banner__icon { color: var(--ai-fg); }
        .tk-banner--ai .tk-banner__title { color: var(--ai-fg); }
      `}</style>
    </div>
  );
}
