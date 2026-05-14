/* global React, PN_DATA, Avatar, AvatarStack, StatusChip, Icon, cx */
// PilotNow — Master data: clients, sites, officers.

const { useState: useStateM } = React;

window.MasterScreen = function MasterScreen() {
  const [tab, setTab] = useStateM('officers');

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">MASTER DATA · MAY 2026</div>
          <h1>People, places, payers, policies</h1>
          <div className="meta">{PN_DATA.OFFICERS.length} officers · {PN_DATA.SITES.length} sites · {PN_DATA.CLIENTS.length} clients · {PN_DATA.POLICIES.length} policies</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost"><Icon name="download" size={13} /> Export CSV</button>
          <button className="btn btn-secondary"><Icon name="upload" size={13} /> Bulk import</button>
          <button className="btn btn-red"><Icon name="plus" size={13} /> New {tab.slice(0, -1)}</button>
        </div>
      </div>

      <div className="tb">
        <div className="seg">
          <button className={cx(tab === 'officers' && 'on')} onClick={() => setTab('officers')}><Icon name="users" size={12} /> Officers</button>
          <button className={cx(tab === 'sites' && 'on')} onClick={() => setTab('sites')}><Icon name="map-pin" size={12} /> Sites</button>
          <button className={cx(tab === 'clients' && 'on')} onClick={() => setTab('clients')}><Icon name="briefcase" size={12} /> Clients</button>
          <button className={cx(tab === 'policies' && 'on')} onClick={() => setTab('policies')}><Icon name="sliders" size={12} /> Policies</button>
        </div>
        <div className="fchip"><span className="k">Status</span> All <Icon name="chevron-down" size={11} /></div>
        <div className="spacer"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-1)', border: '1px solid var(--border-0)', borderRadius: 4, padding: '4px 8px', fontSize: 12, minWidth: 220 }}>
          <Icon name="search" size={12} />
          <span style={{ color: 'var(--fg-3)' }}>Search by name, id, phone…</span>
        </div>
      </div>

      {tab === 'officers' && (
        <div style={{ overflowY: 'auto' }}>
          <table className="tbl">
            <thead><tr>
              <th>ID</th><th>Officer</th><th>Role</th><th>Phone</th><th>IC</th><th>Status</th><th>Jobs (30d)</th><th>Last shift</th><th></th>
            </tr></thead>
            <tbody>
              {PN_DATA.OFFICERS.map(o => {
                const stMap = { 'on-shift': 'ink', 'available': 'green', 'standby': 'amber', 'off': '' };
                const stLabel = { 'on-shift': 'On shift', 'available': 'Available', 'standby': 'Standby', 'off': 'Off-day' };
                return (
                  <tr key={o.id} style={{ cursor: 'pointer' }}>
                    <td className="mono">{o.id}</td>
                    <td className="strong">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar initials={o.initials} size="sm" />{o.name}
                      </div>
                    </td>
                    <td>{o.role}</td>
                    <td className="mono">{o.phone}</td>
                    <td className="mono">{o.ic}</td>
                    <td><span className={cx('s-chip', stMap[o.status])}>{stLabel[o.status]}</span></td>
                    <td className="mono">{8 + (o.id.charCodeAt(2) % 12)}</td>
                    <td className="mono">{o.status === 'on-shift' ? 'Today, in progress' : 'Yesterday, 19:00'}</td>
                    <td><button className="btn btn-ghost"><Icon name="more-horizontal" size={13} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sites' && (
        <div style={{ overflowY: 'auto' }}>
          <table className="tbl">
            <thead><tr>
              <th>ID</th><th>Site</th><th>Address</th><th>Client</th><th>Radius</th><th>Manager</th><th>Coords</th><th></th>
            </tr></thead>
            <tbody>
              {PN_DATA.SITES.map(s => {
                const c = PN_DATA.CLIENTS.find(c => c.id === s.client);
                return (
                  <tr key={s.id} style={{ cursor: 'pointer' }}>
                    <td className="mono">{s.id}</td>
                    <td className="strong">{s.name}</td>
                    <td>{s.addr}</td>
                    <td>{c && c.name}</td>
                    <td className="mono">{s.radius}m</td>
                    <td>{s.manager}</td>
                    <td className="mono">{s.coords}</td>
                    <td><button className="btn btn-ghost"><Icon name="more-horizontal" size={13} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'clients' && (
        <div style={{ overflowY: 'auto' }}>
          <table className="tbl">
            <thead><tr>
              <th>ID</th><th>Client</th><th>Billing entity</th><th>Sites</th><th>Ops contact</th><th>Phone</th><th>Finance email</th><th></th>
            </tr></thead>
            <tbody>
              {PN_DATA.CLIENTS.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }}>
                  <td className="mono">{c.id}</td>
                  <td className="strong">{c.name}</td>
                  <td>{c.billing}</td>
                  <td className="mono">{c.sites}</td>
                  <td>{c.contact}</td>
                  <td className="mono">{c.phone}</td>
                  <td className="mono">{c.finance}</td>
                  <td><button className="btn btn-ghost"><Icon name="more-horizontal" size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'policies' && <PoliciesPane />}
    </>
  );
};

function PoliciesPane() {
  const [edit, setEdit] = useStateM(PN_DATA.POLICIES[0].id);
  const policy = PN_DATA.POLICIES.find(p => p.id === edit) || PN_DATA.POLICIES[0];

  return (
    <div className="split" style={{ gridTemplateColumns: '1fr 380px' }}>
      <div style={{ overflowY: 'auto' }}>
        <div style={{ padding: '14px 24px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="eyebrow" style={{ color: 'var(--fg-2)' }}>JOB-TYPE POLICIES</span>
          <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>{PN_DATA.POLICIES.length} policies · applied to {PN_DATA.POLICIES.reduce((a, p) => a + p.active, 0)} active jobs</span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>ID</th><th>Policy</th><th>Photo interval</th><th>Grace</th><th>Late check-in</th><th>Signature</th><th>Radius</th><th>Active jobs</th>
          </tr></thead>
          <tbody>
            {PN_DATA.POLICIES.map(p => (
              <tr key={p.id} onClick={() => setEdit(p.id)} style={{ cursor: 'pointer', background: p.id === edit ? 'var(--bg-1)' : '' }}>
                <td className="mono">{p.id}</td>
                <td className="strong">{p.name}</td>
                <td className="mono">Every {p.interval} min</td>
                <td className="mono">+{p.grace}m</td>
                <td className="mono">{p.lateGrace}m → alert ops</td>
                <td><span className={cx('s-chip', p.signature === '2-step' ? 'ink' : 'amber')}>{p.signature}</span></td>
                <td className="mono">{p.radiusDefault}m</td>
                <td className="mono">{p.active}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '24px 24px 28px' }}>
          <div className="eyebrow" style={{ color: 'var(--fg-2)', marginBottom: 10 }}>HOW POLICIES APPLY</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="card" style={{ padding: 14 }}>
              <div className="t-eyebrow" style={{ color: 'var(--fg-3)' }}>1 · INTERVAL</div>
              <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45 }}>Officer's mobile prompts a photo every <strong>N minutes</strong> from check-in. GPS lat / lng captured automatically.</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="t-eyebrow" style={{ color: 'var(--fg-3)' }}>2 · LATE CHECK-IN</div>
              <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45 }}>If officer not in by <strong>shift-start + late grace</strong>, alert fires to admin (Live ops queue). No-show after escalation grace.</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="t-eyebrow" style={{ color: 'var(--fg-3)' }}>3 · SIGNATURE</div>
              <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45 }}><strong>2-step</strong> = our supervisor signs first, then client site manager acknowledges. Fresh-stroke anti-reuse enforced.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="inspector">
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>EDIT POLICY · {policy.id}</div>
          <h3 style={{ marginTop: 6 }}>{policy.name}</h3>
          <div className="t-meta" style={{ marginTop: 4, color: 'var(--fg-2)' }}>Applied to {policy.active} active jobs</div>
        </div>

        <div className="field">
          <div className="lbl">Photo interval</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {[15, 30, 60, 90, 120, 180].map(n => (
              <button key={n} className={cx('btn', policy.interval === n ? 'btn-dark' : 'btn-secondary')} style={{ minWidth: 56, justifyContent: 'center' }}>
                {n}m
              </button>
            ))}
          </div>
          <div className="t-meta" style={{ marginTop: 8 }}>Photos prompted from officer check-in. Currently <strong style={{ color: 'var(--fg-0)' }}>every {policy.interval} minutes</strong>.</div>
        </div>

        <div className="field">
          <div className="lbl">Photo grace window</div>
          <div className="val mono" style={{ marginTop: 6, fontSize: 13 }}>+{policy.grace} minutes</div>
          <div className="t-meta">After this, photo is marked LATE. After 2× grace, marked MISSED → alert.</div>
        </div>

        <div className="field">
          <div className="lbl">Late check-in trigger</div>
          <div className="val mono" style={{ marginTop: 6, fontSize: 13 }}>shift start + {policy.lateGrace}m</div>
          <div className="t-meta">Auto-alerts admin in Live ops. Escalates to no-show at +{policy.escalateAt}m.</div>
        </div>

        <div className="field">
          <div className="lbl">Pre-shift reminder</div>
          <div className="val mono" style={{ marginTop: 6, fontSize: 13 }}>{policy.startReminderBefore}m before start</div>
        </div>

        <div className="field">
          <div className="lbl">Signature flow</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button className={cx('btn', policy.signature === '2-step' ? 'btn-dark' : 'btn-secondary')} style={{ flex: 1, justifyContent: 'center' }}>2-step</button>
            <button className={cx('btn', policy.signature === 'supervisor-only' ? 'btn-dark' : 'btn-secondary')} style={{ flex: 1, justifyContent: 'center' }}>Supervisor only</button>
            <button className={cx('btn', policy.signature === 'unsigned-ok' ? 'btn-dark' : 'btn-secondary')} style={{ flex: 1, justifyContent: 'center' }}>Unsigned OK</button>
          </div>
          <div className="t-meta" style={{ marginTop: 8 }}><strong style={{ color: 'var(--fg-0)' }}>2-step</strong>: our site supervisor signs first → client site manager acknowledges. Fresh-stroke anti-reuse enforced.</div>
        </div>

        <div className="field">
          <div className="lbl">Default site radius</div>
          <div className="val mono" style={{ marginTop: 6, fontSize: 13 }}>{policy.radiusDefault}m</div>
        </div>

        <div className="field" style={{ borderTop: '1px solid var(--border-0)', paddingTop: 12 }}>
          <div className="lbl">Anti-reuse signature</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 12.5, alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 28, height: 16, background: 'var(--fg-0)', borderRadius: 8, position: 'relative' }}>
              <span style={{ position: 'absolute', right: 2, top: 2, width: 12, height: 12, background: 'var(--bg-0)', borderRadius: '50%' }}></span>
            </span>
            <span>Enforced · fresh strokes required</span>
          </div>
          <div className="t-meta" style={{ marginTop: 8 }}>Pasted, screenshot, or identical-to-previous signatures rejected. Stroke timing + pressure recorded; hash stored.</div>
        </div>

        <button className="btn btn-red" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Save changes</button>
      </div>
    </div>
  );
}
