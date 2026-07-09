'use client';
import React from 'react';

/**
 * Section card — the workhorse container. A bordered surface with an
 * optional head (title + mono meta + right-aligned actions) and a body
 * that is flush by default or padded via `pad`.
 */
export function SectionCard({ title, meta, actions, pad = false, children }) {
  const showHead = title != null || meta != null || actions != null;
  return (
    <div className="tk-section">
      {showHead && (
        <div className="tk-section__head">
          {title != null && <h3>{title}</h3>}
          {meta != null && <span className="tk-section__meta">{meta}</span>}
          {actions != null && (
            <React.Fragment>
              <div style={{ flex: 1 }} />
              {actions}
            </React.Fragment>
          )}
        </div>
      )}
      <div className={`tk-section__body${pad ? ' tk-section__body--pad' : ''}`}>{children}</div>
      <style>{`
        .tk-section { background: var(--bg-0); border: 1px solid var(--border-0); border-radius: var(--radius-md); display: flex; flex-direction: column; overflow: hidden; }
        .tk-section__head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid var(--border-0); }
        .tk-section__head h3 { font-size: 12.5px; font-weight: 600; margin: 0; color: var(--fg-0); }
        .tk-section__meta { font-family: var(--font-mono); font-size: 10.5px; color: var(--fg-3); }
        .tk-section__body--pad { padding: 12px; }
      `}</style>
    </div>
  );
}
