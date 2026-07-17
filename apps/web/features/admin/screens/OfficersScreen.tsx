import { useEffect, useMemo, useState } from 'react';
import { Badge, DEFAULT_PAGE_SIZE, Pagination } from '../components/ui';
import { EyeIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from '../components/icons';
import { initials, money } from '../lib/format';
import type { Officer } from '../types';

const STATUS_FILTERS = ['All', 'New', 'Active', 'Inactive', 'Blocked'] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

export function OfficersScreen({
  officers,
  search,
  onDeleteOfficer,
  openOfficerEdit,
  openOfficerProfile,
}: {
  officers: Officer[];
  search: string;
  onDeleteOfficer: (id: string) => Promise<boolean>;
  openOfficerEdit: (id: string) => void;
  openOfficerProfile: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const query = search.trim().toLowerCase();

  const filteredOfficers = useMemo(() => {
    return officers
      .filter((officer) => statusFilter === 'All' || officer.status === statusFilter)
      .filter((officer) => !query || officerSearchText(officer).includes(query));
  }, [officers, query, statusFilter]);
  const statusCounts = useMemo(() => (
    STATUS_FILTERS.reduce<Record<StatusFilter, number>>((counts, status) => {
      counts[status] = status === 'All' ? officers.length : officers.filter((officer) => officer.status === status).length;
      return counts;
    }, { All: 0, New: 0, Active: 0, Inactive: 0, Blocked: 0 })
  ), [officers]);

  const pageCount = Math.max(1, Math.ceil(filteredOfficers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleOfficers = useMemo(() => filteredOfficers.slice(start, start + pageSize), [filteredOfficers, pageSize, start]);
  const from = filteredOfficers.length ? start + 1 : 0;
  const to = Math.min(start + pageSize, filteredOfficers.length);

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

  useEffect(() => {
    setPage(1);
  }, [pageSize, query, statusFilter]);

  function updateStatus(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="pn-stack">
      <div className="pn-officer-toolbar">
        <p>Officer database. Add new officers who volunteered via WhatsApp.</p>
      </div>
      <div className="pn-tabs">
        {STATUS_FILTERS.map((status) => (
          <button className={statusFilter === status ? 'active' : ''} key={status} onClick={() => updateStatus(status)} type="button">
            {status} · {statusCounts[status]}
          </button>
        ))}
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
            No officers match this status filter.
          </div>
        ) : null}
      </div>
      <Pagination from={from} label="Officer" onPageChange={setPage} onPageSizeChange={setPageSize} page={currentPage} pageCount={pageCount} pageSize={pageSize} showSinglePage to={to} total={filteredOfficers.length} />
    </div>
  );
}

function officerSearchText(officer: Officer) {
  return [
    officer.id,
    officer.code,
    officer.name,
    officer.phone,
    officer.ic ? 'IC yes verified' : 'No IC missing',
    officer.rate,
    `${officer.rate}/h`,
    officer.jobsCount,
    officer.status,
    officer.notes,
  ]
    .join(' ')
    .toLowerCase();
}
