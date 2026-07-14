import { useEffect, useMemo, useState } from 'react';
import { Badge, Button } from '../components/ui';
import { OfficersIcon } from '../components/icons';
import { initials, money } from '../lib/format';
import type { Officer } from '../types';

const PAGE_SIZE = 8;

export function OfficersScreen({ officers, openOfficer, openOfficerProfile, search }: { officers: Officer[]; openOfficer: () => void; openOfficerProfile: (id: string) => void; search: string }) {
  const [page, setPage] = useState(1);
  const query = search.trim().toLowerCase();
  const filteredOfficers = useMemo(() => officers.filter((officer) => !query || officerSearchText(officer).includes(query)), [officers, query]);
  const pageCount = Math.max(1, Math.ceil(filteredOfficers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleOfficers = useMemo(() => filteredOfficers.slice(start, start + PAGE_SIZE), [filteredOfficers, start]);
  const from = filteredOfficers.length ? start + 1 : 0;
  const to = Math.min(start + PAGE_SIZE, filteredOfficers.length);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="pn-stack">
      <div className="pn-officer-toolbar">
        <p>Officer database. Add new officers who volunteered via WhatsApp.</p>
        <Button variant="primary" onClick={openOfficer}>
          <OfficersIcon size={16} strokeWidth={2.2} />
          Add officer
        </Button>
      </div>
      <div className="pn-table pn-table-officer-list">
        <div className="pn-table-head">
          <span>Officer</span>
          <span>WhatsApp</span>
          <span>IC</span>
          <span>Rate</span>
          <span>Jobs</span>
          <span>Status</span>
        </div>
        {visibleOfficers.map((officer) => (
          <button className="pn-table-row pn-click-row" key={officer.id} onClick={() => openOfficerProfile(officer.id)} type="button">
            <span className="pn-person">
              <b>{initials(officer.name)}</b>
              <span>
                <strong>{officer.name}</strong>
                <small>{officer.id}</small>
              </span>
            </span>
            <span>{officer.phone}</span>
            <span>
              <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC ✓' : 'No IC'}</Badge>
            </span>
            <span>{money(officer.rate)}/h</span>
            <span>{officer.jobsCount}</span>
            <span>
              <Badge tone={officer.status === 'Active' ? 'success' : officer.status === 'Blocked' ? 'danger' : officer.status === 'New' ? 'info' : 'muted'}>{officer.status}</Badge>
            </span>
          </button>
        ))}
      </div>
      {pageCount > 1 ? <div className="pn-pagination" aria-label="Officer pagination">
        <span>
          Showing {from}-{to} of {filteredOfficers.length}
        </span>
        <div>
          <Button disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </Button>
          <strong>
            Page {currentPage} of {pageCount}
          </strong>
          <Button disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
            Next
          </Button>
        </div>
      </div> : null}
    </div>
  );
}

function officerSearchText(officer: Officer) {
  return [
    officer.id,
    officer.name,
    officer.phone,
    officer.ic ? 'IC yes' : 'No IC',
    officer.rate,
    `${officer.rate}/h`,
    officer.jobsCount,
    officer.status,
    officer.notes,
  ]
    .join(' ')
    .toLowerCase();
}
