'use client';
import React from 'react';

/**
 * Segmented control — compact 2–4 option switch for toolbars (view mode,
 * density, grouping). Active option inverts to ink-on-paper. Controlled
 * via `value` or uncontrolled via `defaultValue`.
 */
export function SegmentedControl({ options = [], value, defaultValue, size = 'md', onChange }) {
  const norm = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const [internal, setInternal] = React.useState(defaultValue ?? norm[0]?.value);
  const active = value !== undefined ? value : internal;
  const select = (v) => {
    if (value === undefined) setInternal(v);
    onChange && onChange(v);
  };
  return (
    <div className={`tk-seg tk-seg--${size}`} role="group">
      {norm.map((o) => (
        <button
          key={o.value}
          className={`tk-seg__opt${active === o.value ? ' tk-seg__opt--active' : ''}`}
          onClick={() => select(o.value)}
          aria-pressed={active === o.value}
        >
          {o.icon ? <span className="tk-seg__i">{o.icon}</span> : null}
          {o.label != null ? <span>{o.label}</span> : null}
        </button>
      ))}
      <style>{`
        .tk-seg { display: inline-flex; border: 1px solid var(--border-1); border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-0); }
        .tk-seg__opt { display: inline-flex; align-items: center; gap: 5px; border: 0; border-right: 1px solid var(--border-1); background: transparent; color: var(--fg-2); font-family: var(--font-sans); font-weight: 500; cursor: pointer; transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
        .tk-seg--sm .tk-seg__opt { padding: 4px 8px; font-size: 11px; }
        .tk-seg--md .tk-seg__opt { padding: 5px 11px; font-size: 12px; }
        .tk-seg__opt:last-child { border-right: 0; }
        .tk-seg__opt:hover { color: var(--fg-0); background: var(--bg-1); }
        .tk-seg__opt--active { background: var(--fg-0); color: var(--bg-0); }
        .tk-seg__opt--active:hover { background: var(--fg-0); color: var(--bg-0); }
        .tk-seg__i { display: inline-flex; }
        .tk-seg__i svg { width: 13px; height: 13px; display: block; }
      `}</style>
    </div>
  );
}
