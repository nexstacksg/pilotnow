'use client';
import React from 'react';

/**
 * Avatar — initials chip. Derives initials from `name` if `initials` not
 * given. `ai` renders the agent star marker (ink bg, red star); `tone`
 * supports the red / dark presets.
 */
export function Avatar({ initials, name, ai, size = 'md', tone }) {
  const cls = `tk-avatar${size === 'sm' ? ' tk-avatar--sm' : ''}${ai ? ' tk-avatar--ai' : ''}`;
  const toneStyle =
    tone === 'red' ? { background: '#FFDEDB', color: '#B31D15' }
    : tone === 'dark' ? { background: '#262626', color: '#fff' }
    : undefined;
  if (ai) return <span className={cls} title={name}><Style /></span>;
  const inits = initials || (name ? name.split(' ').map((p) => p[0]).slice(0, 2).join('') : '?');
  return (
    <span className={cls} style={toneStyle} title={name}>
      {inits}
      <Style />
    </span>
  );
}

function Style() {
  return (
    <style>{`
      .tk-avatar {
        width: 24px; height: 24px; border-radius: 50%;
        border: 1px solid var(--border-1);
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 10px; font-weight: 600; flex-shrink: 0;
        background: var(--bg-2); color: var(--fg-1);
      }
      .tk-avatar--sm { width: 20px; height: 20px; font-size: 9px; }
      .tk-avatar--ai { background: var(--fg-0); color: var(--red-500); border-color: var(--fg-0); }
      .tk-avatar--ai::before { content: '★'; font-size: 12px; }
    `}</style>
  );
}
