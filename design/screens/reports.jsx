/* global React, PN_DATA, Icon, cx */
// PilotNow — Reporting & audit dashboard.

window.ReportsScreen = function ReportsScreen() {
  const bars = [62, 71, 58, 84, 76, 88, 64, 90, 95, 82, 91, 86, 79, 88]; // 14 days job volume
  const maxBar = Math.max(...bars);

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">REPORTING · APR 28 – MAY 11 · 14 DAYS</div>
          <h1>Operational analytics</h1>
          <div className="meta">1,184 jobs · 96.4% fill rate · 14h median report turnaround</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost"><Icon name="calendar" size={13} /> Range</button>
          <button className="btn btn-secondary"><Icon name="filter" size={13} /> Filter</button>
          <button className="btn btn-dark"><Icon name="download" size={13} /> Export PDF</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi"><span className="lbl">Jobs</span><span className="n">1,184</span><span className="sub up">+11% vs prev</span></div>
        <div className="kpi"><span className="lbl">Fill rate</span><span className="n">96.4%</span><span className="sub up">+0.8pp</span></div>
        <div className="kpi"><span className="lbl">No-shows</span><span className="n red">14</span><span className="sub down">+3</span></div>
        <div className="kpi"><span className="lbl">Proof miss</span><span className="n">2.1%</span><span className="sub up">−0.4pp</span></div>
        <div className="kpi"><span className="lbl">Signed DOs</span><span className="n">91.2%</span><span className="sub up">+1.6pp</span></div>
        <div className="kpi"><span className="lbl">Finance latency</span><span className="n">14h</span><span className="sub up">−2h</span></div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* Volume chart */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div>
              <div className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>DAILY VOLUME · 14 DAYS</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4, letterSpacing: '-0.015em' }}>Job volume vs exceptions</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--fg-2)' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--fg-0)', marginRight: 6, verticalAlign: 'middle' }}></span>Jobs</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--red-500)', marginRight: 6, verticalAlign: 'middle' }}></span>Exceptions</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 170, borderBottom: '1px solid var(--border-0)', paddingBottom: 1 }}>
            {bars.map((v, i) => {
              const exc = Math.max(2, Math.round(v * (0.04 + (i % 5) * 0.012)));
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                  <div style={{ background: 'var(--red-500)', height: `${(exc / maxBar) * 100}%`, minHeight: 2 }} title={`${exc} exceptions`}></div>
                  <div style={{ background: 'var(--fg-0)', height: `${(v / maxBar) * 100}%` }} title={`${v} jobs`}></div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>
            {['Apr 28','30','May 2','4','6','8','10'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>

        {/* Exception breakdown */}
        <div className="card" style={{ padding: 18 }}>
          <div className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>EXCEPTIONS · BY KIND</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4, letterSpacing: '-0.015em', marginBottom: 14 }}>62 incidents</div>
          {[
            { k: 'Missed proof',     n: 28, pct: 0.45 },
            { k: 'Missing ack',      n: 14, pct: 0.23 },
            { k: 'No-show',          n: 8,  pct: 0.13 },
            { k: 'Weak GPS',         n: 6,  pct: 0.10 },
            { k: 'Signature timeout',n: 4,  pct: 0.06 },
            { k: 'Email bounce',     n: 2,  pct: 0.03 },
          ].map(row => (
            <div key={row.k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 40px', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-0)' }}>
              <span style={{ fontSize: 12.5 }}>{row.k}</span>
              <span style={{ height: 6, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: `${row.pct * 100}%`, background: row.k === 'No-show' ? 'var(--red-500)' : 'var(--fg-0)' }}></span>
              </span>
              <span className="id-pill" style={{ textAlign: 'right' }}>{row.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tables */}
      <div style={{ padding: '4px 24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-0)' }}>
            <div className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>TOP CLIENTS · BY VOLUME</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Where the hours go</div>
          </div>
          <table className="tbl">
            <thead><tr><th>Client</th><th>Jobs</th><th>Hours</th><th>Fill</th><th>Exceptions</th></tr></thead>
            <tbody>
              <tr><td className="strong">CapitaCommercial</td><td className="mono">312</td><td className="mono">3,744</td><td className="mono">98.4%</td><td className="mono">8</td></tr>
              <tr><td className="strong">Marina Bay Holdings</td><td className="mono">241</td><td className="mono">2,892</td><td className="mono">97.1%</td><td className="mono">11</td></tr>
              <tr><td className="strong">Apex Mall Group</td><td className="mono">198</td><td className="mono">2,376</td><td className="mono">96.0%</td><td className="mono">14</td></tr>
              <tr><td className="strong">Changi Business Park</td><td className="mono">142</td><td className="mono">1,704</td><td className="mono">95.8%</td><td className="mono">9</td></tr>
              <tr><td className="strong">JTC Logistics Hub</td><td className="mono">128</td><td className="mono">1,536</td><td className="mono">93.0%</td><td className="mono">15</td><td/></tr>
              <tr><td className="strong">Suntec Convention</td><td className="mono">163</td><td className="mono">1,956</td><td className="mono">99.3%</td><td className="mono">5</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-0)' }}>
            <div className="t-eyebrow" style={{ color: 'var(--fg-2)' }}>OFFICER PERFORMANCE · TOP 6</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Acknowledged · checked in · signed</div>
          </div>
          <table className="tbl">
            <thead><tr><th>Officer</th><th>Shifts</th><th>Ack</th><th>Proof</th><th>Incidents</th></tr></thead>
            <tbody>
              {PN_DATA.OFFICERS.slice(0, 6).map((o, i) => (
                <tr key={o.id}>
                  <td className="strong"><div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span className="avatar xs">{o.initials}</span>{o.name}
                  </div></td>
                  <td className="mono">{18 + i * 2}</td>
                  <td className="mono">{(99.0 - i * 0.4).toFixed(1)}%</td>
                  <td className="mono">{(98.5 - i * 0.5).toFixed(1)}%</td>
                  <td className="mono">{i}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
