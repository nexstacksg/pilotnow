// Delivery board — kanban of work items (mirrors projects/[code]/delivery)
// Uses class-based kit CSS (.kcard, .pill) — no bundle dependency.
(function () {
  const TkIcon = window.TkIcon;

  const COLUMNS = [
    { key: 'todo', title: 'Todo', color: 'var(--status-todo)', items: [
      { id: 'REQ-12', title: 'Dual-status model for projects', tags: [{ label: 'BA' }], due: 'May 20', assignee: 'DG' },
      { id: 'TASK-151', title: 'Seed demo workspace + users', tags: [{ label: 'Dev' }], assignee: 'SO' },
    ]},
    { key: 'progress', title: 'In progress', color: 'var(--status-progress)', items: [
      { id: 'TASK-148', title: 'Wire up invoice PDF export', tags: [{ label: 'Finance' }, { label: 'Blocked', red: true }], due: 'May 12', overdue: true, assignee: 'LP', selected: true },
      { id: 'TASK-144', title: 'Catch-all proxy for Hono API', tags: [{ label: 'Dev' }], due: 'May 16', assignee: 'LP' },
    ]},
    { key: 'review', title: 'In review', color: 'var(--status-review)', items: [
      { id: 'BUG-7', title: 'Aging report off by one day', tags: [{ label: 'QA' }], assignee: 'MC' },
    ]},
    { key: 'qa', title: 'QA / UAT', color: 'var(--status-review)', items: [
      { id: 'TASK-139', title: 'Quotes → invoice generation flow', tags: [{ label: 'Finance' }], assignee: 'IV' },
    ]},
    { key: 'done', title: 'Done', color: 'var(--status-done)', items: [
      { id: 'TASK-132', title: 'Role-based home views', tags: [{ label: 'Dev' }], assignee: 'LP' },
      { id: 'REQ-9', title: 'Work-item engine: typed items', tags: [{ label: 'BA' }], assignee: 'DG' },
    ]},
  ];
  const TABS = [
    { id: 'board', label: 'Board', count: 8 },
    { id: 'tasks', label: 'Tasks', count: 24 },
    { id: 'sprint', label: 'Sprint' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'meetings', label: 'Meetings' },
  ];

  function Card({ it, col }) {
    return (
      <div className={`kcard${it.selected ? ' selected' : ''}`}>
        <div className="meta">
          <span className="id">{it.id}</span>
          {it.due ? <span className={`due${it.overdue ? ' overdue' : ''}`}>{it.due}</span> : null}
        </div>
        <div className="title">{it.title}</div>
        {it.tags.length > 0 && (
          <div className="tags">
            {it.tags.map((t, i) => <span key={i} className={`tag${t.red ? ' red' : ''}`}>{t.label}</span>)}
          </div>
        )}
        <div className="meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg-2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.color }} />{col.title}
          </span>
          <span className="avatar sm" title={it.assignee}>{it.assignee}</span>
        </div>
      </div>
    );
  }

  function Delivery() {
    const [tab, setTab] = React.useState('board');
    return (
      <React.Fragment>
        <div className="page-header">
          <div>
            <div className="eyebrow">DELIVERY · MERCURY</div>
            <h1>Delivery board</h1>
            <div className="meta">Acme Corp · in progress · UAT May 24</div>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-ghost"><TkIcon name="filter" size={14} />Filter</button>
            <button className="btn btn-primary"><TkIcon name="plus" size={14} />New work item</button>
          </div>
        </div>
        <div className="subnav">
          {TABS.map((t) => (
            <div key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}{t.count != null && <span className="count">{t.count}</span>}
            </div>
          ))}
        </div>
        <div className="board">
          {COLUMNS.map((col) => (
            <div key={col.key} className="column">
              <div className="column-header">
                <span className="dot" style={{ background: col.color }} />
                <span className="title">{col.title}</span>
                <span className="count">{col.items.length}</span>
                <span style={{ flex: 1 }} />
                <button className="ico-btn"><TkIcon name="plus" size={14} /></button>
              </div>
              <div className="column-body">
                {col.items.map((it) => <Card key={it.id} it={it} col={col} />)}
              </div>
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
  window.TkDelivery = Delivery;
})();
