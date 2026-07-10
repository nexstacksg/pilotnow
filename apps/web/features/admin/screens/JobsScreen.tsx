import { Badge } from '../components/ui';
import { dateLabel, statusTone } from '../lib/format';
import type { Job, JobStatus } from '../types';

const defaultStatusViews: JobStatus[] = ['Draft', 'Waiting for Officers', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];
const statusOrder: Partial<Record<JobStatus, number>> = {
  'Waiting for Officers': 0,
  'Posted to WhatsApp': 1,
  Ongoing: 2,
  Completed: 3,
  Confirmed: 4,
  Cancelled: 5,
  Draft: 6,
};

export function JobsScreen({
  jobs,
  filter,
  setFilter,
  openJob,
}: {
  jobs: Job[];
  filter: JobStatus | 'All';
  setFilter: (filter: JobStatus | 'All') => void;
  openJob: (id: string) => void;
}) {
  const statusViews = ['All', ...defaultStatusViews, ...jobs.map((job) => job.status)].filter((item, index, list) => list.indexOf(item) === index) as (JobStatus | 'All')[];

  const filtered = (filter === 'All' ? jobs : jobs.filter((job) => job.status === filter)).slice().sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));

  return (
    <div className="pn-stack">
      <div className="pn-tabs">
        {statusViews.map((item) => (
          <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">
            {item} · {item === 'All' ? jobs.length : jobs.filter((job) => job.status === item).length}
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
              {job.officers.length}/{job.required}
            </span>
            <span>{job.billing}</span>
            <span>
              <Badge tone={statusTone[job.status]} dot>
                {job.status}
              </Badge>
            </span>
          </button>
        ))}
        {filtered.length === 0 ? <div className="pn-empty">No jobs match these filters.</div> : null}
      </div>
    </div>
  );
}
