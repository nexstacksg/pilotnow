/* global React */
// PilotNow — shared UI primitives.

const { useState, useEffect, useRef } = React;

window.cx = function cx(...xs) {
  return xs.filter(Boolean).join(' ');
};

// Initials avatar
window.Avatar = function Avatar({ initials, size = 'sm', tone = '', title }) {
  return (
    <div className={cx('avatar', size, tone)} title={title}>{initials || '·'}</div>
  );
};

// Stacked avatars
window.AvatarStack = function AvatarStack({ people, max = 4 }) {
  const show = people.slice(0, max);
  const more = people.length - show.length;
  return (
    <div className="stack">
      {show.map((p, i) => <Avatar key={i} initials={p.initials} tone={p.tone} title={p.name} size="xs" />)}
      {more > 0 && <div className="avatar xs faint" title={`+${more} more`}>+{more}</div>}
    </div>
  );
};

// Status chip
window.StatusChip = function StatusChip({ kind, label }) {
  const map = {
    unstaffed: { tone: 'red',  text: 'Unstaffed' },
    assigned:  { tone: '',     text: 'Assigned' },
    ack:       { tone: 'blue', text: 'Acknowledged' },
    live:      { tone: 'ink',  text: 'Live' },
    done:      { tone: 'green',text: 'Closed' },
    exception: { tone: 'red',  text: 'Exception' },
    signed:    { tone: 'green',text: 'Signed' },
    unsigned:  { tone: 'amber',text: 'Unsigned' },
  };
  const m = map[kind] || { tone: '', text: label || kind };
  return <span className={cx('s-chip', m.tone)}>
    {kind === 'live' && <span className="pulse" style={{ width: 6, height: 6 }}></span>}
    {m.text}
  </span>;
};

// Severity dot
window.SevDot = function SevDot({ s }) {
  const color = s === 'critical' ? 'var(--red-500)'
              : s === 'high'     ? 'var(--red-600)'
              : s === 'medium'   ? 'var(--warning)'
              : 'var(--fg-3)';
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }}></span>;
};

// Lucide icon
window.Icon = function Icon({ name, size = 14, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) window.lucide.createIcons({ icons: window.lucide.icons, attrs: { 'stroke-width': 1.5 } });
  });
  return <i ref={ref} data-lucide={name} style={{ width: size, height: size, ...style }}></i>;
};

window.officerById = function (id) {
  return (window.PN_DATA.OFFICERS || []).find(o => o.id === id);
};
window.siteById = function (id) {
  return (window.PN_DATA.SITES || []).find(s => s.id === id);
};
window.clientById = function (id) {
  return (window.PN_DATA.CLIENTS || []).find(c => c.id === id);
};
