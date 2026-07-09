'use client';
import React from 'react';

/**
 * Tabs — the horizontal subnav used across Taskimoo screens. Active tab
 * inverts to ink-on-paper fill; optional mono count per tab. Controlled
 * via `value` + `onChange`, or uncontrolled via `defaultValue`.
 */
export function Tabs({ items = [], value, defaultValue, onChange }) {
  const norm = items.map((t) => (typeof t === 'object' ? t : { value: t, label: t }));
  const [internal, setInternal] = React.useState(defaultValue ?? norm[0]?.value);
  const active = value !== undefined ? value : internal;
  const select = (v) => {
    if (value === undefined) setInternal(v);
    onChange && onChange(v);
  };
  return (
    <div className="tk-tabs" role="tablist">
      {norm.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={active === t.value}
          className={`tk-tabs__tab${active === t.value ? ' tk-tabs__tab--active' : ''}`}
          onClick={() => select(t.value)}
        >
          {t.label}
          {t.count != null ? <span className="tk-tabs__count">{t.count}</span> : null}
        </button>
      ))}
      <style>{`
        .tk-tabs { display: flex; gap: 2px; align-items: center; border-bottom: 1px solid var(--border-0); overflow-x: auto; }
        .tk-tabs__tab { padding: 0 10px; height: 32px; margin-bottom: -1px; font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--fg-2); background: transparent; border: 0; border-radius: var(--radius-sm) var(--radius-sm) 0 0; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }
        .tk-tabs__tab:hover { color: var(--fg-0); background: var(--bg-1); }
        .tk-tabs__tab--active { color: var(--fg-0); border-bottom: 2px solid var(--fg-0); }
        .tk-tabs__count { font-family: var(--font-mono); font-size: 10px; color: var(--fg-3); margin-left: 6px; }
        .tk-tabs__tab--active .tk-tabs__count { color: var(--fg-2); }
      `}</style>
    </div>
  );
}
