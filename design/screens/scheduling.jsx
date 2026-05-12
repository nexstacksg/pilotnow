/* global React, PN_DATA, Avatar, AvatarStack, StatusChip, SevDot, Icon, cx, siteById, clientById, officerById */
// PilotNow — Scheduling board (hero screen). Kanban + Timeline + Day table variants.

const { useState: useStateS, useMemo } = React;

function JobCard({ j, onClick }) {
  const site = siteById(j.site);
  const client = clientById(j.client);
  const assigned = j.assigned.filter(x => x !== '—');
  const people = assigned.map(id => officerById(id)).filter(Boolean).map(o => ({ initials: o.initials, name: o.name }));
  const missing = j.need - assigned.length;
  const flagged = j.flags.length > 0;
  return (
    <div className={cx('jcard', flagged && 'flag')} onClick={onClick}>
      <div className="row">
        <span className="id">{j.id}</span>
        <span className="when">
          <span>{j.start}</span><span className="sep">—</span><span>{j.end}</span>
        </span>
      </div>
      <div className="site">{site ? site.name : '—'}</div>
      <div className="t-meta" style={{ color: 'var(--fg-2)' }}>{client && client.name} · {j.type}</div>
      <div className="meta">
        <div className="ofs">
          {people.length ? <AvatarStack people={people} max={4} /> :
            <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>No officers</span>}
          {missing > 0 && <span className="alert" style={{ marginLeft: 6 }}><Icon name="user-minus" size={12} /> {missing} short</span>}
        </div>
        <div className="ppl"><Icon name="users" size={11} /> {assigned.length}/{j.need}</div>
      </div>
      {j.state === 'live' && (
        <div className={cx('pbar', missing > 0 && 'red')}><div style={{ width: `${Math.round(j.progress * 100)}%` }}></div></div>
      )}
      {j.flags.includes('no-show') && <div className="alert"><Icon name="alert-triangle" size={12} /> No-show — reassign now</div>}
      {j.flags.includes('no-ack:O-103') && <div className="alert"><Icon name="bell-off" size={12} /> Rajesh hasn't acknowledged</div>}
      {j.flags.includes('unstaffed') && <div className="alert"><Icon name="alert-circle" size={12} /> Unstaffed · T-{j.flags.includes('t-2h') ? '2h' : '—'}</div>}
    </div>
  );
}

function Kanban({ jobs, onSelect }) {
  const cols = [
    { key: 'unstaffed', title: 'Unstaffed',    dot: 'var(--red-500)' },
    { key: 'assigned',  title: 'Assigned',     dot: 'var(--fg-3)' },
    { key: 'ack',       title: 'Acknowledged', dot: 'var(--info)' },
    { key: 'live',      title: 'Live',         dot: 'var(--fg-0)' },
    { key: 'done',      title: 'Closed',       dot: 'var(--success)' },
    { key: 'exception', title: 'Exception',    dot: 'var(--red-500)' },
  ];
  return (
    <div className="kb">
      {cols.map(c => {
        const list = jobs.filter(j => j.state === c.key);
        return (
          <div className="kb-col" key={c.key}>
            <div className="kb-col-h">
              <span className="dot" style={{ background: c.dot }}></span>
              <span className="title">{c.title}</span>
              <span className="count">{list.length}</span>
              <span className="spacer"></span>
              <span className="add"><Icon name="plus" size={13} /></span>
            </div>
            <div className="kb-body">
              {list.map(j => <JobCard key={j.id} j={j} onClick={() => onSelect && onSelect(j)} />)}
              {!list.length && <div style={{ padding: 18, textAlign: 'center', fontSize: 11, color: 'var(--fg-3)', border: '1px dashed var(--border-0)', borderRadius: 6 }}>Empty</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Timeline({ jobs, onSelect }) {
  // 7 days starting from yesterday for context
  const days = [
    { iso: '2026-05-11', dow: 'Mon', d: 11, today: false },
    { iso: '2026-05-12', dow: 'Tue', d: 12, today: true },
    { iso: '2026-05-13', dow: 'Wed', d: 13, today: false },
    { iso: '2026-05-14', dow: 'Thu', d: 14, today: false },
    { iso: '2026-05-15', dow: 'Fri', d: 15, today: false },
    { iso: '2026-05-16', dow: 'Sat', d: 16, today: false },
    { iso: '2026-05-17', dow: 'Sun', d: 17, today: false },
  ];

  // Build officer rows including an "Unassigned" row at top
  const officers = PN_DATA.OFFICERS;
  const rows = [{ id: '__unassigned', name: 'Unassigned', role: 'needs attention', isUnassigned: true }, ...officers];

  function shiftsFor(officerId, iso) {
    return jobs.filter(j => j.dateMono === iso && (
      officerId === '__unassigned'
        ? (j.assigned.includes('—') || j.assigned.length === 0)
        : j.assigned.includes(officerId)
    ));
  }

  return (
    <div className="tl-wrap">
      <div className="tl">
        <div className="tl-head">
          <div className="tl-corner">Officer · 12 of 38</div>
          <div className="tl-days">
            {days.map(d => (
              <div className={cx('tl-day', d.today && 'today')} key={d.iso}>
                <span className="dow">{d.dow}</span>
                <span className="d">May {d.d}</span>
              </div>
            ))}
          </div>
        </div>
        {rows.map(r => (
          <div className="tl-row" key={r.id}>
            <div className="tl-officer">
              {r.isUnassigned
                ? <Avatar initials="?" tone="red" size="sm" />
                : <Avatar initials={r.initials} size="sm" />}
              <div>
                <div className="name" style={r.isUnassigned ? { color: 'var(--red-700)' } : null}>{r.name}</div>
                <div className="role">{r.role}</div>
              </div>
            </div>
            <div className="tl-cells">
              {days.map(d => (
                <div className={cx('tl-cell', d.today && 'today')} key={d.iso}>
                  {shiftsFor(r.id, d.iso).map(j => {
                    const site = siteById(j.site);
                    const isException = j.flags.includes('no-show') || j.flags.includes('unstaffed');
                    const isLive = j.state === 'live';
                    const cls = r.isUnassigned ? 'dashed' : isException ? 'red' : isLive ? 'dark' : '';
                    return (
                      <div key={j.id} className={cx('shift', cls)} onClick={() => onSelect && onSelect(j)}>
                        <div className="h-site">{site ? site.name.split(' — ')[0] : j.id}</div>
                        <div className="h-time">{j.start}–{j.end}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayTable({ jobs, onSelect }) {
  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <table className="tbl">
        <thead><tr>
          <th>Job</th><th>Site</th><th>Client</th><th>Window</th><th>Need</th><th>Officers</th><th>Status</th><th>Flags</th>
        </tr></thead>
        <tbody>
          {jobs.map(j => {
            const site = siteById(j.site);
            const client = clientById(j.client);
            const assigned = j.assigned.filter(x => x !== '—');
            const people = assigned.map(id => officerById(id)).filter(Boolean).map(o => ({ initials: o.initials, name: o.name }));
            return (
              <tr key={j.id} onClick={() => onSelect && onSelect(j)} style={{ cursor: 'pointer' }}>
                <td className="mono">{j.id}</td>
                <td className="strong">{site && site.name}</td>
                <td>{client && client.name}</td>
                <td className="mono">{j.start}–{j.end}</td>
                <td className="mono">{assigned.length}/{j.need}</td>
                <td>{people.length ? <AvatarStack people={people} max={4} /> : <span style={{ color: 'var(--fg-3)' }}>—</span>}</td>
                <td><StatusChip kind={j.state} /></td>
                <td>{j.flags.length
                  ? <span style={{ color: 'var(--red-700)', fontSize: 11 }}>{j.flags.join(' · ')}</span>
                  : <span style={{ color: 'var(--fg-3)' }}>—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

window.SchedulingScreen = function SchedulingScreen({ initialView = 'kanban', onSelectJob }) {
  const [view, setView] = useStateS(initialView);
  const [scope, setScope] = useStateS('today');
  const jobs = useMemo(() => {
    if (scope === 'today') return PN_DATA.JOBS.filter(j => j.date === 'Today');
    if (scope === 'tomorrow') return PN_DATA.JOBS.filter(j => j.date === 'Tomorrow');
    if (scope === 'week') return PN_DATA.JOBS;
    return PN_DATA.JOBS;
  }, [scope]);

  // KPIs for header
  const today = PN_DATA.JOBS.filter(j => j.date === 'Today');
  const need = today.reduce((a, j) => a + j.need, 0);
  const ack = today.reduce((a, j) => a + j.ack.length, 0);
  const exc = today.filter(j => j.flags.length > 0).length;

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">SCHEDULING · TUE 12 MAY · WEEK 20</div>
          <h1>Today on deck</h1>
          <div className="meta">{today.length} jobs · {need} positions · {ack} acknowledged · {exc} need attention</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost"><Icon name="upload" size={13} /> Import</button>
          <button className="btn btn-secondary"><Icon name="repeat" size={13} /> New recurring</button>
          <button className="btn btn-red"><Icon name="plus" size={13} /> New job</button>
        </div>
      </div>

      <div className="tb">
        <div className="seg">
          <button className={cx(view === 'kanban' && 'on')} onClick={() => setView('kanban')}><Icon name="columns-3" size={12} /> Kanban</button>
          <button className={cx(view === 'timeline' && 'on')} onClick={() => setView('timeline')}><Icon name="gantt-chart" size={12} /> Timeline</button>
          <button className={cx(view === 'table' && 'on')} onClick={() => setView('table')}><Icon name="rows-3" size={12} /> Table</button>
        </div>
        <div className="seg" style={{ marginLeft: 8 }}>
          <button className={cx(scope === 'today' && 'on')} onClick={() => setScope('today')}>Today</button>
          <button className={cx(scope === 'tomorrow' && 'on')} onClick={() => setScope('tomorrow')}>Tomorrow</button>
          <button className={cx(scope === 'week' && 'on')} onClick={() => setScope('week')}>Week</button>
        </div>
        <div className="fchip"><span className="k">Client</span> All <Icon name="chevron-down" size={11} /></div>
        <div className="fchip"><span className="k">Site</span> All <Icon name="chevron-down" size={11} /></div>
        <div className="fchip active"><span className="k">Flags</span> Risk + Exception <Icon name="x" size={11} /></div>
        <div className="spacer"></div>
        <div className="search-mini" style={{ minWidth: 220, background: 'var(--bg-1)', border: '1px solid var(--border-0)', borderRadius: 4, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <Icon name="search" size={12} />
          <span style={{ color: 'var(--fg-3)' }}>Search job, site, officer…</span>
        </div>
      </div>

      {view === 'kanban'   && <Kanban   jobs={jobs} onSelect={onSelectJob} />}
      {view === 'timeline' && <Timeline jobs={PN_DATA.JOBS} onSelect={onSelectJob} />}
      {view === 'table'    && <DayTable jobs={jobs} onSelect={onSelectJob} />}
    </>
  );
};
