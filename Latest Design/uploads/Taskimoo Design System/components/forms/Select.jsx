'use client';
import React from 'react';

/**
 * Select — native dropdown styled to match Input. Mono label, hairline
 * border, red focus ring, and a custom chevron. Pass `options` as
 * strings or {value,label} objects.
 */
export function Select({
  label,
  value,
  defaultValue,
  options = [],
  placeholder,
  hint,
  invalid,
  disabled,
  size = 'md',
  id,
  name,
  onChange,
}) {
  const inputId = id || (name ? `tk-sel-${name}` : undefined);
  const norm = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  return (
    <label className="tk-selfield" htmlFor={inputId}>
      {label ? <span className="tk-selfield__label">{label}</span> : null}
      <span className={`tk-select${invalid ? ' tk-select--invalid' : ''} tk-select--${size}`}>
        <select
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          className="tk-select__el"
        >
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {norm.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg className="tk-select__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </span>
      {hint ? <span className={`tk-selfield__hint${invalid ? ' tk-selfield__hint--err' : ''}`}>{hint}</span> : null}
      <style>{`
        .tk-selfield { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .tk-selfield__label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); font-weight: 500; }
        .tk-selfield__hint { font-size: 11px; color: var(--fg-2); }
        .tk-selfield__hint--err { color: var(--red-600); }
        .tk-select { position: relative; display: flex; align-items: center; background: var(--bg-0); border: 1px solid var(--border-1); border-radius: var(--radius-sm); transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
        .tk-select:focus-within { border-color: var(--red-500); box-shadow: var(--shadow-focus); }
        .tk-select--invalid { border-color: var(--red-500); }
        .tk-select__el { appearance: none; -webkit-appearance: none; flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-family: var(--font-sans); color: var(--fg-0); cursor: pointer; }
        .tk-select--sm .tk-select__el { padding: 4px 26px 4px 8px; font-size: 12px; }
        .tk-select--md .tk-select__el { padding: 6px 28px 6px 10px; font-size: 13px; }
        .tk-select__chev { position: absolute; right: 8px; width: 14px; height: 14px; color: var(--fg-3); pointer-events: none; }
        .tk-select:has(:disabled) { opacity: 0.5; background: var(--bg-2); cursor: not-allowed; }
      `}</style>
    </label>
  );
}
