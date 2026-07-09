// Dashboard — project operations cockpit (mirrors apps/web dashboard/page.tsx)
// Uses class-based kit CSS from styles.css (no bundle dependency).
(function () {
  const TkIcon = window.TkIcon;

  const PROJECTS = [
    { name: 'Mercury', client: 'Acme Corp', stage: 'Delivery', status: 'in progress', health: 'red', ms: 62, mDone: 5, mTotal: 8, pm: 1, ba: 1, dev: 3, uat: 'May 24', delivery: 'Jun 12' },
    { name: 'Apollo', client: 'Northwind', stage: 'Delivery', status: 'in review', health: 'green', ms: 88, mDone: 7, mTotal: 8, pm: 1, ba: 1, dev: 2, uat: 'May 18', delivery: 'May 30' },
    { name: 'Helios', client: 'Internal', stage: 'QA/QC', status: 'UAT', health: 'amber', ms: 74, mDone: 6, mTotal: 9, pm: 1, ba: 2, dev: 2, uat: 'May 20', delivery: 'Jun 03' },
    { name: 'Pulse', client: 'Bright Labs', stage: 'Planning', status: 'planned', health: 'green', ms: 22, mDone: 1, mTotal: 6, pm: 1, ba: 1, dev: 1, uat: 'Jun 30', delivery: 'Jul 22' },
  ];
  const HEALTH = { red: { label: 'At risk', cls: 'red' }, amber: { label: 'Watch', cls: 'amber' }, green: { label: 'On track', cls: 'green' } };
  const BARTONE = { red: 'var(--red-500)', amber: 'var(--warning)', green: 'var(--success)' };
  const DECISIONS = [
    { tone: 'var(--red-500)', title: 'Mercury bid expires in 2 days', sub: 'Quote QT-1042 · $84,000', action: 'Approve' },
    { tone: 'var(--red-500)', title: 'TASK-148 blocked 3 days', sub: 'Mercury · invoice PDF export', action: 'Unblock' },
    { tone: 'var(--warning)', title: 'Helios UAT sign-off pending', sub: 'Internal · 6 of 9 milestones', action: 'Review' },
    { tone: 'var(--warning)', title: 'Apollo invoice ready to send', sub: 'INV-2210 · $31,000', action: 'Send' },
    { tone: 'var(--fg-3)', title: 'Pulse needs a delivery lead', sub: 'Bright Labs · planning', action: 'Assign' },
  ];

  function Bar({ pct, tone }) {
    return (
      <div style={{ width: '100%', height: 4, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: tone }} />
      </div>
    );
  }

  function Avatar({ name, tone }) {
    const inits = name.split(' ').map((p) => p[0]).slice(0, 2).join('');
    const style = tone === 'dark' ? { background: '#262626', color: '#fff' } : {};
    return <span className="avatar sm" style={style} title={name}>{inits}</span>;
  }

  function ProjectCard({ p }) {
    const users = p.pm + p.ba + p.dev;
    return (
      <div className="section">
        <div className="section-head">
          <h3>{p.name}</h3>
          <span className="meta">{p.client}</span>
          <span className="spacer" />
          <span className={`pill ${HEALTH[p.health].cls}`}>{HEALTH[p.health].label}</span>
        </div>
        <div className="section-body pad">
          <div className="col gap-3">
            <span className="mono-meta">{p.stage} · {p.status}</span>
            <div className="col" style={{ gap: 4 }}>
              <div className="row spread">
                <span className="mono-meta truncate">MILESTONES</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600 }}>{p.ms}%</span>
              </div>
              <Bar pct={p.ms} tone={BARTONE[p.health]} />
              <span className="mono-meta">{p.mDone} of {p.mTotal} milestones done</span>
            </div>
            <div className="row wrap" style={{ gap: 6, borderTop: '1px solid var(--border-0)', paddingTop: 8 }}>
              <span className="row" style={{ gap: 4, fontSize: 12.5, fontWeight: 600 }}><TkIcon name="users" size={13} />{users}</span>
              <span className="tag-mini">{p.pm} PM</span>
              <span className="tag-mini">{p.ba} BA</span>
              <span className="tag-mini">{p.dev} Dev</span>
            </div>
            <div className="row spread" style={{ borderTop: '1px solid var(--border-0)', paddingTop: 8 }}>
              <span className="col" style={{ gap: 1 }}><span className="mono-meta">UAT</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{p.uat}</span></span>
              <span className="col" style={{ gap: 1, textAlign: 'right' }}><span className="mono-meta">DELIVERY</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{p.delivery}</span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Dashboard() {
    return (
      <div className="page">
        <div>
          <div className="t-eyebrow">Owner · Tue 12 May</div>
          <div className="t-h1" style={{ marginTop: -2 }}>Good morning, Ken.</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>4 projects · 19 deployed · 2 free now · 5 decisions</div>
        </div>

        <div className="run-bar">
          <div><span className="l">Projects</span><span className="n">4</span></div>
          <div><span className="l">People deployed</span><span className="n">19</span></div>
          <div><span className="l">Developers</span><span className="n">8</span></div>
          <div><span className="l">BAs</span><span className="n">5</span></div>
          <div className="fail"><span className="l">At risk</span><span className="n">1</span></div>
          <div><span className="l">Available now</span><span className="n">2</span></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 12, alignItems: 'start' }}>
          <div className="col gap-3" style={{ minWidth: 0 }}>
            <div className="row spread">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Projects</span>
              <span className="mono-meta">bidding → active · 4 total</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
              {PROJECTS.map((p) => <ProjectCard key={p.name} p={p} />)}
            </div>
            <div className="section">
              <div className="section-head"><h3>Availability</h3><span className="meta">who's free &amp; freeing up</span></div>
              <div className="section-body pad">
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div className="col gap-2">
                    <div className="row spread" style={{ gap: 16 }}><span className="mono-meta">AVAILABLE NOW</span><span className="pill green">2</span></div>
                    <div className="row gap-2"><Avatar name="Sam Okafor" /><div className="col"><span style={{ fontSize: 12.5, fontWeight: 600 }}>Sam Okafor</span><span className="mono-meta">Developer</span></div></div>
                    <div className="row gap-2"><Avatar name="Ivy Tran" /><div className="col"><span style={{ fontSize: 12.5, fontWeight: 600 }}>Ivy Tran</span><span className="mono-meta">QA engineer</span></div></div>
                  </div>
                  <div className="col gap-2">
                    <div className="row spread" style={{ gap: 16 }}><span className="mono-meta">FREE NEXT WEEK</span><span className="pill amber">3</span></div>
                    <span className="mono-meta" style={{ maxWidth: 160 }}>Maya (PM), Lin (Dev), Diego (QA) roll off Apollo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section" style={{ position: 'sticky', top: 0 }}>
            <div className="section-head"><h3>Needs your decision</h3><span className="meta">5</span></div>
            <div className="section-body">
              <div className="feed">
                {DECISIONS.map((d, i) => (
                  <div key={i} className="feed-row" style={{ alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.tone, flexShrink: 0 }} />
                    <span className="grow col" style={{ gap: 1, minWidth: 0 }}>
                      <span className="truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>{d.title}</span>
                      <span className="mono-meta truncate">{d.sub}</span>
                    </span>
                    <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid var(--border-1)', borderRadius: 4, padding: '2px 6px', color: 'var(--fg-1)', flexShrink: 0 }}>{d.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  window.TkDashboard = Dashboard;
})();
