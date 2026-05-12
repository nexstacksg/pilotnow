/* global React, PN_DATA, Avatar, AvatarStack, StatusChip, SevDot, Icon, cx, siteById, clientById, officerById */
// PilotNow — Live Ops console: exceptions queue + live job feed + evidence preview.

const { useState: useStateO } = React;

function ExceptionRow({ ex, active, onClick }) {
  return (
    <div className={cx('hl-row', 'alert')} onClick={onClick} style={active ? { background: 'var(--red-50)' } : null}>
      <SevDot s={ex.severity} />
      <div style={{ minWidth: 130 }}>
        <div style={{ fontWeight: 600, color: 'var(--fg-0)' }}>{ex.kind}</div>
        <div className="t-meta" style={{ marginTop: 2 }}>{ex.id} · {ex.job}</div>
      </div>
      <div style={{ flex: 1, color: 'var(--fg-1)' }}>{ex.msg}</div>
      <span className="id-pill" style={{ minWidth: 70, textAlign: 'right' }}>{ex.age}</span>
      <button className="btn btn-red" style={{ minWidth: 84, justifyContent: 'center' }}>{ex.action}</button>
    </div>
  );
}

function MapPanel({ jobId }) {
  const j = PN_DATA.JOBS.find(x => x.id === jobId);
  if (!j) return null;
  const site = siteById(j.site);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="map" style={{ aspectRatio: '4 / 3' }}>
        <div className="geofence" style={{ left: '50%', top: '52%', width: '46%', height: '46%' }}></div>
        <div className="pin ink" style={{ left: '50%', top: '52%' }}>S</div>
        <div className="pin" style={{ left: '70%', top: '34%' }} title="Officer 142m away">142m</div>
        <div style={{ position: 'absolute', left: 10, top: 10, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-2)', background: 'var(--bg-0)', padding: '3px 6px', border: '1px solid var(--border-0)', borderRadius: 3 }}>
          Radius {site.radius}m
        </div>
      </div>
      <div className="field">
        <div className="lbl">Site</div>
        <div className="val">{site.name}</div>
        <div className="val mono">{site.coords}</div>
      </div>
      <div className="field">
        <div className="lbl">Address</div>
        <div className="val">{site.addr}</div>
      </div>
    </div>
  );
}

function EvidencePeek({ jobId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="lbl" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent proof</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <div className="photo" style={{ aspectRatio: '1' }}>07:02 IN</div>
        <div className="photo" style={{ aspectRatio: '1' }}>09:00</div>
        <div className="photo" style={{ aspectRatio: '1' }}>11:00</div>
        <div className="photo" style={{ aspectRatio: '1', borderColor: 'var(--red-300)', color: 'var(--red-600)' }}>MISS</div>
        <div className="photo" style={{ aspectRatio: '1' }}>13:00</div>
        <div className="photo" style={{ aspectRatio: '1', background: 'var(--bg-1)' }}>—</div>
      </div>
    </div>
  );
}

