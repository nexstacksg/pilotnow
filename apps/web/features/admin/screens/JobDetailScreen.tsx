import { useState } from 'react';
import { BellIcon, BillingIcon, CheckIcon, ChevronLeftIcon, CopyIcon, PencilIcon, PlusIcon, TrashIcon, WhatsAppIcon } from '../components/icons';
import { Badge, Button, Card } from '../components/ui';
import { dateLabel, hours, money, statusTone } from '../lib/format';
import type { Job, JobStatus, Officer, Screen } from '../types';

const lifecycleSteps: { key: JobStatus; label: string }[] = [
  { key: 'Draft', label: 'Draft created' },
  { key: 'Open', label: 'Open' },
  { key: 'Assigned', label: 'Job assigned' },
  { key: 'Ongoing', label: 'Job ongoing' },
  { key: 'Completed', label: 'Completed' },
];

const lifecycleIndex: Record<JobStatus, number> = {
  Draft: 0,
  Open: 1,
  Assigned: 2,
  Ongoing: 3,
  Completed: 4,
  Cancelled: 0,
};

export function JobDetailScreen({
  job,
  officers,
  setScreen,
  addOfficer,
  removeOfficer,
  toggleOfficer,
  markPhoto,
  completeJob,
  cancelJob,
  openReport,
  onEdit,
  copyText,
}: {
  job: Job;
  officers: Officer[];
  setScreen: (screen: Screen) => void;
  addOfficer: (oid: string) => void;
  removeOfficer: (oid: string) => void;
  toggleOfficer: (jobId: string, oid: string, field: 'confirmed' | 'onDuty') => void;
  markPhoto: (jobId: string, index: number, status: 'received' | 'missing') => void;
  completeJob: (id: string) => void;
  cancelJob: (id: string) => void;
  openReport: () => void;
  onEdit: () => void;
  copyText: (text: string, message: string) => void;
}) {
  const [addPick, setAddPick] = useState('');
  const available = officers.filter((officer) => officer.status !== 'Blocked' && !job.officers.some((assigned) => assigned.oid === officer.id));
  const scheduled = hours(job.start, job.end);
  const totalPay = job.officers.reduce((sum, officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : officer.onDuty ? scheduled : 0;
    return sum + worked * officer.rate;
  }, 0);
  const activeStep = lifecycleIndex[job.status];
  const confirmedCount = job.officers.filter((officer) => officer.confirmed).length;
  const onDutyCount = job.officers.filter((officer) => officer.onDuty).length;
  const stillNeeded = Math.max(0, job.required - job.officers.length);
  const jobMsg = `PilotNow Job ${job.id}\n${job.location}\n${dateLabel(job.date)}, ${job.start}–${job.end}\n${job.required} officers needed\n\n${job.description}`;
  const reminderMsg = `Reminder — Job ${job.id} at ${job.location} starts today ${job.start}. Please send your hourly proof photo every hour to this group. – PilotNow Ops`;

  return (
    <div className="pn-stack pn-job-detail">
      <button className="pn-back" onClick={() => setScreen('jobs')} type="button">
        <ChevronLeftIcon size={15} strokeWidth={2.2} />
        All jobs
      </button>
      <div className="pn-grid-two">
        <div className="pn-stack">
          <Card>
            <div className="pn-detail-head">
              <div>
                <div className="pn-row">
                  <span className="pn-id">{job.id}</span>
                  <Badge tone={statusTone[job.status]} dot>
                    {job.status}
                  </Badge>
                </div>
                <h2>{job.customer}</h2>
                <p>{job.location}</p>
              </div>
              <div className="pn-row">
                <Button variant="primary" onClick={openReport}>
                  <BillingIcon size={14} strokeWidth={2} />
                  Job Report
                </Button>
                <Button onClick={onEdit}>
                  <PencilIcon size={14} strokeWidth={2} />
                  Edit
                </Button>
              </div>
            </div>
            <div className="pn-metrics">
              <Metric label="Date" value={dateLabel(job.date)} />
              <Metric label="Time" value={`${job.start}-${job.end}`} />
              <Metric label="Officers" value={`${job.officers.length} of ${job.required}`} />
              <Metric label="Scheduled" value={`${scheduled}h`} />
            </div>
            <div className="pn-copy-block">
              <label>Job description</label>
              <p>{job.description}</p>
            </div>
            {job.instructions ? (
              <div className="pn-warning">
                <strong>⚑ Special instructions</strong>
                <p>{job.instructions}</p>
              </div>
            ) : null}
          </Card>

          <Card className="pn-lifecycle-card">
            <h2>Job lifecycle</h2>
            <div className="pn-lifecycle">
              {lifecycleSteps.map((step, index) => {
                const current = job.status !== 'Cancelled' && job.status !== 'Completed' && index === activeStep;
                const done = job.status !== 'Cancelled' && (job.status === 'Completed' ? index <= activeStep : index < activeStep);
                return (
                  <div className={`pn-lifecycle-step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`} key={step.key}>
                    <div className="pn-lifecycle-line" />
                    <span>{done ? <CheckIcon size={13} stroke="#fff" strokeWidth={3} /> : null}</span>
                    <div className="pn-lifecycle-line" />
                    <small>{step.label}</small>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="pn-section-head pn-officer-head">
              <div>
                <h2>Participating officers</h2>
                <span className="pn-status-dot" />
                <small>
                  {job.officers.length} of {job.required} added
                </small>
              </div>
              <strong>{money(totalPay)}</strong>
            </div>
            {stillNeeded ? (
              <div className="pn-needed-note">{stillNeeded} more officer(s) still needed — waiting for volunteers in WhatsApp.</div>
            ) : null}
            <div className="pn-table pn-table-officers">
              <div className="pn-table-head">
                <span>Officer</span>
                <span>IC</span>
                <span>Rate</span>
                <span>Confirm</span>
                <span>On duty</span>
                <span />
              </div>
              {job.officers.map((officer) => (
                <div className="pn-table-row" key={officer.oid}>
                  <span>
                    <strong>{officer.name}</strong>
                    <small>{officer.actualStart || '—'} – {officer.actualEnd || '—'}</small>
                  </span>
                  <span>
                    <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC' : 'No IC'}</Badge>
                  </span>
                  <span>{money(officer.rate)}/h</span>
                  <span>
                    <Button variant={officer.confirmed ? 'primary' : 'secondary'} onClick={() => toggleOfficer(job.id, officer.oid, 'confirmed')}>
                      {officer.confirmed ? 'Confirmed' : 'Confirm'}
                    </Button>
                  </span>
                  <span>
                    <Button variant={officer.onDuty ? 'primary' : 'secondary'} onClick={() => toggleOfficer(job.id, officer.oid, 'onDuty')}>
                      {officer.onDuty ? 'On duty' : 'Mark on duty'}
                    </Button>
                  </span>
                  <span>
                    <button className="pn-icon-btn pn-delete-btn" onClick={() => removeOfficer(officer.oid)} type="button" aria-label={`Remove ${officer.name}`}>
                      <TrashIcon size={14} strokeWidth={2} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
            <div className="pn-add-row">
              <select value={addPick} onChange={(event) => setAddPick(event.target.value)}>
                <option value="">Add participating officer...</option>
                {available.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} · {money(officer.rate)}/h{officer.ic ? '' : ' · no IC'}
                  </option>
                ))}
              </select>
              <Button
                disabled={!addPick}
                variant="primary"
                onClick={() => {
                  if (!addPick) return;
                  addOfficer(addPick);
                  setAddPick('');
                }}
              >
                <PlusIcon size={14} strokeWidth={2.2} />
                Add officer
              </Button>
            </div>
          </Card>

          <Card className="pn-proof-card">
            <div className="pn-section-head">
              <h2>Hourly proof photos</h2>
              <div className="pn-proof-actions">
                <span>
                  {job.photos.filter((photo) => photo.status === 'received').length}/{job.photos.length} received
                </span>
                <button className="pn-green-action" onClick={() => copyText(reminderMsg, 'Reminder copied for WhatsApp')} type="button">
                  <BellIcon size={14} strokeWidth={2} />
                  Copy reminder
                </button>
              </div>
            </div>
            {job.photos.length
              ? (
              job.photos.map((photo, index) => (
                <div className="pn-list-row" key={`${photo.time}-${index}`}>
                  <span>
                    <strong>{photo.time}</strong>
                    <small>{photo.status === 'received' ? `by ${photo.by} · ${photo.at}` : photo.status === 'missing' ? 'No photo received' : 'Not due yet'}</small>
                  </span>
                  <div className="pn-row">
                    <Badge tone={photo.status === 'received' ? 'success' : photo.status === 'missing' ? 'danger' : 'muted'}>{photo.status}</Badge>
                    {photo.status !== 'received' ? (
                      <Button onClick={() => markPhoto(job.id, index, 'received')}>Received</Button>
                    ) : null}
                    {photo.status !== 'missing' ? <Button onClick={() => markPhoto(job.id, index, 'missing')}>Missing</Button> : null}
                  </div>
                </div>
              ))
                )
              : null}
          </Card>
        </div>

        <div className="pn-stack">
          <Card>
            <div className="pn-whatsapp-head">
              <span>
                <WhatsAppIcon />
              </span>
              <div>
                <h2>WhatsApp workflow</h2>
                <small>{job.posted ? 'Group post sent' : 'Not posted yet'}</small>
              </div>
            </div>
            <div className="pn-wa-actions">
              <button onClick={() => copyText(jobMsg, 'Job message copied for WhatsApp')} type="button">
                <CopyIcon size={13} strokeWidth={2} />
                Copy job post
              </button>
              <button onClick={() => copyText(reminderMsg, 'Reminder copied for WhatsApp')} type="button">
                <BellIcon size={13} strokeWidth={2} />
                Copy reminder
              </button>
            </div>
            <textarea
              readOnly
              value={jobMsg}
            />
          </Card>

          <Card className="pn-side-panel">
            <h2>Officer status</h2>
            <div className="pn-side-list">
              <span>Required</span>
              <strong>
                {job.officers.length} of {job.required}
              </strong>
              <span>Confirmed</span>
              <strong className="pn-blue">
                {confirmedCount}/{job.officers.length}
              </strong>
              <span>Reported on duty</span>
              <strong className="pn-blue">
                {onDutyCount}/{job.officers.length}
              </strong>
            </div>
          </Card>

          <Card className="pn-side-panel">
            <h2>Pay calculation</h2>
            <div className="pn-pay-list">
              {job.officers.map((officer) => {
                const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : officer.onDuty ? scheduled : 0;
                return (
                  <div key={officer.oid}>
                    <span>
                      <strong>{officer.name}</strong>
                      <small>
                        {worked ? `${worked.toFixed(2)}h` : '—'} × {money(officer.rate)}/h
                      </small>
                    </span>
                    <b>{money(worked * officer.rate)}</b>
                  </div>
                );
              })}
              <footer>
                <span>Total payable</span>
                <strong>{money(totalPay)}</strong>
              </footer>
            </div>
          </Card>

          <Card className="pn-side-panel">
            <div className="pn-billing-head">
              <h2>Billing</h2>
              <Badge tone={job.billing === 'Billed' ? 'success' : 'warning'}>{job.billing}</Badge>
            </div>
            {job.cancelReason ? <div className="pn-complete-note">{job.cancelReason}</div> : null}
            <Button disabled={job.status === 'Completed' || job.status === 'Cancelled' || job.officers.length === 0} variant="primary" onClick={() => completeJob(job.id)}>
              <CheckIcon size={16} strokeWidth={2.4} />
              Complete job
            </Button>
            <Button disabled={job.status === 'Cancelled'} variant="danger" onClick={() => cancelJob(job.id)}>
              Cancel job…
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
