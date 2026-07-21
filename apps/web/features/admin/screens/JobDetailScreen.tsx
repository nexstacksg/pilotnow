import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { BellIcon, BillingIcon, CheckIcon, ChevronLeftIcon, CopyIcon, LinkIcon, MessageIcon, PencilIcon, PlusIcon, TrashIcon, WhatsAppIcon } from '../components/icons';
import { Badge, Button, Card } from '../components/ui';
import { createOfficerJobToken, createSignReportToken } from '../lib/jobs-api';
import { dateLabel, hours, icDocumentLabel, initials, money, statusTone, timeLabel, timeRangeLabel } from '../lib/format';
import type { Job, JobOfficer, JobStatus, Officer, PhotoCheckpoint, Screen } from '../types';

const lifecycleSteps: { key: JobStatus; label: string }[] = [
  { key: 'Draft Created', label: 'Draft Created' },
  { key: 'Posted/Waiting', label: 'Posted/Waiting' },
  { key: 'Officers confirmed', label: 'Officers confirmed' },
  { key: 'Job ongoing', label: 'Job ongoing' },
  { key: 'Awaiting sign-off', label: 'Awaiting sign-off' },
  { key: 'Completed', label: 'Completed' },
];

const cancelledLifecycleSteps: { key: JobStatus; label: string }[] = [
  { key: 'Draft Created', label: 'Draft Created' },
  { key: 'Posted/Waiting', label: 'Posted/Waiting' },
  { key: 'Cancelled', label: 'Cancelled' },
];

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
  markPosted,
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
  markPosted: (id: string) => void;
}) {
  const [addPick, setAddPick] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [linkError, setLinkError] = useState('');
  const [signLink, setSignLink] = useState('');
  const linkMutation = useMutation({
    mutationFn: async ({ jobId, phone }: { jobId: string; phone: string }) => ({ jobId, phone, ...(await createOfficerJobToken(jobId, phone)) }),
    onMutate: () => {
      setLinkError('');
    },
    onSuccess: ({ jobId, phone, token }) => {
      const url = `${window.location.origin}/jobs/${encodeURIComponent(jobId)}?hp=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}`;
      setLinkError('');
      copyText(url, "copied the officer's duty link");
    },
    onError: (error) => {
      setLinkError(error instanceof Error ? error.message : 'Could not create officer link');
    },
  });
  const available = officers.filter((officer) => officer.status === 'Active' && !job.officers.some((assigned) => assigned.oid === officer.id || assigned.oid === officer.code));
  const scheduled = hours(job.start, job.end);
  const selectedOfficer = job.officers.find((officer) => officer.oid === selectedOfficerId);
  const selectedWorked = selectedOfficer
    ? selectedOfficer.actualStart && selectedOfficer.actualEnd
      ? hours(selectedOfficer.actualStart, selectedOfficer.actualEnd)
      : selectedOfficer.onDuty
        ? scheduled
        : 0
    : 0;
  const selectedRow = selectedOfficer
    ? {
        officer: selectedOfficer,
        evidencePhotos: job.photos.filter((photo) => photo.by === selectedOfficer.name),
        profile: officers.find((officer) => officer.id === selectedOfficer.oid),
        worked: selectedWorked,
        pay: selectedWorked * selectedOfficer.rate,
      }
    : null;
  const totalPay = job.officers.reduce((sum, officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : officer.onDuty ? scheduled : 0;
    return sum + worked * officer.rate;
  }, 0);
  const confirmedCount = job.officers.filter((officer) => officer.confirmed).length;
  const onDutyCount = job.officers.filter((officer) => officer.onDuty).length;
  const checkedOutCount = job.officers.filter((officer) => officer.actualEnd).length;
  const allOfficersCheckedOut = Boolean(job.officers.length) && job.officers.every((officer) => officer.actualEnd);
  const reportUnlocked = Boolean(job.siteManagerSignedAt);
  const signedCompletionMessage = jobDetailSignedCompletionMessage(job);
  const visibleLifecycleSteps = job.status === 'Cancelled' ? cancelledLifecycleSteps : lifecycleSteps;
  const activeStep = Math.max(0, visibleLifecycleSteps.findIndex((step) => step.key === job.status));
  const stillNeeded = Math.max(0, job.required - job.officers.length);
  const isFull = job.officers.length >= job.required;
  const scheduledTime = timeRangeLabel(job.start, job.end);
  const jobMsg = `PilotNow Job ${job.id}\n${job.location}\n${dateLabel(job.date)}, ${scheduledTime}\n${job.required} officers needed\n\n${job.description}`;
  const reminderMsg = `Reminder — Job ${job.id} at ${job.location} starts today ${timeLabel(job.start)}. Please send your hourly proof photo every hour to this group. – PilotNow Ops`;
  const signUrl = (token: string) => `${window.location.origin}/sign/${encodeURIComponent(job.id)}?token=${encodeURIComponent(token)}`;
  const signMessage = (url: string) => `Duty Officer Report ${job.id}\n${job.customer}\n${job.location}\n\nPlease review the evidence and sign the DO report:\n${url}`;
  const signTokenMutation = useMutation({
    mutationFn: () => createSignReportToken(job.id),
    onSuccess: ({ token }) => {
      setSignLink(signUrl(token));
    },
    onError: (error) => {
      setLinkError(error instanceof Error ? error.message : 'Could not create sign report link');
    },
  });
  function withSignLink(next: (url: string) => void) {
    if (signLink) {
      next(signLink);
      return;
    }
    signTokenMutation.mutate(undefined, { onSuccess: ({ token }) => next(signUrl(token)) });
  }

  useEffect(() => {
    setSignLink('');
    setLinkError('');
  }, [job.id]);

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
                <Button disabled={!reportUnlocked} variant="primary" onClick={openReport}>
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
              <Metric label="Time" value={scheduledTime} />
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
              {visibleLifecycleSteps.map((step, index) => {
                const current = job.status !== 'Completed' && index === activeStep;
                const done = job.status === 'Completed' ? index <= activeStep : index < activeStep;
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
                <span>Identity docs</span>
                <span>Rate</span>
                <span>Confirm</span>
                <span>On duty</span>
                <span>Link</span>
                <span />
              </div>
              {job.officers.map((officer) => {
                const officerProfile = officers.find((item) => item.id === officer.oid || item.code === officer.oid);
                const phone = (officerProfile?.phone || officer.phone || '').replace(/\D/g, '');
                const officerCode = officerProfile?.code ?? officer.oid;
                const linkTooltip = "copy the officer's duty link(check-in, check-out, photo upload)";
                const canRemove = !officer.confirmed && !officer.onDuty && !officer.actualStart && !officer.actualEnd;
                return (
                  <div className="pn-table-row" key={officer.oid}>
                    <span>
                      <button className="pn-officer-cell-button" onClick={() => setSelectedOfficerId(officer.oid)} type="button">
                        <strong>
                          {officer.name}
                          <b>›</b>
                        </strong>
                      </button>
                      <small>{officerCode} · {officer.actualStart || '--:--'} - {officer.actualEnd || '--:--'}</small>
                    </span>
                    <span>
                      <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC ✓' : icDocumentLabel(officer.ic)}</Badge>
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
                      <button
                        className="pn-icon-btn pn-tooltip-btn"
                        data-tooltip={linkTooltip}
                        disabled={linkMutation.isPending}
                        onClick={() => {
                          setLinkError('');
                          if (phone) linkMutation.mutate({ jobId: job.id, phone });
                        }}
                        title={linkTooltip}
                        type="button"
                        aria-label={`Copy duty link for ${officer.name}`}
                      >
                        <LinkIcon size={14} strokeWidth={2} />
                      </button>
                    </span>
                    <span>
                      <button className="pn-icon-btn pn-delete-btn" disabled={!canRemove} onClick={() => removeOfficer(officer.oid)} type="button" aria-label={canRemove ? `Remove ${officer.name}` : `${officer.name} cannot be removed after confirmation or attendance`}>
                        <TrashIcon size={14} strokeWidth={2} />
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
            {linkError ? <div className="pn-needed-note">{linkError}</div> : null}
            <div className="pn-add-row">
              <select value={addPick} onChange={(event) => setAddPick(event.target.value)} disabled={isFull}>
                <option value="">{isFull ? 'Officer limit reached' : 'Add participating officer...'}</option>
                {available.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.code ?? officer.id} · {officer.name}{officer.ic ? '' : ' · IC missing'}
                  </option>
                ))}
              </select>
              <Button
                disabled={isFull || !addPick}
                variant="primary"
                onClick={() => {
                  if (isFull || !addPick) return;
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
                    {photo.mediaRef ? (
                      <a className="pn-green-action" href={photo.mediaRef} rel="noreferrer" target="_blank">View photo</a>
                    ) : null}
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
              <div className="pn-whatsapp-title">
                <span>
                  <WhatsAppIcon />
                </span>
                <div>
                  <h2>WhatsApp workflow</h2>
                  <small>{job.posted ? 'Group post sent' : 'Not posted yet'}</small>
                </div>
              </div>
            </div>
            <div className="pn-wa-actions">
              <button className="is-green" onClick={() => {
                postToWhatsApp(jobMsg);
                markPosted(job.id);
              }} type="button">
                <WhatsAppIcon size={13} />
                Post to WhatsApp group
              </button>
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
            <h2>Staffing status</h2>
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
              <span>Checked out</span>
              <strong className="pn-blue">
                {checkedOutCount}/{job.officers.length}
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

          <Card className="pn-side-panel pn-billing-card">
            <div className="pn-billing-head">
              <h2>Billing</h2>
              <Badge tone={job.billing === 'Billed' ? 'success' : 'warning'}>{job.billing}</Badge>
            </div>
            {job.cancelReason ? <div className="pn-complete-note">{job.cancelReason}</div> : null}
            {signedCompletionMessage ? (
              <div className="pn-complete-note">{signedCompletionMessage}</div>
            ) : !allOfficersCheckedOut ? (
              <Button disabled={!job.officers.length || job.status === 'Cancelled'} variant="primary" onClick={() => completeJob(job.id)}>
                <CheckIcon size={16} strokeWidth={2.4} />
                {job.officers.length ? 'Complete Job' : 'Add at least one participating officer first'}
              </Button>
            ) : (
              <div className="pn-sign-card">
                <div className="pn-sign-card-head">
                  <div>
                    <LinkIcon size={18} strokeWidth={2.2} />
                    <strong>Site manager signature</strong>
                  </div>
                  <Badge tone={reportUnlocked ? 'success' : 'info'}>{reportUnlocked ? 'SIGNED' : 'PENDING'}</Badge>
                </div>
                <p>{reportUnlocked ? `Signed by ${job.siteManagerSignedBy || 'site manager'}. Job report is now available.` : 'Job is finished — share this link with the site manager to capture their sign-off. The report stays locked until they sign.'}</p>
                <label className="pn-sign-link">
                  <LinkIcon size={15} strokeWidth={2} />
                  <input readOnly value={signTokenMutation.isPending ? 'Generating link...' : signLink || 'Click Copy link to generate'} />
                </label>
                <div className="pn-sign-actions">
                  <button disabled={signTokenMutation.isPending} onClick={() => signTokenMutation.mutate()} type="button">
                    <LinkIcon size={14} strokeWidth={2} />
                    Generate link
                  </button>
                  <button disabled={signTokenMutation.isPending} onClick={() => withSignLink((url) => copyText(url, 'Sign report link copied'))} type="button">
                    <CopyIcon size={14} strokeWidth={2} />
                    Copy link
                  </button>
                  <button disabled={signTokenMutation.isPending} onClick={() => withSignLink((url) => copyText(signMessage(url), 'Sign report message copied'))} type="button">
                    <MessageIcon size={14} strokeWidth={2} />
                    Copy message
                  </button>
                </div>
              </div>
            )}
            {!signedCompletionMessage ? (
              <Button disabled={job.status === 'Cancelled'} variant="danger" onClick={() => cancelJob(job.id)}>
                Cancel job…
              </Button>
            ) : null}
          </Card>
        </div>
      </div>
      {selectedRow ? <OfficerAssignmentModal copyText={copyText} job={job} onClose={() => setSelectedOfficerId(null)} row={selectedRow} /> : null}
    </div>
  );
}

export function jobDetailSignedCompletionMessage(job: Job) {
  if (!job.siteManagerSignedAt) return '';
  return `Job completed. Site manager sign-off captured${job.siteManagerSignedBy ? ` by ${job.siteManagerSignedBy}` : ''}.`;
}

function postToWhatsApp(message: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OfficerAssignmentModal({
  copyText,
  job,
  onClose,
  row,
}: {
  copyText: (text: string, message: string) => void;
  job: Job;
  onClose: () => void;
  row: { officer: JobOfficer; evidencePhotos: PhotoCheckpoint[]; profile?: Officer; worked: number; pay: number };
}) {
  const { officer, profile } = row;
  const workedLabel = officer.actualStart && officer.actualEnd ? `${row.worked.toFixed(2)}h` : '-';
  const officerMsg = `Hi ${officer.name}, PilotNow Ops here.\n\nAssignment ${job.id}: ${job.customer} at ${job.location}\nDate: ${dateLabel(job.date)}\nTime: ${timeRangeLabel(job.start, job.end)}\n\nPlease confirm your availability and remember to post evidence photos during the job.`;

  return (
    <div className="pn-modal-backdrop" role="dialog" aria-modal="true" aria-label={`${officer.name} assignment`}>
      <section className="pn-officer-assignment-modal">
        <header className="pn-officer-assignment-head">
          <span className="pn-officer-assignment-avatar">{initials(officer.name)}</span>
          <div>
            <h2>
              {officer.name}
              <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC ✓' : 'No IC'}</Badge>
            </h2>
            <p>{profile?.phone ?? 'No phone recorded'} · {officer.confirmed ? 'Confirmed' : 'Not confirmed'} - {officer.onDuty ? 'on duty' : 'not on duty'}</p>
          </div>
          <button className="pn-icon-btn" onClick={() => copyText(officerMsg, 'WhatsApp message copied')} type="button" aria-label="Copy WhatsApp message">
            <MessageIcon size={18} strokeWidth={2} />
          </button>
          <button className="pn-icon-btn" onClick={onClose} type="button" aria-label="Close">x</button>
        </header>

        <div className="pn-officer-assignment-body">
          <span className="pn-assignment-label">Assignment · {job.id}</span>
          <p className="pn-assignment-title">{job.customer} · {job.location} · {dateLabel(job.date)}</p>

          <div className="pn-assignment-metrics">
            <div>
              <span>Check-in</span>
              <strong>{officer.actualStart || '--:--'}</strong>
            </div>
            <div>
              <span>Check-out</span>
              <strong>{officer.actualEnd || '--:--'}</strong>
            </div>
            <div>
              <span>Hours</span>
              <strong>{workedLabel}</strong>
            </div>
          </div>

          <div className="pn-assignment-pay-row">
            <span className={officer.confirmed ? 'is-on' : ''}>{officer.confirmed ? 'Confirmed' : 'Not confirmed'}</span>
            <span>{officer.onDuty ? 'On duty' : 'Off duty'}</span>
            <strong>Scheduled {timeRangeLabel(job.start, job.end)}</strong>
            <b>{money(row.pay)}</b>
            <small>· {money(officer.rate)}/h</small>
          </div>

          <div className="pn-assignment-proof-head">
            <h3>Evidence photos posted</h3>
            <span>{row.evidencePhotos.length} of {job.photos.length}</span>
          </div>
          <div className="pn-assignment-empty">No evidence photos posted by this officer yet.</div>
        </div>
      </section>
    </div>
  );
}
