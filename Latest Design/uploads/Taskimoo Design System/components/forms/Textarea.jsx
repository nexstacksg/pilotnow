'use client';
import React from 'react';

/**
 * Multiline text input. Same chrome as Input — mono label, hint/error
 * line, red focus ring — with a vertically resizable field. Use for
 * descriptions, acceptance criteria, notes.
 */
export function Textarea({
  label,
  value,
  defaultValue,
  placeholder,
  rows = 4,
  hint,
  invalid,
  disabled,
  id,
  name,
  onChange,
}) {
  const inputId = id || (name ? `tk-ta-${name}` : undefined);
  return (
    <label className="tk-tafield" htmlFor={inputId}>
      {label ? <span className="tk-tafield__label">{label}</span> : null}
      <textarea
        id={inputId}
        name={name}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        className={`tk-textarea${invalid ? ' tk-textarea--invalid' : ''}`}
      />
      {hint ? <span className={`tk-tafield__hint${invalid ? ' tk-tafield__hint--err' : ''}`}>{hint}</span> : null}
      <style>{`
        .tk-tafield { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .tk-tafield__label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); font-weight: 500; }
        .tk-tafield__hint { font-size: 11px; color: var(--fg-2); }
        .tk-tafield__hint--err { color: var(--red-600); }
        .tk-textarea { width: 100%; padding: 8px 10px; border: 1px solid var(--border-1); border-radius: var(--radius-sm); font-family: var(--font-sans); font-size: 13px; line-height: 1.5; color: var(--fg-0); background: var(--bg-0); resize: vertical; min-height: 64px; transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
        .tk-textarea:focus { outline: none; border-color: var(--red-500); box-shadow: var(--shadow-focus); }
        .tk-textarea--invalid { border-color: var(--red-500); }
        .tk-textarea::placeholder { color: var(--fg-3); }
        .tk-textarea:disabled { opacity: 0.5; background: var(--bg-2); cursor: not-allowed; }
      `}</style>
    </label>
  );
}
