/* global React, PN_DATA, Icon, cx, siteById, clientById */
// PilotNow — Finance handoff: DO report assembly + email delivery queue to client finance recipients.

const { useState: useStateF } = React;

// Build delivery rows from closed jobs, with a couple of synthetic states for realism.
function buildDeliveries() {
  const rows = PN_DATA.JOBS.filter(j => j.state === 'done').map((j, i) => {
    const site = siteById(j.site);
    const client = clientById(j.client);
    const signed = j.flags.includes('signed');
    let status = signed ? (i === 0 ? 'sent' : i === 1 ? 'sent' : 'queued') : 'blocked';
    return {
      id: 'DO-' + j.id.replace('J-', ''),
      job: j.id,
      site: site ? site.name : j.site,
      client: client ? client.name : j.client,
      to: client ? client.finance : '—',
      date: j.dateMono,
      hours: '12h',
      amount: i === 0 ? '$2,184.00' : i === 1 ? '$3,276.00' : '$1,092.00',
      signed,
      status, // sent | queued | bounced | blocked | pending
      attempts: status === 'sent' ? 1 : 0,
      note: signed ? (status === 'sent' ? 'Delivered · opened' : 'Ready — waiting for batch run 18:00') : 'On hold — DO not signed by site manager',
    };
  });
  // Synthetic extras from EXCEPTIONS for bounced / pending
  rows.unshift({ id: 'DO-1808', job: 'J-1808', site: 'Apex Mall — Tampines Loading Bay', client: 'Marina Bay Holdings', to: 'finance@mbholdings.sg', date: '2026-05-09', hours: '12h', amount: '$2,184.00', signed: true, status: 'bounced', attempts: 3, note: 'Mailbox full · 3 attempts · escalated to ops' });
  rows.unshift({ id: 'DO-1810', job: 'J-1810', site: 'Capital Tower', client: 'CapitaCommercial', to: 'invoices@capcom.sg', date: '2026-05-10', hours: '12h', amount: '$1,092.00', signed: true, status: 'pending', attempts: 1, note: 'Retry pending · next attempt in 12 min' });
  return rows;
}

