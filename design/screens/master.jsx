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
          <h1>People, places, payers</h1>
          <div className="meta">{PN_DATA.OFFICERS.length} officers · {PN_DATA.SITES.length} sites · {PN_DATA.CLIENTS.length} clients</div>
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
    </>
  );
};
