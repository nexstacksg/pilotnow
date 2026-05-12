/* global React, PN_DATA, AvatarStack, StatusChip, Icon, cx, siteById, clientById, officerById */
// PilotNow — Jobs index. The full register of jobs (filter / search / status).

const { useState: useStateJ, useMemo: useMemoJ } = React;

window.JobsScreen = function JobsScreen({ onSelectJob, onNew }) {
  const [status, setStatus] = useStateJ('all');
  const [when, setWhen]     = useStateJ('all');

  const STATUSES = [
    { k: 'all',       label: 'All' },
    { k: 'unstaffed', label: 'Unstaffed' },
    { k: 'assigned',  label: 'Assigned' },
    { k: 'ack',       label: 'Acknowledged' },
    { k: 'live',      label: 'Live' },
    { k: 'exception', label: 'Exception' },
    { k: 'done',      label: 'Closed' },
  ];

  const rows = useMemoJ(() => {
    return PN_DATA.JOBS.filter(j =>
      (status === 'all' || j.state === status) &&
      (when === 'all' || j.date.toLowerCase() === when)
    );
  }, [status, when]);

  const counts = STATUSES.reduce((m, s) => {
    m[s.k] = s.k === 'all' ? PN_DATA.JOBS.length : PN_DATA.JOBS.filter(j => j.state === s.k).length;
    return m;
  }, {});

  const open = PN_DATA.JOBS.filter(j => j.state !== 'done').length;
  const flagged = PN_DATA.JOBS.filter(j => j.flags.length).length;

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">JOBS · REGISTER · MAY 2026</div>
          <h1>All jobs</h1>
          <div className="meta">247 jobs total · {open} open · {flagged} with active flags · 12 created today</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost"><Icon name="download" size={13} /> Export</button>
          <button className="btn btn-secondary" onClick={() => onNew && onNew('recurring')}><Icon name="repeat" size={13} /> New recurring</button>
          <button className="btn btn-red" onClick={() => onNew && onNew('single')}><Icon name="plus" size={13} /> New job</button>
        </div>
      </div>

      <div className="tb">
        <div className="seg">
          {STATUSES.map(s => (
            <button key={s.k} className={cx(status === s.k && 'on')} onClick={() => setStatus(s.k)}>
              {s.label}<span style={{ opacity: 0.6, marginLeft: 4, fontFamily: 'var(--font-mono)', fontSize: 10 }}>{counts[s.k]}</span>
            </button>
          ))}
        </div>
        <div className="seg" style={{ marginLeft: 8 }}>
          {['all', 'yesterday', 'today', 'tomorrow'].map(w => (
            <button key={w} className={cx(when === w && 'on')} onClick={() => setWhen(w)} style={{ textTransform: 'capitalize' }}>{w}</button>
          ))}
        </div>
        <div className="fchip"><span className="k">Client</span> All <Icon name="chevron-down" size={11} /></div>
        <div className="fchip"><span className="k">Type</span> All <Icon name="chevron-down" size={11} /></div>
        <div className="spacer"></div>
        <div className="search-mini" style={{ minWidth: 240, background: 'var(--bg-1)', border: '1px solid var(--border-0)', borderRadius: 4, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <Icon name="search" size={12} />
          <span style={{ color: 'var(--fg-3)' }}>Search job id, site, officer…</span>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        <table className="tbl">
          <thead><tr>
            <th>Job</th><th>Date</th><th>Site</th><th>Client</th><th>Type</th><th>Window</th><th>Staffing</th><th>Officers</th><th>Status</th><th>Flags</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(j => {
              const site = siteById(j.site);
              const client = clientById(j.client);
              const assigned = j.assigned.filter(x => x !== '—');
              const people = assigned.map(id => officerById(id)).filter(Boolean).map(o => ({ initials: o.initials, name: o.name }));
              const short = j.need - assigned.length;
              return (
                <tr key={j.id} onClick={() => onSelectJob && onSelectJob(j)} style={{ cursor: 'pointer' }}>
                  <td className="mono">{j.id}</td>
                  <td className="mono">{j.date}</td>
                  <td className="strong">{site && site.name}</td>
                  <td>{client && client.name}</td>
                  <td>{j.type}</td>
                  <td className="mono">{j.start}–{j.end}</td>
                  <td className="mono" style={short > 0 ? { color: 'var(--red-700)' } : null}>{assigned.length}/{j.need}{short > 0 ? ` · ${short} short` : ''}</td>
                  <td>{people.length ? <AvatarStack people={people} max={4} /> : <span style={{ color: 'var(--fg-3)' }}>—</span>}</td>
                  <td><StatusChip kind={j.state} /></td>
                  <td>{j.flags.length
                    ? <span style={{ color: 'var(--red-700)', fontSize: 11 }}>{j.flags.join(' · ')}</span>
                    : <span style={{ color: 'var(--fg-3)' }}>—</span>}</td>
                  <td><button className="btn btn-ghost" onClick={e => { e.stopPropagation(); }}><Icon name="more-horizontal" size={13} /></button></td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr><td colSpan={11}>
                <div className="zero"><div className="hd">Nothing here</div><div className="sb">No jobs match this filter combination.</div></div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
