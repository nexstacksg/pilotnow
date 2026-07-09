'use client';
import React from 'react';

/**
 * Modal — a centered dialog over a 30%-black backdrop. Header (title +
 * mono eyebrow + close), a body, and an optional right-aligned footer for
 * actions. Closes on backdrop click and Escape. Render conditionally on
 * `open`. `size` controls max-width.
 */
export function Modal({ open, onClose, title, eyebrow, children, footer, size = 'md' }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="tk-modal__backdrop" onClick={onClose}>
      <div className={`tk-modal tk-modal--${size}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="tk-modal__head">
          <div className="tk-modal__titles">
            {eyebrow ? <div className="tk-modal__eyebrow">{eyebrow}</div> : null}
            {title ? <h3 className="tk-modal__title">{title}</h3> : null}
          </div>
          {onClose ? (
            <button className="tk-modal__x" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          ) : null}
        </div>
        <div className="tk-modal__body">{children}</div>
        {footer ? <div className="tk-modal__foot">{footer}</div> : null}
      </div>
      <style>{`
        .tk-modal__backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; background: color-mix(in srgb, #000 30%, transparent); animation: tk-modal-fade var(--dur-med) var(--ease-out); }
        .tk-modal { width: 100%; max-height: calc(100vh - 48px); display: flex; flex-direction: column; background: var(--bg-0); border: 1px solid var(--border-1); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; animation: tk-modal-pop var(--dur-med) var(--ease-out); }
        .tk-modal--sm { max-width: 380px; }
        .tk-modal--md { max-width: 520px; }
        .tk-modal--lg { max-width: 720px; }
        .tk-modal__head { display: flex; align-items: flex-start; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--border-0); }
        .tk-modal__titles { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .tk-modal__eyebrow { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-3); }
        .tk-modal__title { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.015em; color: var(--fg-0); }
        .tk-modal__x { flex-shrink: 0; display: inline-flex; padding: 4px; border: 0; background: transparent; color: var(--fg-2); cursor: pointer; border-radius: var(--radius-sm); transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
        .tk-modal__x:hover { background: var(--bg-2); color: var(--fg-0); }
        .tk-modal__x svg { width: 16px; height: 16px; display: block; }
        .tk-modal__body { padding: 18px; overflow-y: auto; font-size: 13px; line-height: 1.5; color: var(--fg-1); }
        .tk-modal__foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 12px 18px; border-top: 1px solid var(--border-0); background: var(--bg-1); }
        @keyframes tk-modal-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tk-modal-pop { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .tk-modal__backdrop, .tk-modal { animation: none; } }
      `}</style>
    </div>
  );
}
