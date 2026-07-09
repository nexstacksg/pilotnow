'use client';
import React from 'react';

/**
 * Toast — a transient confirmation/alert. A compact ink-on-paper card
 * with a tone accent dot, title, optional message, and dismiss. Stack
 * several inside a fixed-position container (bottom-right). Presentational
 * — wire timers / queueing in your app.
 */
export function Toast({ tone = 'default', title, message, icon, onDismiss, action }) {
  return (
    <div className={`tk-toast tk-toast--${tone}`} role="status">
      <span className="tk-toast__rail" />
      {icon ? <span className="tk-toast__icon">{icon}</span> : null}
      <div className="tk-toast__body">
        {title ? <div className="tk-toast__title">{title}</div> : null}
        {message ? <div className="tk-toast__msg">{message}</div> : null}
      </div>
      {action ? <div className="tk-toast__action">{action}</div> : null}
      {onDismiss ? (
        <button className="tk-toast__x" onClick={onDismiss} aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      ) : null}
      <style>{`
        .tk-toast { position: relative; display: flex; align-items: flex-start; gap: 9px; min-width: 260px; max-width: 380px; padding: 11px 12px 11px 14px; background: var(--bg-0); border: 1px solid var(--border-1); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); overflow: hidden; }
        .tk-toast__rail { position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--fg-0); }
        .tk-toast--success .tk-toast__rail { background: var(--success); }
        .tk-toast--danger .tk-toast__rail { background: var(--red-500); }
        .tk-toast--warning .tk-toast__rail { background: var(--warning); }
        .tk-toast--info .tk-toast__rail { background: var(--info); }
        .tk-toast__icon { display: inline-flex; flex-shrink: 0; margin-top: 1px; color: var(--fg-2); }
        .tk-toast--success .tk-toast__icon { color: var(--success); }
        .tk-toast--danger .tk-toast__icon { color: var(--red-600); }
        .tk-toast--warning .tk-toast__icon { color: var(--warning); }
        .tk-toast--info .tk-toast__icon { color: var(--info); }
        .tk-toast__icon svg { width: 15px; height: 15px; display: block; }
        .tk-toast__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .tk-toast__title { font-size: 12.5px; font-weight: 600; color: var(--fg-0); }
        .tk-toast__msg { font-size: 11.5px; line-height: 1.4; color: var(--fg-2); }
        .tk-toast__action { flex-shrink: 0; align-self: center; }
        .tk-toast__x { flex-shrink: 0; display: inline-flex; padding: 2px; border: 0; background: transparent; color: var(--fg-3); cursor: pointer; border-radius: 3px; opacity: 0.8; transition: opacity var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }
        .tk-toast__x:hover { opacity: 1; background: var(--bg-2); color: var(--fg-0); }
        .tk-toast__x svg { width: 13px; height: 13px; display: block; }
      `}</style>
    </div>
  );
}
