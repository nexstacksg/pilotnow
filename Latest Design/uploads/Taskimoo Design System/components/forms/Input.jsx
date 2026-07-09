'use client';
import React from 'react';

/**
 * Text input — the form workhorse. Optional mono uppercase label, leading
 * icon, hint/error line, and a red focus ring. `invalid` flips the border
 * and hint to the functional red. Set `mono` for IDs / numbers (tabular).
 */
export function Input({
  label,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  icon,
  hint,
  invalid,
  disabled,
  mono,
  size = 'md',
  id,
  name,
  onChange,
}) {
  const inputId = id || (name ? `tk-in-${name}` : undefined);
  return (
    <label className="tk-field" htmlFor={inputId}>
      {label ? <span className="tk-field__label">{label}</span> : null}
      <span className={`tk-input${icon ? ' tk-input--icon' : ''}${invalid ? ' tk-input--invalid' : ''} tk-input--${size}`}>
        {icon ? <span className="tk-input__i">{icon}</span> : null}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          className={mono ? 'tk-input__el tk-input__el--mono' : 'tk-input__el'}
        />
      </span>
      {hint ? <span className={`tk-field__hint${invalid ? ' tk-field__hint--err' : ''}`}>{hint}</span> : null}
      <style>{`
        .tk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .tk-field__label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); font-weight: 500; }
        .tk-field__hint { font-size: 11px; color: var(--fg-2); }
        .tk-field__hint--err { color: var(--red-600); }
        .tk-input { display: flex; align-items: center; gap: 7px; background: var(--bg-0); border: 1px solid var(--border-1); border-radius: var(--radius-sm); transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
        .tk-input--sm { padding: 4px 8px; }
        .tk-input--md { padding: 6px 10px; }
        .tk-input:focus-within { border-color: var(--red-500); box-shadow: var(--shadow-focus); }
        .tk-input--invalid { border-color: var(--red-500); }
        .tk-input--invalid:focus-within { box-shadow: var(--shadow-focus); }
        .tk-input__i { display: inline-flex; color: var(--fg-3); flex-shrink: 0; }
        .tk-input__i svg { width: 14px; height: 14px; display: block; }
        .tk-input__el { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-family: var(--font-sans); font-size: 13px; color: var(--fg-0); }
        .tk-input--sm .tk-input__el { font-size: 12px; }
        .tk-input__el--mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 12px; }
        .tk-input__el::placeholder { color: var(--fg-3); }
        .tk-input:has(:disabled) { opacity: 0.5; background: var(--bg-2); cursor: not-allowed; }
      `}</style>
    </label>
  );
}
