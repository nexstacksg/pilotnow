import { CalendarIcon, CameraOffIcon, ClockIcon, PaymentIcon, PlusIcon, TargetIcon } from '../components/icons';
import { Badge, Card, StatCard } from '../components/ui';
import { TODAY, dateLabel, statusTone } from '../lib/format';
import type { Job, Screen } from '../types';

export function DashboardScreen({
  jobs,
  stats,
  openCreateJob,
  openJob,
  setScreen,
}: {
  jobs: Job[];
  stats: { todayJobs: number; openJobs: number; ongoingJobs: number; missingPhotos: number; officersNeeded: number; notBilled: number };
  openCreateJob: () => void;
  openJob: (id: string) => void;
  setScreen: (screen: Screen) => void;
}) {
  const todayJobs = jobs.filter((job) => job.date === TODAY && job.status !== 'Cancelled');
  const missing = jobs.flatMap((job) => job.photos.filter((photo) => photo.status === 'missing').map((photo) => ({ job, photo })));
  const notBilled = jobs.filter((job) => job.status === 'Completed' && job.billing === 'Not Billed');

  return (
    <div className="pn-stack">
      <div className="pn-stats">
        <StatCard icon={<CalendarIcon size={16} stroke="#0A0A0A" strokeWidth={2} />} label="Today's jobs" value={stats.todayJobs} hint={`scheduled for ${dateLabel(TODAY)}`} tone="muted" />
        <StatCard icon={<ClockIcon size={16} stroke="#8A5A00" strokeWidth={2} />} label="Waiting for officers" value={stats.openJobs} hint={`${stats.officersNeeded} officers still needed`} tone="warning" />
        <StatCard icon={<TargetIcon size={16} stroke="#1F4FA3" strokeWidth={2} />} label="Ongoing jobs" value={stats.ongoingJobs} hint="officers on duty now" tone="muted" />
        <StatCard icon={<CameraOffIcon size={16} stroke="#FF3B30" strokeWidth={2} />} label="Missing hourly photos" value={stats.missingPhotos} hint="needs follow-up" tone="danger" />
      </div>

      <div className="pn-grid-two">
        <Card className="pn-table-card">
          <div className="pn-section-head">
            <h2>Today's jobs</h2>
            <button onClick={() => setScreen('jobs')} type="button">
              View all →
            </button>
          </div>
          <div className="pn-table pn-table-4">
            <div className="pn-table-head">
              <span>Job</span>
              <span>Location</span>
              <span>Officers</span>
              <span>Status</span>
            </div>
            {todayJobs.map((job) => (
              <button className="pn-table-row" key={job.id} onClick={() => openJob(job.id)} type="button">
                <span>
                  <strong className="pn-mono">{job.id}</strong>
                  <small>
                    {job.start}-{job.end}
                  </small>
                </span>
                <span>
                  <strong>{job.location}</strong>
                  <small>{job.customer}</small>
                </span>
                <span>
                  <span className={`pn-officers-badge ${job.officers.length >= job.required ? 'is-full' : 'is-short'}`}>
                    {job.officers.length}/{job.required}
                  </span>
                </span>
                <span>
                  <Badge tone={statusTone[job.status]} dot>
                    {job.status}
                  </Badge>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <div className="pn-stack">
          <Card>
            <h2>Quick actions</h2>
            <div className="pn-action-grid">
              <button onClick={openCreateJob} type="button">
                <PlusIcon size={18} stroke="#0A0A0A" strokeWidth={2} />
                <span>Create Job</span>
              </button>
              <button onClick={() => setScreen('payments')} type="button">
                <PaymentIcon size={18} stroke="#0A0A0A" strokeWidth={2} />
                <span>Run Payments</span>
              </button>
            </div>
          </Card>

          <Card className="pn-table-card pn-rail-card">
            <div className="pn-section-head">
              <h2 className="pn-heading-with-dot">
                <span className="pn-red-dot" aria-hidden="true" />
                Missing hourly photos
              </h2>
              <span aria-disabled="true" className="pn-rail-count">
                {missing.length}
              </span>
            </div>
            {missing.map(({ job, photo }) => (
              <button className="pn-list-row" key={`${job.id}-${photo.time}`} onClick={() => openJob(job.id)} type="button">
                <span>
                  <strong>{job.customer}</strong>
                  <small>
                    {job.id} · expected {photo.time}
                  </small>
                </span>
                <Badge tone="danger">Missing</Badge>
              </button>
            ))}
          </Card>

          <Card className="pn-table-card pn-rail-card">
            <div className="pn-section-head">
              <h2>Completed · not billed</h2>
              <span aria-disabled="true" className="pn-rail-count">
                {notBilled.length}
              </span>
            </div>
            {notBilled.map((job) => (
              <button className="pn-list-row" key={job.id} onClick={() => openJob(job.id)} type="button">
                <span>
                  <strong>{job.customer}</strong>
                  <small>
                    {job.id} · {dateLabel(job.date)}
                  </small>
                </span>
                <span className="pn-muted-action">Bill now</span>
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
