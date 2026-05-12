/* global React, PN_DATA, Icon, cx, StatusChip, AvatarStack, siteById, clientById, officerById */
// PilotNow — Client portal (read-only client-facing view of their sites, live jobs, proof and signed DOs).

const { useState: useStateCP } = React;

window.ClientPortalScreen = function ClientPortalScreen({ onSelectJob }) {
  const [clientId, setClientId] = useStateCP('C-014');
  const client = clientById(clientId);
  const sites = PN_DATA.SITES.filter(s => s.client === clientId);
  const siteIds = sites.map(s => s.id);
  const jobs = PN_DATA.JOBS.filter(j => siteIds.includes(j.site));
  const today = jobs.filter(j => j.date === 'Today');
  const live = today.filter(j => j.state === 'live' || j.state === 'exception');
  const closed = jobs.filter(j => j.state === 'done');
  const signed = closed.filter(j => j.flags.includes('signed')).length;

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">CLIENT PORTAL · SHARED VIEW</div>
          <h1>{client && client.name}</h1>
          <div className="meta">{sites.length} sites · {today.length} jobs today · {live.length} live · DO sign-off {signed}/{closed.length}</div>
        </div>
        <div className="ph-actions">
          <select className="input" style={{ width: 220 }} value={clientId} onChange={e => setClientId(e.target.value)}>
            {PN_DATA.CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-ghost"><Icon name="link" size={13} /> Copy portal link</button>
          <button className="btn btn-secondary"><Icon name="download" size={13} /> Download month pack</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi"><span className="lbl">Sites</span><span className="n">{sites.length}</span><span className="sub">{client && client.billing}</span></div>
        <div className="kpi"><span className="lbl">Jobs today</span><span className="n">{today.length}</span><span className="sub">{today.reduce((a, j) => a + j.need, 0)} positions</span></div>
        <div className="kpi"><span className="lbl">Live now</span><span className="n">{live.length}</span><span className="sub">{live.some(j => j.flags.length) ? '1 flagged' : 'all nominal'}</span></div>
        <div className="kpi"><span className="lbl">Proof captured</span><span className="n">98%</span><span className="sub up">last 24h</span></div>
        <div className="kpi"><span className="lbl">Signed DOs</span><span className="n">{signed}/{closed.length}</span><span className="sub">{closed.length - signed} awaiting</span></div>
        <div className="kpi"><span className="lbl">Open queries</span><span className="n">0</span><span className="sub">nothing to action</span></div>
      </div>

      <div className="split">
        <div style={{ overflowY: 'auto' }}>
          <div style={{ padding: '16px 24px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>TODAY · LIVE COVERAGE</span>
            <span className="pulse" style={{ width: 6, height: 6 }}></span>
          </div>
          <table className="tbl">
            <thead><tr><th>Job</th><th>Site</th><th>Window</th><th>Officers on site</th><th>Last proof</th><th>Status</th></tr></thead>
            <tbody>
              {today.map(j => {
                const site = siteById(j.site);
                const ofs = j.assigned.filter(x => x !== '—').map(id => officerById(id)).filter(Boolean).map(o => ({ initials: o.initials, name: o.name }));
                return (
                  <tr key={j.id} style={{ cursor: 'pointer' }} onClick={() => onSelectJob && onSelectJob(j)}>
                    <td className="mono">{j.id}</td>
                    <td className="strong">{site && site.name}</td>
                    <td className="mono">{j.start}–{j.end}</td>
                    <td>{ofs.length ? <AvatarStack people={ofs} /> : <span style={{ color: 'var(--red-700)', fontSize: 11 }}>Coverage gap</span>}</td>
                    <td className="mono">{j.state === 'live' ? '11:00 ✓' : '—'}</td>
                    <td><StatusChip kind={j.state} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ padding: '20px 24px 6px', borderTop: '1px solid var(--border-0)' }}>
            <span className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>YOUR SITES</span>
          </div>
          <table className="tbl">
            <thead><tr><th>Site</th><th>Address</th><th>Site manager</th><th>Geofence</th><th>Jobs (30d)</th></tr></thead>
            <tbody>
              {sites.map((s, i) => (
                <tr key={s.id}>
                  <td className="strong">{s.name}</td>
                  <td>{s.addr}</td>
                  <td>{s.manager}</td>
                  <td className="mono">{s.radius} m</td>
                  <td className="mono">{22 + i * 7}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '20px 24px 6px', borderTop: '1px solid var(--border-0)' }}>
            <span className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>DELIVERY ORDERS · LAST 14 DAYS</span>
          </div>
          <table className="tbl">
            <thead><tr><th>DO</th><th>Site</th><th>Date</th><th>Hours</th><th>Sign-off</th><th></th></tr></thead>
            <tbody>
              {closed.map(j => {
                const site = siteById(j.site);
                const isSigned = j.flags.includes('signed');
                return (
                  <tr key={j.id}>
                    <td className="mono">DO-{j.id.replace('J-', '')}</td>
                    <td className="strong">{site && site.name}</td>
                    <td className="mono">{j.dateMono}</td>
                    <td className="mono">12h</td>
                    <td><span className={cx('s-chip', isSigned ? 'green' : 'amber')}>{isSigned ? 'Signed' : 'Awaiting site manager'}</span></td>
                    <td><a className="link-red" style={{ fontSize: 11 }}>View PDF →</a></td>
                  </tr>
                );
              })}
              {!closed.length && <tr><td colSpan={6}><div className="zero"><div className="hd">No closed jobs yet</div><div className="sb">DOs appear here once a shift checks out and the report assembles.</div></div></td></tr>}
            </tbody>
          </table>
        </div>

        <div className="inspector">
          <div className="field">
            <div className="lbl">Account</div>
            <div className="val">{client && client.name}</div>
            <div className="val mono">{client && client.billing}</div>
          </div>
          <div className="field">
            <div className="lbl">Operations contact</div>
            <div className="val">{client && client.contact}</div>
            <div className="val mono">{client && client.phone}</div>
          </div>
          <div className="field">
            <div className="lbl">Finance recipient</div>
            <div className="val mono">{client && client.finance}</div>
          </div>
          <div className="field">
            <div className="lbl">Recent proof · MBFC Tower 1</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {['07:01', '08:04', '09:00', '10:22', '11:00', '12:00'].map(t => <div key={t} className="photo" style={{ aspectRatio: '1' }}>{t}</div>)}
            </div>
          </div>
          <div className="field">
            <div className="lbl">Need something?</div>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}><Icon name="message-square" size={12} /> Raise a query</button>
            <div className="f-hint">Goes to your SecureForce ops desk · typical reply &lt; 30 min.</div>
          </div>
        </div>
      </div>
    </>
  );
};
