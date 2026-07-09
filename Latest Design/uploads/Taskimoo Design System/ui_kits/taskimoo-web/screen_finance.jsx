// Finance — quotes & invoices table with KPI strip (mirrors apps/web finance)
// Uses class-based kit CSS (.tbl, .run-bar, .pill) — no bundle dependency.
(function () {
  const TkIcon = window.TkIcon;

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'quotes', label: 'Quotes', count: 4 },
    { id: 'invoices', label: 'Invoices', count: 9 },
    { id: 'payments', label: 'Payments' },
    { id: 'aging', label: 'Aging' },
  ];
  const ROWS = [
    { id: 'INV-2210', project: 'Apollo', client: 'Northwind', amount: '$31,000', status: 'Sent', tone: 'blue', due: 'May 30' },
    { id: 'INV-2208', project: 'Mercury', client: 'Acme Corp', amount: '$42,000', status: 'Overdue', tone: 'red', due: 'May 02' },
    { id: 'INV-2205', project: 'Helios', client: 'Internal', amount: '$18,500', status: 'Paid', tone: 'green', due: 'Apr 28' },
    { id: 'QT-1042', project: 'Mercury', client: 'Acme Corp', amount: '$84,000', status: 'Draft', tone: '', due: '—' },
    { id: 'QT-1039', project: 'Pulse', client: 'Bright Labs', amount: '$26,000', status: 'Accepted', tone: 'green', due: '—' },
  ];

  function Finance() {
    const [tab, setTab] = React.useState('invoices');
    return (
      <React.Fragment>
        <div className="page-header">
          <div>
            <div className="eyebrow">COMMERCIAL CONTROL</div>
            <h1>Finance</h1>
            <div className="meta">quotations · invoices · payments</div>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary"><TkIcon name="download" size={14} />Export</button>
            <button className="btn btn-primary"><TkIcon name="plus" size={14} />New quote</button>
          </div>
        </div>
        <div className="subnav">
          {TABS.map((t) => (
            <div key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}{t.count != null && <span className="count">{t.count}</span>}
            </div>
          ))}
        </div>
        <div className="page" style={{ paddingTop: 12 }}>
          <div className="run-bar">
            <div><span className="l">Invoiced (MTD)</span><span className="n">$91.5k</span></div>
            <div className="pass"><span className="l">Collected</span><span className="n">$49.5k</span></div>
            <div className="fail"><span className="l">Overdue</span><span className="n">$42k</span></div>
            <div className="block"><span className="l">Quotes outstanding</span><span className="n">$110k</span></div>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>ID</th><th>Project</th><th>Client</th><th>Amount</th><th>Status</th><th>Due</th><th></th></tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td className="strong">{r.project}</td>
                  <td>{r.client}</td>
                  <td className="mono" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--fg-0)', fontSize: 12.5 }}>{r.amount}</td>
                  <td><span className={`pill${r.tone ? ' ' + r.tone : ''}`}>{r.status}</span></td>
                  <td className="mono">{r.due}</td>
                  <td style={{ textAlign: 'right' }}><button className="ico-btn"><TkIcon name="chevron-right" size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
  window.TkFinance = Finance;
})();
