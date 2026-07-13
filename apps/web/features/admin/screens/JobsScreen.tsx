import { Badge } from '../components/ui';
import type { DashboardQueues } from '../lib/dashboard-api';
import { dateLabel, statusTone } from '../lib/format';
import type { Job, JobListFilter, JobStatus } from '../types';

const defaultStatusViews: JobStatus[] = ['Draft', 'Open', 'Assigned', 'Ongoing', 'Completed', 'Cancelled'];
const statusOrder: Partial<Record<JobStatus, number>> = {
  Draft: 0,
  Open: 1,
  Assigned: 2,
  Ongoing: 3,
  Completed: 4,
  Cancelled: 5,
};

export function JobsScreen({
  jobs,
  filter,
  setFilter,
  queues,
  openJob,
}: {
  jobs: Job[];
  filter: JobListFilter;
  setFilter: (filter: JobListFilter) => void;
  queues: DashboardQueues;
  openJob: (id: string) => void;
}) {
  const statusViews: JobListFilter[] = ['Today', 'Needs staffing', 'Ongoing', 'Missing photos', 'All', ...defaultStatusViews.filter((status) => status !== 'Ongoing')];
  const queueIds: Partial<Record<JobListFilter, string[]>> = {
    Today: queues.todayJobs,
    'Needs staffing': queues.waitingJobs,
    Ongoing: queues.ongoingJobs,
    'Missing photos': queues.missingPhotos,
  };
  const selectedIds = queueIds[filter];

  const filtered = (selectedIds ? jobs.filter((job) => selectedIds.includes(job.id)) : filter === 'All' ? jobs : jobs.filter((job) => job.status === filter))
    .slice()
    .sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));
  const countFor = (item: JobListFilter) => queueIds[item]?.length ?? (item === 'All' ? jobs.length : jobs.filter((job) => job.status === item).length);

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
        {filtered.map((job) => (
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
              {/* {job.posted && job.status !== 'Draft' ? <small>WhatsApp posted</small> : null} */}
            </span>
          </button>
        ))}
        {filtered.length === 0 ? <div className="pn-empty">No jobs match these filters.</div> : null}
      </div>
    </div>
  );
}
