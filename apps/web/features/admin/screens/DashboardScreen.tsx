import { CalendarIcon, CameraOffIcon, ClockIcon, PaymentIcon, PlusIcon, TargetIcon } from '../components/icons';
import { Badge, Card, EmptyState, StatCard } from '../components/ui';
import type { DashboardSnapshot } from '../lib/dashboard-api';
import { dateLabel, statusTone } from '../lib/format';
import type { BillingFilter, JobListFilter, Screen } from '../types';

function timeLabel(value: string) {
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}
export function DashboardScreen({
  snapshot,
  openCreateJob,
  openJob,
  openJobs,
  openBilling,
  setScreen,
}: {
  snapshot: DashboardSnapshot;
  openCreateJob: () => void;
  openJob: (id: string) => void;
  openJobs: (filter: JobListFilter) => void;
  openBilling: (jobId?: string, filter?: BillingFilter) => void;
  setScreen: (screen: Screen) => void;
}) {
  const { metrics } = snapshot;

  return (
    <div className="pn-stack">
      <div className="pn-stats">
        <StatCard ariaLabel="Open today's jobs" icon={<CalendarIcon size={16} stroke="#0A0A0A" strokeWidth={2} />} label="Today's jobs" value={metrics.todayJobs} hint={`scheduled for ${dateLabel(snapshot.operatingDate)}`} tone="muted" onClick={() => openJobs('Today')} />
        <StatCard ariaLabel="Open jobs waiting for officers" icon={<ClockIcon size={16} stroke="#8A5A00" strokeWidth={2} />} label="Waiting for officers" value={metrics.waitingJobs} hint={`${metrics.officersNeeded} officers still needed`} tone="warning" onClick={() => openJobs('Needs staffing')} />
        <StatCard ariaLabel="Open ongoing jobs" icon={<TargetIcon size={16} stroke="#1F4FA3" strokeWidth={2} />} label="Ongoing jobs" value={metrics.ongoingJobs} hint="officers on duty now" tone="info" onClick={() => openJobs('Ongoing')} />
        <StatCard ariaLabel="Open jobs with missing hourly photos" icon={<CameraOffIcon size={16} stroke="#FF3B30" strokeWidth={2} />} label="Missing hourly photos" value={metrics.missingPhotos} hint="needs follow-up" tone="danger" onClick={() => openJobs('Missing photos')} />
      </div>

      <div className="pn-grid-two">
        <Card className="pn-table-card">
          <div className="pn-section-head">
            <h2>Today's jobs</h2>
            <button onClick={() => openJobs('Today')} type="button">
              View all →
            </button>
          </div>
          {snapshot.todayJobs.length ? (
            <div className="pn-table pn-table-4">
              <div className="pn-table-head">
                <span>Job</span>
                <span>Location</span>
                <span>Officers</span>
                <span>Status</span>
              </div>
              {snapshot.todayJobs.map((job) => (
                <button className="pn-table-row" key={job.id} onClick={() => openJob(job.id)} type="button">
                  <span>
                    <strong className="pn-mono">{job.id}</strong>
                    <small>
                      {timeLabel(job.startAt)}-{timeLabel(job.endAt)}
                    </small>
                  </span>
                  <span>
                    <strong>{job.location}</strong>
                    <small>{job.customer}</small>
                  </span>
                  <span>
                    <span className={`pn-officers-badge ${job.assigned >= job.required ? 'is-full' : 'is-short'}`}>
                      {job.assigned}/{job.required}
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
          ) : (
            <EmptyState>No jobs are scheduled for this operating day.</EmptyState>
          )}
        </Card>

        <div className="pn-stack">
          <Card>
            <div className="pn-section-head">
              <h2>Quick actions</h2>
              {metrics.unpaidPayables ? <span className="pn-rail-count">{metrics.unpaidPayables} unpaid</span> : null}
            </div>
            <div className="pn-action-grid">
              <button onClick={openCreateJob} type="button">
                <PlusIcon size={18} stroke="#0A0A0A" strokeWidth={2} />
                <span>Create Job</span>
              </button>
              <button onClick={() => setScreen('payments')} type="button">
                <PaymentIcon size={18} stroke="#0A0A0A" strokeWidth={2} />
                <span>Run Payments</span>
              </button>
              <button onClick={() => openBilling(undefined, 'All')} type="button">
                <PaymentIcon size={18} stroke="#0A0A0A" strokeWidth={2} />
                <span>Review Billing</span>
              </button>
            </div>
          </Card>

          <Card className="pn-table-card pn-rail-card">
            <div className="pn-section-head">
              <h2 className="pn-heading-with-dot">
                <span className="pn-red-dot" aria-hidden="true" />
                Missing hourly photos
              </h2>
              <span className="pn-section-actions">
                <span aria-label={`${metrics.missingPhotos} missing photos`} className="pn-rail-count">
                  {metrics.missingPhotos}
                </span>
                <button onClick={() => openJobs('Missing photos')} type="button">View affected →</button>
              </span>
            </div>
            {snapshot.missingProofs.length ? (
              snapshot.missingProofs.map((proof) => (
                <button className="pn-list-row" key={`${proof.jobId}-${proof.officer}-${proof.expectedAt}`} onClick={() => openJob(proof.jobId)} type="button">
                  <span>
                    <strong>{proof.customer}</strong>
                    <small>
                      {proof.jobId} · {proof.officer} · expected {timeLabel(proof.expectedAt)}
                    </small>
                  </span>
                  <Badge tone="danger">Missing</Badge>
                </button>
              ))
            ) : (
              <EmptyState>No missing proof checkpoints.</EmptyState>
            )}
          </Card>

          <Card className="pn-table-card pn-rail-card">
            <div className="pn-section-head">
              <h2>Completed · not billed</h2>
              <span className="pn-section-actions">
                <span aria-label={`${metrics.notBilled} unbilled jobs`} className="pn-rail-count">
                  {metrics.notBilled}
                </span>
                <button onClick={() => openBilling()} type="button">View all →</button>
              </span>
            </div>
            {snapshot.unbilledJobs.length ? (
              snapshot.unbilledJobs.map((job) => (
                <button className="pn-list-row" key={job.id} onClick={() => openBilling(job.id)} type="button">
                  <span>
                    <strong>{job.customer}</strong>
                    <small>
                      {job.id} · {dateLabel(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(new Date(job.startAt)))}
                    </small>
                  </span>
                  <span className="pn-muted-action">Bill now</span>
                </button>
              ))
            ) : (
              <EmptyState>No completed jobs are waiting for billing.</EmptyState>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
