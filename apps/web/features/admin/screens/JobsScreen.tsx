import { useEffect, useState } from 'react';
import { Badge, DEFAULT_PAGE_SIZE, Pagination } from '../components/ui';
import type { DashboardQueues } from '../lib/dashboard-api';
import { dateLabel, statusTone } from '../lib/format';
import type { Job, JobListFilter, JobStatus } from '../types';

const defaultStatusViews: JobStatus[] = ['Draft Created', 'Posted/Waiting', 'Officers confirmed', 'Job ongoing', 'Awaiting sign-off', 'Completed', 'Cancelled'];
const PAGE_SIZE = 8;

export function JobsScreen({
  jobs,
  filter,
  search,
  setFilter,
  queues,
  openJob,
}: {
  jobs: Job[];
  filter: JobListFilter;
  search: string;
  setFilter: (filter: JobListFilter) => void;
  queues?: DashboardQueues;
  openJob: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const statusViews = ['All', ...defaultStatusViews] as JobListFilter[];
  const query = search.trim().toLowerCase();

  const filtered = jobs
    .filter((job) => matchesJobFilter(job, filter))
    .filter((job) => !query || jobSearchText(job).includes(query));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleJobs = filtered.slice(start, start + pageSize);
  const from = filtered.length ? start + 1 : 0;
  const to = Math.min(start + pageSize, filtered.length);

  useEffect(() => {
    setPage(1);
  }, [filter, pageSize, query]);

  function countFor(item: JobListFilter) {
    return jobs.filter((job) => matchesJobFilter(job, item)).length;
  }

  return (
    <div className="pn-stack">
      <div className="pn-tabs">
        {statusViews.map((item) => (
          <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">
            {item} · {countFor(item)}
          </button>
        ))}
      </div>
      <div className="pn-table pn-table-jobs">
        <div className="pn-table-head">
          <span>Job ID</span>
          <span>Customer / location</span>
          <span>Date & time</span>
          <span>Officers</span>
          <span>Billing</span>
          <span>Status</span>
        </div>
        {visibleJobs.map((job) => (
          <button className="pn-table-row" key={job.id} onClick={() => openJob(job.id)} type="button">
            <span className="pn-mono">{job.id}</span>
            <span>
              <strong>{job.customer}</strong>
              <small>{job.location}</small>
            </span>
            <span>
              <strong>{dateLabel(job.date)}</strong>
              <small>
                {job.start}-{job.end}
              </small>
            </span>
            <span>
              <span className={`pn-officers-badge ${job.officers.length >= job.required ? 'is-full' : 'is-short'}`}>
                {job.officers.length}/{job.required}
              </span>
            </span>
            <span>{job.billing}</span>
            <span>
              <Badge tone={statusTone[job.status]} dot>
                {job.status}
              </Badge>
              {/* {job.posted && job.status !== 'Draft Created' ? <small>WhatsApp posted</small> : null} */}
            </span>
          </button>
        ))}
        {filtered.length === 0 ? <div className="pn-empty">No jobs match these filters.</div> : null}
      </div>
      <Pagination from={from} label="Job" onPageChange={setPage} onPageSizeChange={setPageSize} page={currentPage} pageCount={pageCount} pageSize={pageSize} showSinglePage to={to} total={filtered.length} />
    </div>
  );
}

function matchesJobFilter(job: Job, filter: JobListFilter) {
  if (filter === 'All') return true;
  if (filter === 'Today' || filter === 'Needs staffing' || filter === 'Missing photos') return true;
  return job.status === filter;
}

function jobSearchText(job: Job) {
  return [
    job.id,
    job.customer,
    job.location,
    job.date,
    dateLabel(job.date),
    job.start,
    job.end,
    `${job.officers.length}/${job.required}`,
    job.billing,
    job.status,
    job.description,
    job.instructions,
    job.invoice,
    job.officers.map((officer) => officer.name).join(' '),
  ]
    .join(' ')
    .toLowerCase();
}
