'use client';
import React from 'react';

/**
 * Checkbox / radio — a custom-drawn control with the editorial ink fill.
 * Checked state fills with ink (`--fg-0`); the optional `red` accent
 * fills with functional red. Renders an inline row with label + optional
 * description. Set `type="radio"` for a round selector.
 */
export function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  disabled,
  red,
  type = 'checkbox',
  id,
  name,
  value,
  onChange,
}) {
  const inputId = id || (name ? `tk-cb-${name}-${value ?? ''}` : undefined);
  return (
    <label className={`tk-check${disabled ? ' tk-check--disabled' : ''}`} htmlFor={inputId}>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        className="tk-check__input"
      />
      <span className={`tk-check__box${type === 'radio' ? ' tk-check__box--radio' : ''}${red ? ' tk-check__box--red' : ''}`}>
        {type === 'radio' ? (
          <span className="tk-check__dot" />
        ) : (
          <svg className="tk-check__tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        )}
      </span>
      {(label || description) && (
        <span className="tk-check__text">
          {label ? <span className="tk-check__label">{label}</span> : null}
          {description ? <span className="tk-check__desc">{description}</span> : null}
        </span>
      )}
      <style>{`
        .tk-check { display: inline-flex; align-items: flex-start; gap: 8px; cursor: pointer; user-select: none; }
        .tk-check--disabled { opacity: 0.5; cursor: not-allowed; }
        .tk-check__input { position: absolute; opacity: 0; width: 0; height: 0; }
        .tk-check__box { flex-shrink: 0; width: 16px; height: 16px; margin-top: 1px; border: 1px solid var(--border-2); border-radius: var(--radius-xs); background: var(--bg-0); display: inline-flex; align-items: center; justify-content: center; color: var(--bg-0); transition: all var(--dur-fast) var(--ease-out); }
        .tk-check__box--radio { border-radius: 50%; }
        .tk-check__tick { width: 11px; height: 11px; opacity: 0; transform: scale(0.6); transition: all var(--dur-fast) var(--ease-out); }
        .tk-check__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--bg-0); opacity: 0; transform: scale(0.4); transition: all var(--dur-fast) var(--ease-out); }
        .tk-check__input:checked + .tk-check__box { background: var(--fg-0); border-color: var(--fg-0); }
        .tk-check__input:checked + .tk-check__box--red { background: var(--red-500); border-color: var(--red-500); }
        .tk-check__input:checked + .tk-check__box .tk-check__tick,
        .tk-check__input:checked + .tk-check__box .tk-check__dot { opacity: 1; transform: scale(1); }
        .tk-check__input:focus-visible + .tk-check__box { outline: 2px solid var(--red-500); outline-offset: 2px; }
        .tk-check__text { display: flex; flex-direction: column; gap: 1px; }
        .tk-check__label { font-size: 13px; color: var(--fg-0); line-height: 1.3; }
        .tk-check__desc { font-size: 11px; color: var(--fg-2); line-height: 1.35; }
      `}</style>
    </label>
  );
}