window.OpsScreen = function OpsScreen({ onSelectJob }) {
  const exs = PN_DATA.EXCEPTIONS;
  const [active, setActive] = useStateO(exs[0].id);
  const ex = exs.find(e => e.id === active) || exs[0];
  const jobNum = ex.job;

  const liveJobs = PN_DATA.JOBS.filter(j => j.state === 'live' || j.state === 'exception');

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">LIVE OPERATIONS · 12 MAY · 11:42 SGT</div>
          <h1>Operations console</h1>
          <div className="meta">{exs.length} open exceptions · {liveJobs.length} jobs live · auto-refresh on</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost"><Icon name="bell" size={13} /> Mute alerts</button>
          <button className="btn btn-secondary"><Icon name="filter" size={13} /> All exceptions</button>
          <button className="btn btn-dark"><Icon name="zap" size={13} /> Bulk reassign</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi">
          <span className="lbl">Live</span>
          <span className="n">{liveJobs.length}</span>
          <span className="sub">2 in exception</span>
        </div>
        <div className="kpi">
          <span className="lbl">Unstaffed</span>
          <span className="n red">2</span>
          <span className="sub down">+1 vs avg</span>
        </div>
        <div className="kpi">
          <span className="lbl">Missing ack</span>
          <span className="n red">1</span>
          <span className="sub">Rajesh K. · T-3h</span>
        </div>
        <div className="kpi">
          <span className="lbl">No-show</span>
          <span className="n red">1</span>
          <span className="sub">EX-441 · 4m</span>
        </div>
        <div className="kpi">
          <span className="lbl">Missed proof</span>
          <span className="n">3</span>
          <span className="sub">last hour</span>
        </div>
        <div className="kpi">
          <span className="lbl">Unsigned DO</span>
          <span className="n">2</span>
          <span className="sub">6h, 14h</span>
        </div>
      </div>

      <div className="split">
        <div style={{ overflowY: 'auto' }}>
          <div style={{ padding: '14px 24px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="eyebrow" style={{ color: 'var(--fg-2)' }}>EXCEPTION QUEUE</span>
            <span className="pulse" style={{ width: 6, height: 6 }}></span>
            <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>{exs.length} open · oldest 8h</span>
            <span style={{ flex: 1 }}></span>
            <button className="btn btn-ghost" style={{ fontSize: 11 }}>Sort by severity ▾</button>
          </div>
          <div className="hl-list">
            {exs.map(e => <ExceptionRow key={e.id} ex={e} active={e.id === active} onClick={() => setActive(e.id)} />)}
          </div>

          <div style={{ padding: '20px 24px 8px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border-0)' }}>
            <span className="eyebrow" style={{ color: 'var(--fg-2)' }}>LIVE SHIFTS</span>
            <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>{liveJobs.length} in progress</span>
          </div>
          <table className="tbl">
            <thead><tr>
              <th>Job</th><th>Site</th><th>Officers</th><th>Window</th><th>Progress</th><th>Last proof</th><th>Status</th>
            </tr></thead>
            <tbody>
              {liveJobs.map(j => {
                const site = siteById(j.site);
                const ofs = j.assigned.filter(x => x !== '—').map(id => officerById(id)).filter(Boolean).map(o => ({ initials: o.initials, name: o.name }));
                return (
                  <tr key={j.id} onClick={() => onSelectJob && onSelectJob(j)} style={{ cursor: 'pointer' }}>
                    <td className="mono">{j.id}</td>
                    <td className="strong">{site && site.name}</td>
                    <td>{ofs.length ? <AvatarStack people={ofs} /> : <span style={{ color: 'var(--red-700)', fontSize: 11 }}>No-show</span>}</td>
                    <td className="mono">{j.start}–{j.end}</td>
                    <td><div className="pbar" style={{ width: 80 }}><div style={{ width: `${Math.round(j.progress * 100)}%` }}></div></div></td>
                    <td className="mono">{j.state === 'live' ? '11:00 ✓' : '—'}</td>
                    <td><StatusChip kind={j.state} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="inspector">
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>EXCEPTION · {ex.id}</div>
            <h3 style={{ marginTop: 6 }}>{ex.kind}</h3>
            <div className="t-meta" style={{ marginTop: 4, color: 'var(--fg-2)' }}>Job {ex.job} · {ex.age}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className="btn btn-red"><Icon name="user-plus" size={12} /> {ex.action}</button>
            <button className="btn btn-secondary"><Icon name="message-circle" size={12} /> Ping officer</button>
            <button className="btn btn-ghost"><Icon name="check" size={12} /> Override</button>
          </div>
          <div className="field" style={{ borderTop: '1px solid var(--border-0)', paddingTop: 12 }}>
            <div className="lbl">Summary</div>
            <div className="val" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{ex.msg}</div>
          </div>
          <MapPanel jobId={jobNum} />
          <EvidencePeek jobId={jobNum} />
          <div className="field">
            <div className="lbl">Escalation</div>
            <div className="val mono">2 reminders sent · 1 retry pending · admin notified</div>
          </div>
        </div>
      </div>
    </>
  );
};
