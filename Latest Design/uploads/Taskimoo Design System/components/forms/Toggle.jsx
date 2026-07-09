'use client';
import React from 'react';

/**
 * Toggle / switch — for binary settings. Ink-filled track when on
 * (functional red when `red`). Optional label + description on the right.
 */
export function Toggle({
  label,
  description,
  checked,
  defaultChecked,
  disabled,
  red,
  size = 'md',
  id,
  name,
  onChange,
}) {
  const inputId = id || (name ? `tk-tg-${name}` : undefined);
  return (
    <label className={`tk-toggle tk-toggle--${size}${disabled ? ' tk-toggle--disabled' : ''}`} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        className="tk-toggle__input"
      />
      <span className={`tk-toggle__track${red ? ' tk-toggle__track--red' : ''}`}>
        <span className="tk-toggle__thumb" />
      </span>
      {(label || description) && (
        <span className="tk-toggle__text">
          {label ? <span className="tk-toggle__label">{label}</span> : null}
          {description ? <span className="tk-toggle__desc">{description}</span> : null}
        </span>
      )}
      <style>{`
        .tk-toggle { display: inline-flex; align-items: flex-start; gap: 9px; cursor: pointer; user-select: none; }
        .tk-toggle--disabled { opacity: 0.5; cursor: not-allowed; }
        .tk-toggle__input { position: absolute; opacity: 0; width: 0; height: 0; }
        .tk-toggle__track { position: relative; flex-shrink: 0; background: var(--bg-3); border-radius: 999px; transition: background var(--dur-med) var(--ease-out); }
        .tk-toggle--md .tk-toggle__track { width: 34px; height: 20px; margin-top: 0; }
        .tk-toggle--sm .tk-toggle__track { width: 28px; height: 16px; margin-top: 1px; }
        .tk-toggle__thumb { position: absolute; top: 2px; left: 2px; background: var(--bg-0); border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.2); transition: transform var(--dur-med) var(--ease-out); }
        .tk-toggle--md .tk-toggle__thumb { width: 16px; height: 16px; }
        .tk-toggle--sm .tk-toggle__thumb { width: 12px; height: 12px; }
        .tk-toggle__input:checked + .tk-toggle__track { background: var(--fg-0); }
        .tk-toggle__input:checked + .tk-toggle__track--red { background: var(--red-500); }
        .tk-toggle--md .tk-toggle__input:checked + .tk-toggle__track .tk-toggle__thumb { transform: translateX(14px); }
        .tk-toggle--sm .tk-toggle__input:checked + .tk-toggle__track .tk-toggle__thumb { transform: translateX(12px); }
        .tk-toggle__input:focus-visible + .tk-toggle__track { outline: 2px solid var(--red-500); outline-offset: 2px; }
        .tk-toggle__text { display: flex; flex-direction: column; gap: 1px; }
        .tk-toggle__label { font-size: 13px; color: var(--fg-0); line-height: 1.3; }
        .tk-toggle__desc { font-size: 11px; color: var(--fg-2); line-height: 1.35; }
      `}</style>
    </label>
  );
}
