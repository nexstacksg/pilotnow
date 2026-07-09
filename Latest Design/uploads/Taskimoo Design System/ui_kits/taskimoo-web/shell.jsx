// App shell: Sidebar + Topbar. Uses kit CSS classes from styles.css.
(function () {
  const TkIcon = window.TkIcon;

  const NAV_TOP = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'my-tasks', label: 'My tasks', icon: 'inbox', count: 7 },
    { id: 'delivery', label: 'Projects', icon: 'folders', count: 12 },
    { id: 'finance', label: 'Finance', icon: 'banknote' },
  ];
  const PINNED = [
    { id: 'mercury', name: 'Mercury', dot: 'var(--status-progress)', blocked: 2 },
    { id: 'apollo', name: 'Apollo', dot: 'var(--status-done)' },
    { id: 'helios', name: 'Helios', dot: 'var(--status-review)' },
    { id: 'pulse', name: 'Pulse', dot: 'var(--status-todo)' },
  ];
  const NAV_ORG = [
    { id: 'team', label: 'Team', icon: 'users' },
    { id: 'changelog', label: 'Changelog', icon: 'file-text' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  function Sidebar({ active, onNavigate }) {
    return (
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ backgroundImage: "url('../../assets/logo-mark.svg')" }} />
          <div className="sidebar-brand">TASKIMOO<span className="dot">.</span></div>
        </div>
        {NAV_TOP.map((it) => (
          <div key={it.id} className={`sidebar-item${active === it.id ? ' active' : ''}`} onClick={() => onNavigate(it.id)}>
            <TkIcon name={it.icon} size={15} />
            <span>{it.label}</span>
            {it.count != null && <span className="count">{it.count}</span>}
          </div>
        ))}
        <div className="sidebar-section">
          <TkIcon name="bookmark" size={10} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
          Pinned · {PINNED.length}
        </div>
        {PINNED.map((p) => (
          <div key={p.id} className={`sidebar-item${active === p.id ? ' active' : ''}`} onClick={() => onNavigate('delivery')}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.dot, marginLeft: 3, marginRight: 4, flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            {p.blocked ? <span className="count" style={{ color: 'var(--red-700)', fontWeight: 600 }}>{p.blocked}</span> : null}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div className="sidebar-section">Workspace</div>
        {NAV_ORG.map((it) => (
          <div key={it.id} className={`sidebar-item${active === it.id ? ' active' : ''}`} onClick={() => onNavigate(it.id)}>
            <TkIcon name={it.icon} size={15} />
            <span>{it.label}</span>
          </div>
        ))}
      </aside>
    );
  }

  function Topbar({ crumbs, onSignOut, theme, onToggleTheme }) {
    return (
      <div className="topbar">
        <button className="btn btn-ghost btn-icon" title="Collapse"><TkIcon name="panel-left-close" /></button>
        <div className="breadcrumb">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="sep">/</span>}
              <span className={i === crumbs.length - 1 ? 'current' : ''}>{c}</span>
            </React.Fragment>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="search">
          <TkIcon name="search" size={13} />
          <span>Search tasks, bugs, people…</span>
          <span className="kbd">⌘K</span>
        </div>
        <button className="btn btn-ghost btn-icon" title="Theme" onClick={onToggleTheme}><TkIcon name="moon" /></button>
        <button className="btn btn-ghost btn-icon" title="Notifications"><TkIcon name="bell" /></button>
        <button className="btn btn-secondary" onClick={onSignOut} title="Log out"><TkIcon name="log-out" size={14} />Log out</button>
        <div className="avatar sm" style={{ background: '#262626', color: '#fff' }} title="Ken">KN</div>
      </div>
    );
  }

  window.TkShell = { Sidebar, Topbar };
})();
