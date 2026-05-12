/* global React, Icon, cx */
// PilotNow — Settings: operating rules for the whole tenant (GPS, proof, escalation, notifications, finance).

const { useState: useStateSet } = React;

function Toggle({ on, onClick }) { return <span className={cx('switch', on && 'on')} onClick={onClick}></span>; }

function SetRow({ nm, ds, control }) {
  return (
    <div className="set-row">
      <div className="meta"><div className="nm">{nm}</div>{ds && <div className="ds">{ds}</div>}</div>
      {control}
    </div>
  );
}

const SECTIONS = [
  { id: 'general',  label: 'General', icon: 'sliders-horizontal' },
  { id: 'gps',      label: 'GPS & proof', icon: 'map-pin' },
  { id: 'escal',    label: 'Escalation', icon: 'alert-triangle' },
  { id: 'notify',   label: 'Notifications', icon: 'message-square' },
  { id: 'finance',  label: 'Finance & DO', icon: 'file-text' },
  { id: 'roles',    label: 'Roles & access', icon: 'users' },
];

window.SettingsScreen = function SettingsScreen() {
  const [sec, setSec] = useStateSet('general');
  const [t, setT] = useStateSet({
    skipPH: true, autoAck: false, weakGpsHold: true, requireProofPhoto: true,
    overrideAudit: true, retryBounce: true, weeklyDigest: true, dark2fa: false,
  });
  const tog = k => setT(s => ({ ...s, [k]: !s[k] }));

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">SETTINGS · OPERATING RULES · SECUREFORCE SG</div>
          <h1>Operating rules</h1>
          <div className="meta">Tenant-wide defaults · per-site and per-job overrides still apply on top</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost">Discard changes</button>
          <button className="btn btn-red"><Icon name="check" size={13} /> Save rules</button>
        </div>
      </div>

      <div className="split" style={{ gridTemplateColumns: '220px 1fr' }}>
        <div className="inspector" style={{ borderLeft: 'none', borderRight: '1px solid var(--border-0)', gap: 2, padding: '14px 10px' }}>
          {SECTIONS.map(s => (
            <div key={s.id} className={cx('rail-item', sec === s.id && 'active')} onClick={() => setSec(s.id)}>
              <Icon name={s.icon} size={14} /><span>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ overflowY: 'auto' }}>
          <div className="form-wrap">
            {sec === 'general' && (
              <div className="form-card">
                <div className="hd"><span className="t-eyebrow">General</span></div>
                <div className="bd" style={{ gap: 0 }}>
                  <div className="form-grid" style={{ paddingBottom: 14, borderBottom: '1px solid var(--border-0)', marginBottom: 4 }}>
                    <div><label className="f-label">Company / tenant name</label><input className="input" defaultValue="SecureForce SG" /></div>
                    <div><label className="f-label">Default timezone</label><select className="input" defaultValue="SGT"><option>SGT (UTC+8)</option><option>UTC</option></select></div>
                    <div><label className="f-label">Operating hours</label><input className="input" defaultValue="00:00 – 24:00 (24/7)" /></div>
                    <div><label className="f-label">Working week starts</label><select className="input"><option>Monday</option><option>Sunday</option></select></div>
                  </div>
                  <SetRow nm="Skip public holidays in recurring jobs" ds="Recurring schedules won't generate jobs on SG public holidays" control={<Toggle on={t.skipPH} onClick={() => tog('skipPH')} />} />
                  <SetRow nm="Compact density by default" ds="New users start in compact mode (overridable per user)" control={<Toggle on={true} />} />
                </div>
              </div>
            )}

            {sec === 'gps' && (
              <div className="form-card">
                <div className="hd"><span className="t-eyebrow">GPS &amp; proof rules</span></div>
                <div className="bd" style={{ gap: 0 }}>
                  <div className="form-grid cols-3" style={{ paddingBottom: 14, borderBottom: '1px solid var(--border-0)', marginBottom: 4 }}>
                    <div><label className="f-label">Default site radius</label><input className="input" defaultValue="80 m" /></div>
                    <div><label className="f-label">Soft-fail tolerance</label><input className="input" defaultValue="+50 m (flag, allow)" /></div>
                    <div><label className="f-label">Default proof interval</label><select className="input" defaultValue="60"><option value="0">Off</option><option value="60">Every 60 min</option><option value="120">Every 2 hours</option></select></div>
                  </div>
                  <SetRow nm="Require photo on every proof" ds="A timestamped photo is mandatory; text-only proof is rejected" control={<Toggle on={t.requireProofPhoto} onClick={() => tog('requireProofPhoto')} />} />
                  <SetRow nm="Hold weak-GPS check-ins for review" ds="Check-ins beyond tolerance go to the ops review queue instead of auto-accepting" control={<Toggle on={t.weakGpsHold} onClick={() => tog('weakGpsHold')} />} />
                  <SetRow nm="Evidence retention" ds="How long proof photos and GPS traces are kept" control={<select className="input" style={{ width: 130 }} defaultValue="365"><option value="180">180 days</option><option value="365">12 months</option><option value="730">24 months</option></select>} />
                </div>
              </div>
            )}

            {sec === 'escal' && (
              <div className="form-card">
                <div className="hd"><span className="t-eyebrow">Escalation timers</span></div>
                <table className="tbl">
                  <thead><tr><th>Trigger</th><th>First reminder</th><th>Escalate to admin</th><th>Auto-action</th><th></th></tr></thead>
                  <tbody>
                    <tr><td className="strong">No acknowledgement after assignment</td><td className="mono">+15 min</td><td className="mono">+45 min</td><td>Suggest reassign</td><td><Toggle on={true} /></td></tr>
                    <tr><td className="strong">No check-in by shift start</td><td className="mono">+5 min</td><td className="mono">+15 min</td><td>Open no-show exception</td><td><Toggle on={true} /></td></tr>
                    <tr><td className="strong">Missed periodic proof</td><td className="mono">+5 min</td><td className="mono">2nd miss</td><td>Flag job</td><td><Toggle on={true} /></td></tr>
                    <tr><td className="strong">Job still unstaffed</td><td className="mono">T-3h</td><td className="mono">T-1h</td><td>Page on-call</td><td><Toggle on={true} /></td></tr>
                    <tr><td className="strong">DO unsigned after checkout</td><td className="mono">+2h</td><td className="mono">+6h</td><td>Resend signature link</td><td><Toggle on={true} /></td></tr>
                    <tr><td className="strong">Finance email bounced</td><td className="mono">+10 min</td><td className="mono">3 attempts</td><td>Escalate to ops</td><td><Toggle on={t.retryBounce} onClick={() => tog('retryBounce')} /></td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {sec === 'notify' && (
              <div className="form-card">
                <div className="hd"><span className="t-eyebrow">Notification templates · WhatsApp</span></div>
                <div className="bd">
                  <div><label className="f-label">Assignment offer</label><textarea className="input" rows={2} defaultValue="Hi {officer_first}, you're assigned to {site} on {date}, {start}–{end}. Reply YES to acknowledge." /></div>
                  <div><label className="f-label">Proof reminder</label><textarea className="input" rows={2} defaultValue="{officer_first}: proof photo due now for {site}. Send a clear photo of your post." /></div>
                  <div><label className="f-label">Site-manager signature request</label><textarea className="input" rows={2} defaultValue="Hi {manager}, the shift at {site} on {date} is complete. Please review & sign the DO: {signature_link}" /></div>
                  <SetRow nm="Auto-acknowledge after offer expiry" ds="If an officer doesn't reply, treat as declined instead of auto-accepting" control={<Toggle on={t.autoAck} onClick={() => tog('autoAck')} />} />
                  <SetRow nm="Send officers a daily roster at 20:00" ds="Next-day assignments pushed the evening before" control={<Toggle on={true} />} />
                </div>
              </div>
            )}

            {sec === 'finance' && (
              <div className="form-card">
                <div className="hd"><span className="t-eyebrow">Finance &amp; DO delivery</span></div>
                <div className="bd" style={{ gap: 0 }}>
                  <div className="form-grid" style={{ paddingBottom: 14, borderBottom: '1px solid var(--border-0)', marginBottom: 4 }}>
                    <div><label className="f-label">DO numbering format</label><input className="input" defaultValue="DO-{job_seq}" /></div>
                    <div><label className="f-label">Delivery batch times</label><input className="input" defaultValue="12:00, 18:00 SGT" /></div>
                    <div><label className="f-label">Send-from address</label><input className="input" defaultValue="ops@secureforce.sg" /></div>
                    <div><label className="f-label">Bounce retry attempts</label><select className="input" defaultValue="3"><option>1</option><option>3</option><option>5</option></select></div>
                  </div>
                  <SetRow nm="Block delivery until DO is signed" ds="Unsigned DOs stay in 'blocked' and never auto-send" control={<Toggle on={true} />} />
                  <SetRow nm="Require ops override to be audited" ds="Any manual 'send anyway' on a blocked DO writes an audit entry with reason" control={<Toggle on={t.overrideAudit} onClick={() => tog('overrideAudit')} />} />
                  <SetRow nm="Weekly billing digest to finance" ds="Monday 09:00 summary of all DOs delivered the prior week" control={<Toggle on={t.weeklyDigest} onClick={() => tog('weeklyDigest')} />} />
                </div>
              </div>
            )}

            {sec === 'roles' && (
              <div className="form-card">
                <div className="hd"><span className="t-eyebrow">Roles &amp; access</span></div>
                <table className="tbl">
                  <thead><tr><th>Role</th><th>Members</th><th>Scheduling</th><th>Live ops</th><th>Master data</th><th>Finance</th><th>Settings</th></tr></thead>
                  <tbody>
                    <tr><td className="strong">Owner</td><td className="mono">1</td><td>Full</td><td>Full</td><td>Full</td><td>Full</td><td>Full</td></tr>
                    <tr><td className="strong">Ops admin</td><td className="mono">4</td><td>Full</td><td>Full</td><td>Edit</td><td>View</td><td>—</td></tr>
                    <tr><td className="strong">Scheduler</td><td className="mono">3</td><td>Full</td><td>View</td><td>View</td><td>—</td><td>—</td></tr>
                    <tr><td className="strong">Finance</td><td className="mono">2</td><td>—</td><td>—</td><td>View</td><td>Full</td><td>—</td></tr>
                    <tr><td className="strong">Client (portal)</td><td className="mono">12</td><td>—</td><td>Own sites</td><td>—</td><td>Own DOs</td><td>—</td></tr>
                  </tbody>
                </table>
                <div className="bd">
                  <SetRow nm="Require 2FA for Owner & Ops admin" ds="Time-based one-time code on every login" control={<Toggle on={t.dark2fa} onClick={() => tog('dark2fa')} />} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