window.FinanceScreen = function FinanceScreen({ onSelectJob }) {
  const deliveries = buildDeliveries();
  const [active, setActive] = useStateF(deliveries[0].id);
  const [filter, setFilter] = useStateF('all');
  const sel = deliveries.find(d => d.id === active) || deliveries[0];

  const STATUS = { sent: 'sent', queued: 'queued', bounced: 'bounced', blocked: 'failed', pending: 'pending' };
  const STATUS_LABEL = { sent: 'Delivered', queued: 'Queued', bounced: 'Bounced', blocked: 'Blocked', pending: 'Retry pending' };
  const STATUS_CHIP = { sent: 'green', queued: '', bounced: 'red', blocked: 'amber', pending: 'amber' };

  const counts = {
    all: deliveries.length,
    sent: deliveries.filter(d => d.status === 'sent').length,
    queued: deliveries.filter(d => d.status === 'queued').length,
    bounced: deliveries.filter(d => d.status === 'bounced' || d.status === 'pending').length,
    blocked: deliveries.filter(d => d.status === 'blocked').length,
  };
  const rows = deliveries.filter(d =>
    filter === 'all' ? true :
    filter === 'bounced' ? (d.status === 'bounced' || d.status === 'pending') :
    d.status === filter
  );

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">FINANCE HANDOFF · DO DELIVERY · MAY 2026</div>
          <h1>Delivery orders &amp; billing handoff</h1>
          <div className="meta">{counts.all} DOs in window · {counts.sent} delivered · {counts.bounced} need attention · {counts.blocked} blocked on sign-off</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost"><Icon name="download" size={13} /> Export ledger</button>
          <button className="btn btn-secondary"><Icon name="rotate-cw" size={13} /> Retry all bounced</button>
          <button className="btn btn-dark"><Icon name="send" size={13} /> Run delivery batch</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi"><span className="lbl">DOs assembled</span><span className="n">{counts.all}</span><span className="sub">last 14 days</span></div>
        <div className="kpi"><span className="lbl">Delivered</span><span className="n">{counts.sent}</span><span className="sub up">91% on first try</span></div>
        <div className="kpi"><span className="lbl">Bounced / retry</span><span className="n red">{counts.bounced}</span><span className="sub down">2 mailboxes</span></div>
        <div className="kpi"><span className="lbl">Blocked · unsigned</span><span className="n red">{counts.blocked}</span><span className="sub">awaiting site manager</span></div>
        <div className="kpi"><span className="lbl">Median latency</span><span className="n">14h</span><span className="sub up">−2h vs prev</span></div>
        <div className="kpi"><span className="lbl">Value queued</span><span className="n">$9.6k</span><span className="sub">3 DOs</span></div>
      </div>

      <div className="tb">
        <div className="seg">
          {[['all', 'All'], ['sent', 'Delivered'], ['queued', 'Queued'], ['bounced', 'Bounced / retry'], ['blocked', 'Blocked']].map(([k, l]) => (
            <button key={k} className={cx(filter === k && 'on')} onClick={() => setFilter(k)}>{l}<span style={{ opacity: 0.6, marginLeft: 4, fontFamily: 'var(--font-mono)', fontSize: 10 }}>{counts[k] != null ? counts[k] : ''}</span></button>
          ))}
        </div>
        <div className="fchip"><span className="k">Client</span> All <Icon name="chevron-down" size={11} /></div>
        <span className="spacer"></span>
        <span className="id-pill">auto-batch at 12:00 &amp; 18:00 SGT</span>
      </div>

      <div className="split">
        <div style={{ overflowY: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>DO</th><th>Job</th><th>Site</th><th>Client</th><th>Recipient</th><th>Amount</th><th>Sign-off</th><th>Delivery</th><th></th></tr></thead>
            <tbody>
              {rows.map(d => (
                <tr key={d.id} onClick={() => setActive(d.id)} style={{ cursor: 'pointer', background: d.id === active ? 'var(--bg-1)' : undefined }}>
                  <td className="mono">{d.id}</td>
                  <td className="mono">{d.job}</td>
                  <td className="strong">{d.site}</td>
                  <td>{d.client}</td>
                  <td className="mono">{d.to}</td>
                  <td className="mono">{d.amount}</td>
                  <td><span className={cx('s-chip', d.signed ? 'green' : 'amber')}>{d.signed ? 'Signed' : 'Unsigned'}</span></td>
                  <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className={cx('del-dot', STATUS[d.status])}></span>{STATUS_LABEL[d.status]}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}><Icon name="more-horizontal" size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="inspector">
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>{sel.id} · {sel.job}</div>
            <h3 style={{ marginTop: 6 }}>{sel.site}</h3>
            <div className="t-meta" style={{ marginTop: 4, color: 'var(--fg-2)' }}>{sel.client} · {sel.date} · {sel.hours}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className="btn btn-red"><Icon name="send" size={12} /> {sel.status === 'sent' ? 'Resend' : sel.status === 'blocked' ? 'Chase signature' : 'Send now'}</button>
            <button className="btn btn-secondary"><Icon name="file-text" size={12} /> Open DO</button>
            <button className="btn btn-ghost" onClick={() => onSelectJob && onSelectJob({ id: sel.job })}><Icon name="external-link" size={12} /> Job</button>
          </div>
          <div className="field" style={{ borderTop: '1px solid var(--border-0)', paddingTop: 12 }}>
            <div className="lbl">Delivery status</div>
            <div className="val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className={cx('del-dot', STATUS[sel.status])}></span><span className={cx('s-chip', STATUS_CHIP[sel.status])}>{STATUS_LABEL[sel.status]}</span></div>
            <div className="val" style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4 }}>{sel.note}</div>
          </div>
          <div className="field">
            <div className="lbl">Recipient</div>
            <div className="val mono">{sel.to}</div>
            <div className="val" style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>Attempts: {sel.attempts} · last {sel.status === 'sent' ? 'opened ' : 'tried '}{sel.attempts ? '2h ago' : '—'}</div>
          </div>
          <div className="field">
            <div className="lbl">Attached evidence</div>
            <div className="val mono" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
              DO report PDF (3 pp)<br/>
              Attendance log · 2 officers<br/>
              Proof photos · 12 timestamped<br/>
              GPS check-in / out trace<br/>
              {sel.signed ? 'Site manager signature ✓' : 'Signature page — UNSIGNED'}
            </div>
          </div>
          <div className="field">
            <div className="lbl">Pipeline</div>
            <div className="val mono" style={{ fontSize: 11, lineHeight: 1.7 }}>
              checkout → assemble → {sel.signed ? 'signed' : '… awaiting signature'}<br/>
              → queued → {sel.status === 'sent' ? 'sent → opened' : sel.status === 'bounced' ? 'sent → bounced ✕' : 'pending'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
