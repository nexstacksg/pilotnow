/* global React, PN_DATA, Icon, cx, SchedulingScreen, OpsScreen, JobsScreen, JobDetailScreen, CreateJobScreen, ClientPortalScreen, FinanceScreen, MasterScreen, ReportsScreen, SettingsScreen */

const { useState: useStateA, useEffect: useEffectA } = React;

const NAV = [
  { section: 'OPERATE', items: [
    { id: 'scheduling', label: 'Scheduling', icon: 'calendar-days', count: '12' },
    { id: 'ops',        label: 'Live ops',   icon: 'radio',         count: '8', alert: true },
    { id: 'jobs',       label: 'Jobs',       icon: 'briefcase',     count: '247' },
  ]},
  { section: 'MANAGE', items: [
    { id: 'master',  label: 'Master data',   icon: 'database' },
    { id: 'client',  label: 'Client portal', icon: 'building-2' },
    { id: 'finance', label: 'Finance & DO',  icon: 'receipt',     count: '4', alert: true },
    { id: 'reports', label: 'Reports',       icon: 'bar-chart-3' },
  ]},
  { section: 'SETUP', items: [
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]},
  { section: 'EXPORT', items: [
    { id: 'signature', label: 'Signature page', icon: 'pen-tool', external: 'signature.html' },
    { id: 'doreport',  label: 'DO report',      icon: 'file-text', external: 'do-report.html' },
  ]},
];

function Rail({ active, onNav }) {
  return (
    <aside className="rail">
      <div className="rail-brand">
        <div className="rail-mark"></div>
        <div className="rail-name">pilotnow<span className="dot">.</span></div>
      </div>

      {NAV.map(group => (
        <React.Fragment key={group.section}>
          <div className="rail-section">{group.section}</div>
          {group.items.map(it => (
            <div
              key={it.id}
              className={cx('rail-item', active === it.id && 'active')}
              onClick={() => {
                if (it.external) window.open(it.external, '_blank');
                else onNav(it.id);
              }}
            >
              <Icon name={it.icon} size={14} />
              <span>{it.label}</span>
              {it.external && <Icon name="external-link" size={11} />}
              {it.count && <span className={cx('count', it.alert && 'red')}>{it.count}</span>}
            </div>
          ))}
        </React.Fragment>
      ))}

      <div className="rail-footer">
        <div className="rail-user">
          <span className="avatar sm">AL</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-0)' }}>Aira Ling</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>Ops · SecureForce</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ active }) {
  const titleMap = {
    scheduling: 'Scheduling',
    ops: 'Live ops',
    jobs: 'Jobs',
    'job-detail': 'Job detail',
    create: 'New job',
    client: 'Client portal',
    finance: 'Finance & DO',
    master: 'Master data',
    reports: 'Reports',
    settings: 'Settings',
  };
  return (
    <div className="topbar">
      <div className="crumb">
        <span>SecureForce SG</span>
        <span className="sep">/</span>
        <span className="current">{titleMap[active] || ''}</span>
      </div>
      <span className="spacer"></span>
      <div className="search-mini">
        <Icon name="search" size={12} />
        <span>Search anything…</span>
        <span className="kbd">⌘K</span>
      </div>
      <button className="btn btn-ghost"><Icon name="bell" size={14} /></button>
      <button className="btn btn-ghost"><Icon name="settings" size={14} /></button>
    </div>
  );
}

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "compact"
}/*EDITMODE-END*/;

function TweaksFAB({ open, setOpen, theme, setTheme, density, setDensity }) {
  return (
    <div className={cx('tweaks-panel', open && 'open')}>
      <div className="tweaks-h">
        <span>Tweaks</span>
        <span className="x" onClick={() => { setOpen(false); window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); }}><Icon name="x" size={13} /></span>
      </div>
      <div className="tweaks-body">
        <div className="tweak-row">
          <span className="label">Theme</span>
          <div className="tweak-seg">
            <button className={cx(theme === 'light' && 'on')} onClick={() => setTheme('light')}>Light</button>
            <button className={cx(theme === 'dark' && 'on')} onClick={() => setTheme('dark')}>Dark</button>
          </div>
        </div>
        <div className="tweak-row">
          <span className="label">Density</span>
          <div className="tweak-seg">
            <button className={cx(density === 'comfortable' && 'on')} onClick={() => setDensity('comfortable')}>Comfortable</button>
            <button className={cx(density === 'compact' && 'on')} onClick={() => setDensity('compact')}>Compact</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useStateA('scheduling');
  const [selJob, setSelJob] = useStateA(null);
  const [fromScreen, setFromScreen] = useStateA('scheduling');
  const [createMode, setCreateMode] = useStateA('single');
  const [tweakOpen, setTweakOpen] = useStateA(false);
  const [theme, setTheme] = useStateA(DEFAULTS.theme);
  const [density, setDensity] = useStateA(DEFAULTS.density);

  // Apply theme + density
  useEffectA(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-density', density);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme, density } }, '*');
  }, [theme, density]);

  // Edit mode protocol
  useEffectA(() => {
    function onMsg(e) {
      if (e.data && e.data.type === '__activate_edit_mode') setTweakOpen(true);
      if (e.data && e.data.type === '__deactivate_edit_mode') setTweakOpen(false);
    }
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Re-render lucide on screen change
  useEffectA(() => {
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.5 } });
  });

  const NAV_SCREENS = ['scheduling', 'ops', 'jobs', 'master', 'client', 'finance', 'reports', 'settings'];

  function handleNav(id) {
    setActive(id);
    setSelJob(null);
  }
  function selectJob(j) {
    setFromScreen(NAV_SCREENS.includes(active) ? active : 'jobs');
    setSelJob(j.id);
    setActive('job-detail');
  }
  function newJob(mode) {
    setFromScreen(NAV_SCREENS.includes(active) ? active : 'scheduling');
    setCreateMode(mode || 'single');
    setActive('create');
  }

  let screen;
  if (active === 'scheduling') screen = <SchedulingScreen onSelectJob={selectJob} onNew={newJob} />;
  else if (active === 'ops')      screen = <OpsScreen onSelectJob={selectJob} />;
  else if (active === 'jobs')     screen = <JobsScreen onSelectJob={selectJob} onNew={newJob} />;
  else if (active === 'job-detail') screen = <JobDetailScreen jobId={selJob || 'J-1815'} onBack={() => setActive(fromScreen)} />;
  else if (active === 'create')   screen = <CreateJobScreen mode={createMode} onBack={() => setActive(fromScreen)} />;
  else if (active === 'client')   screen = <ClientPortalScreen onSelectJob={selectJob} />;
  else if (active === 'finance')  screen = <FinanceScreen onSelectJob={selectJob} />;
  else if (active === 'master')   screen = <MasterScreen />;
  else if (active === 'reports')  screen = <ReportsScreen />;
  else if (active === 'settings') screen = <SettingsScreen />;

  const railActive = active === 'job-detail' ? fromScreen : active === 'create' ? fromScreen : active;

  return (
    <div className="shell" data-screen-label={active}>
      <Rail active={railActive} onNav={handleNav} />
      <main className="page">
        <Topbar active={active} />
        {screen}
      </main>
      <TweaksFAB open={tweakOpen} setOpen={setTweakOpen} theme={theme} setTheme={setTheme} density={density} setDensity={setDensity} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
