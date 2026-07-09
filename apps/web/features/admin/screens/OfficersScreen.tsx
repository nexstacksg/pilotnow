import { Badge, Button, Card } from '../components/ui';
import { OfficersIcon } from '../components/icons';
import { initials, money } from '../lib/format';
import type { Officer } from '../types';

export function OfficersScreen({ officers, openOfficer, openOfficerProfile }: { officers: Officer[]; openOfficer: () => void; openOfficerProfile: (id: string) => void }) {
  return (
    <Card>
      <div className="pn-section-head">
        <h2>Officer records</h2>
        <Button variant="primary" onClick={openOfficer}>
          <OfficersIcon size={16} strokeWidth={2.2} />
          Add officer
        </Button>
      </div>
      <div className="pn-table pn-table-officer-list">
        <div className="pn-table-head">
          <span>Officer</span>
          <span>WhatsApp</span>
          <span>Rate</span>
          <span>IC</span>
          <span>Status</span>
          <span>Jobs</span>
        </div>
        {officers.map((officer) => (
          <button className="pn-table-row pn-click-row" key={officer.id} onClick={() => openOfficerProfile(officer.id)} type="button">
            <span className="pn-person">
              <b>{initials(officer.name)}</b>
              <span>
                <strong>{officer.name}</strong>
                <small>{officer.id}</small>
              </span>
            </span>
            <span>{officer.phone}</span>
            <span>{money(officer.rate)}/h</span>
            <span>
              <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC' : 'No IC'}</Badge>
            </span>
            <span>
              <Badge tone={officer.status === 'Active' ? 'success' : officer.status === 'Blocked' ? 'danger' : 'muted'}>{officer.status}</Badge>
            </span>
            <span>{officer.jobsCount}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
