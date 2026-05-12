/* global React, PN_DATA, Avatar, AvatarStack, StatusChip, Icon, cx, siteById, clientById, officerById */
// PilotNow — Job detail. Full timeline, evidence, signature, finance.

window.JobDetailScreen = function JobDetailScreen({ jobId, onBack }) {
  const j = PN_DATA.JOBS.find(x => x.id === jobId) || PN_DATA.JOBS[0];
  const site = siteById(j.site);
  const client = clientById(j.client);
  const ofs = j.assigned.filter(x => x !== '—').map(id => officerById(id)).filter(Boolean);

  const events = [
    { t: '07:01', icon: 'check-circle',   who: 'Tan Wei Ming',     what: 'Checked in', meta: 'GPS 24m · photo ✓', tone: 'green' },
    { t: '07:03', icon: 'check-circle',   who: 'Muhammad Hafiz',   what: 'Checked in', meta: 'GPS 8m · photo ✓', tone: 'green' },
    { t: '08:00', icon: 'camera',         who: 'System',           what: 'Proof reminder sent', meta: 'Both officers', tone: '' },
    { t: '08:04', icon: 'image',          who: 'Tan Wei Ming',     what: 'Submitted proof', meta: 'photo ✓', tone: 'green' },
    { t: '08:07', icon: 'image',          who: 'Muhammad Hafiz',   what: 'Submitted proof', meta: 'photo ✓', tone: 'green' },
    { t: '09:48', icon: 'message-square', who: 'Tan Wei Ming',     what: 'Remark logged', meta: '"Loading bay closed for cleaning until 10:30"', tone: '' },
    { t: '10:00', icon: 'camera',         who: 'System',           what: 'Proof reminder sent', meta: '', tone: '' },
    { t: '10:11', icon: 'alert-triangle', who: 'System',           what: 'Proof missed', meta: 'Muhammad Hafiz — 1st miss this shift', tone: 'red' },
    { t: '10:14', icon: 'bell',           who: 'Ops · Aira',       what: 'Pinged officer',    meta: 'WhatsApp ack received', tone: '' },
    { t: '10:22', icon: 'image',          who: 'Muhammad Hafiz',   what: 'Submitted proof', meta: 'photo ✓ · 14m late', tone: 'amber' },
    { t: '11:00', icon: 'image',          who: 'Tan Wei Ming',     what: 'Submitted proof', meta: 'photo ✓', tone: 'green' },
  ];

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a onClick={onBack} style={{ color: 'var(--fg-2)', cursor: 'pointer', textDecoration: 'none' }}>← Scheduling</a>
            <span style={{ color: 'var(--fg-4)' }}>/</span>
            <span>{j.id} · {client && client.name.toUpperCase()}</span>
          </div>
          <h1 style={{ marginTop: 6 }}>{site && site.name}</h1>
          <div className="meta">
            {j.date} · {j.start}–{j.end} · {j.type} ·{' '}
            <StatusChip kind={j.state} />
          </div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost"><Icon name="copy" size={13} /> Duplicate</button>
          <button className="btn btn-ghost"><Icon name="x-circle" size={13} /> Cancel</button>
          <button className="btn btn-secondary"><Icon name="file-text" size={13} /> Open DO report</button>
          <button className="btn btn-dark"><Icon name="user-plus" size={13} /> Reassign</button>
        </div>
      </div>

      <div className="split">
        <div style={{ overflowY: 'auto', padding: '20px 24px 28px' }}>
          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--border-0)', borderRadius: 6, marginBottom: 22 }}>
            <div style={{ padding: '12px 14px', borderRight: '1px solid var(--border-0)' }}>
              <div className="t-eyebrow" style={{ color: 'var(--fg-3)' }}>STAFFING</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{j.assigned.filter(x => x !== '—').length}/{j.need}</div>
              <div className="t-meta" style={{ marginTop: 2 }}>{j.ack.length} acknowledged</div>
            </div>
            <div style={{ padding: '12px 14px', borderRight: '1px solid var(--border-0)' }}>
              <div className="t-eyebrow" style={{ color: 'var(--fg-3)' }}>PROOFS</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em' }}>5/6</div>
              <div className="t-meta" style={{ marginTop: 2, color: 'var(--red-700)' }}>1 missed · 1 late</div>
            </div>
            <div style={{ padding: '12px 14px', borderRight: '1px solid var(--border-0)' }}>
              <div className="t-eyebrow" style={{ color: 'var(--fg-3)' }}>GPS ACCURACY</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em' }}>16m</div>
              <div className="t-meta" style={{ marginTop: 2 }}>avg · site radius {site.radius}m</div>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div className="t-eyebrow" style={{ color: 'var(--fg-3)' }}>INCIDENTS</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em' }}>0</div>
              <div className="t-meta" style={{ marginTop: 2 }}>1 remark logged</div>
            </div>
          </div>

          {/* Officers */}
          <div className="t-eyebrow" style={{ marginBottom: 10, color: 'var(--fg-2)' }}>ASSIGNED OFFICERS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 22 }}>
            {ofs.map(o => (
              <div key={o.id} className="card" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar initials={o.initials} size="lg" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{o.name}</div>
                  <div className="t-meta" style={{ marginTop: 2 }}>{o.id} · {o.role} · {o.phone}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <span className="s-chip green">Acknowledged</span>
                    <span className="s-chip">Checked in 07:0{o.initials === 'TW' ? '1' : '3'}</span>
                  </div>
                </div>
                <button className="btn btn-ghost"><Icon name="more-horizontal" size={14} /></button>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="t-eyebrow" style={{ marginBottom: 10, color: 'var(--fg-2)' }}>JOB TIMELINE</div>
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: 14, borderLeft: '1px solid var(--border-0)' }}>
            {events.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: -19, top: 12,
                  width: 9, height: 9, borderRadius: '50%',
                  background: e.tone === 'red' ? 'var(--red-500)' : e.tone === 'green' ? 'var(--success)' : e.tone === 'amber' ? 'var(--warning)' : 'var(--fg-3)',
                  border: '2px solid var(--bg-0)',
                  boxShadow: '0 0 0 1px var(--border-0)',
                }}></span>
                <span className="id-pill" style={{ minWidth: 44 }}>{e.t}</span>
                <span style={{ width: 16, color: 'var(--fg-2)', display: 'flex', alignItems: 'center' }}><Icon name={e.icon} size={13} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5 }}><strong style={{ fontWeight: 600 }}>{e.who}</strong> {e.what}</div>
                  {e.meta && <div className="t-meta" style={{ marginTop: 2, color: e.tone === 'red' ? 'var(--red-700)' : 'var(--fg-2)' }}>{e.meta}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="inspector">
          <div className="field">
            <div className="lbl">Site</div>
            <div className="val">{site && site.name}</div>
            <div className="val mono">{site && site.addr}</div>
          </div>
          <div className="field">
            <div className="lbl">Client · Finance</div>
            <div className="val">{client && client.name}</div>
            <div className="val mono">{client && client.finance}</div>
          </div>
          <div className="field">
            <div className="lbl">Site manager</div>
            <div className="val">{site && site.manager}</div>
            <div className="val mono">+65 6325 1100 · signs DO</div>
          </div>
          <div className="field">
            <div className="lbl">Notes</div>
            <div className="val" style={{ fontStyle: j.notes ? 'normal' : 'italic', color: j.notes ? 'var(--fg-0)' : 'var(--fg-3)' }}>
              {j.notes || 'No notes'}
            </div>
          </div>
          <div className="field">
            <div className="lbl">Closure</div>
            <div className="val" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span><StatusChip kind="live" /> Shift in progress · ends 20:00</span>
              <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>DO report will assemble at checkout. Signature link to {site && site.manager}.</span>
            </div>
          </div>
          <div className="field" style={{ borderTop: '1px solid var(--border-0)', paddingTop: 12 }}>
            <div className="lbl">Audit · last 5</div>
            <div className="val mono" style={{ fontSize: 11, lineHeight: 1.6 }}>
              11:14 · proof.received TW<br/>
              10:22 · proof.received MH (late)<br/>
              10:14 · admin.ping aira→MH<br/>
              10:11 · proof.missed MH<br/>
              09:48 · remark.created TW
            </div>
            <a style={{ fontSize: 11, marginTop: 4 }}>View full audit →</a>
          </div>
        </div>
      </div>
    </>
  );
};
