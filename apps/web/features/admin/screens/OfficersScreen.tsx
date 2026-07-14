import { useEffect, useMemo, useState } from 'react';
import { Badge, Button } from '../components/ui';
import { EyeIcon, MoreVerticalIcon, OfficersIcon, PencilIcon, TrashIcon } from '../components/icons';
import { initials, money } from '../lib/format';
import type { Officer, OfficerStatus } from '../types';

const PAGE_SIZE = 7;
const STATUS_FILTERS = ['All', 'New', 'Active', 'Inactive', 'Blocked'] as const;
const IC_FILTERS = ['All', 'Verified', 'Missing'] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type IcFilter = (typeof IC_FILTERS)[number];

export function OfficersScreen({
  officers,
  onDeleteOfficer,
  openOfficer,
  openOfficerEdit,
  openOfficerProfile,
}: {
  officers: Officer[];
  onDeleteOfficer: (id: string) => Promise<boolean>;
  openOfficer: () => void;
  openOfficerEdit: (id: string) => void;
  openOfficerProfile: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [icFilter, setIcFilter] = useState<IcFilter>('All');
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const filteredOfficers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return officers.filter((officer) => {
      const officerCode = officer.code ?? officer.id;
      const matchesQuery =
        !normalizedQuery ||
        officer.name.toLowerCase().includes(normalizedQuery) ||
        officer.phone.toLowerCase().includes(normalizedQuery) ||
        officerCode.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'All' || officer.status === statusFilter;
      const matchesIc = icFilter === 'All' || (icFilter === 'Verified' ? officer.ic : !officer.ic);
      return matchesQuery && matchesStatus && matchesIc;
    });
  }, [icFilter, officers, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredOfficers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleOfficers = useMemo(() => filteredOfficers.slice(start, start + PAGE_SIZE), [filteredOfficers, start]);
  const from = filteredOfficers.length ? start + 1 : 0;
  const to = Math.min(start + PAGE_SIZE, filteredOfficers.length);

  useEffect(() => {
    if (!openActionId) return;

    function closeMenu() {
      setOpenActionId(null);
    }
    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenActionId(null);
    }

    window.addEventListener('pointerdown', closeMenu);
    window.addEventListener('keydown', closeMenuOnEscape);
    return () => {
      window.removeEventListener('pointerdown', closeMenu);
      window.removeEventListener('keydown', closeMenuOnEscape);
    };
  }, [openActionId]);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateStatus(value: OfficerStatus | 'All') {
    setStatusFilter(value);
    setPage(1);
  }

  function updateIc(value: IcFilter) {
    setIcFilter(value);
    setPage(1);
  }

  return (
    <div className="pn-stack">
      <div className="pn-officer-toolbar">
        <p>Officer database. Add new officers who volunteered via WhatsApp.</p>
        <Button variant="primary" onClick={openOfficer}>
          <OfficersIcon size={16} strokeWidth={2.2} />
          Add officer
        </Button>
      </div>
      <div className="pn-officer-filters">
        <label className="pn-officer-search">
          <span>Search officers</span>
          <input
            aria-label="Search officers by name, phone, or officer code"
            placeholder="Name, phone, or code"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
          />
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => updateStatus(event.target.value as StatusFilter)}>
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>IC</span>
          <select value={icFilter} onChange={(event) => updateIc(event.target.value as IcFilter)}>
            {IC_FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter === 'All' ? 'All IC statuses' : filter}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="pn-table pn-table-officer-list">
        <div className="pn-table-head">
          <span>Officer</span>
          <span>WhatsApp</span>
          <span>IC</span>
          <span>Rate</span>
          <span>Jobs</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {visibleOfficers.map((officer) => (
          <div
            className="pn-table-row pn-click-row"
            key={officer.id}
            onClick={() => openOfficerProfile(officer.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openOfficerProfile(officer.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="pn-person">
              <b>{initials(officer.name)}</b>
              <span>
                <strong>{officer.name}</strong>
                <small>{officer.code ?? officer.id}</small>
              </span>
            </span>
            <span>{officer.phone}</span>
            <span>
              <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC ✓' : 'No IC'}</Badge>
            </span>
            <span><strong>{money(officer.rate)}/h</strong></span>
            <span><strong>{officer.jobsCount}</strong></span>
            <span>
              <Badge tone={officer.status === 'Active' ? 'success' : officer.status === 'Blocked' ? 'danger' : officer.status === 'New' ? 'info' : 'muted'}>{officer.status}</Badge>
            </span>
            <span className="pn-row-actions" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
              <button
                className="pn-action-menu-trigger"
                type="button"
                aria-label={`Open actions for ${officer.name}`}
                aria-expanded={openActionId === officer.id}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenActionId((value) => (value === officer.id ? null : officer.id));
                }}
              >
                <MoreVerticalIcon size={16} strokeWidth={2.2} />
              </button>
              {openActionId === officer.id ? (
                <div className="pn-action-menu" onPointerDown={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenActionId(null);
                      openOfficerProfile(officer.id);
                    }}
                  >
                    <EyeIcon size={15} strokeWidth={2.1} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenActionId(null);
                      openOfficerEdit(officer.id);
                    }}
                  >
                    <PencilIcon size={15} strokeWidth={2.1} />
                    Edit
                  </button>
                  <button
                    className="is-danger"
                    type="button"
                    onClick={() => {
                      setOpenActionId(null);
                      void onDeleteOfficer(officer.id);
                    }}
                  >
                    <TrashIcon size={15} strokeWidth={2.1} />
                    Delete
                  </button>
                </div>
              ) : null}
            </span>
          </div>
        ))}
        {!visibleOfficers.length ? (
          <div className="pn-table-empty">
            No officers match the current filters.
          </div>
        ) : null}
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
