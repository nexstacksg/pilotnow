import { Badge, Button, Field, Modal } from './ui';
import { CopyIcon, PrinterIcon, ShieldCheckIcon } from './icons';
import { JobFormFields, OfficerFormFields } from './forms';
import { TODAY, dateLabel, hours, initials, money, statusTone } from '../lib/format';
import type { BillForm, Job, JobForm, Officer, OfficerForm, Payment } from '../types';

type FormSetter<T> = (updater: (form: T) => T) => void;

export function CreateJobModal({
  form,
  setForm,
  onClose,
  onSave,
}: {
  form: JobForm;
  setForm: FormSetter<JobForm>;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      title="Create new job"
      subtitle="Saved as a Draft - you can post it to WhatsApp next."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onSave}>
            Create job
          </Button>
        </>
      }
    >
      <JobFormFields form={form} setForm={setForm} />
    </Modal>
  );
}

export function AddOfficerModal({
  form,
  setForm,
  onClose,
  onSave,
}: {
  form: OfficerForm;
  setForm: FormSetter<OfficerForm>;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      title="Add new officer"
      subtitle="Create a profile for an officer who volunteered."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onSave}>
            Add officer
          </Button>
        </>
      }
    >
      <OfficerFormFields form={form} setForm={setForm} />
    </Modal>
  );
}

export function BillingModal({
  job,
  form,
  setForm,
  onClose,
  onConfirm,
}: {
  job: Job;
  form: BillForm;
  setForm: FormSetter<BillForm>;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      title="Mark as billed"
      subtitle={`${job.id} / ${job.customer} / ${dateLabel(job.date)}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirm Billed
          </Button>
        </>
      }
    >
      <Field label="Invoice number" required>
        <input value={form.invoice} onChange={(event) => setForm((item) => ({ ...item, invoice: event.target.value }))} placeholder="INV-2026-0460" />
      </Field>
      <Field label="Billed date" required>
        <input type="date" value={form.billedDate} onChange={(event) => setForm((item) => ({ ...item, billedDate: event.target.value }))} />
      </Field>
    </Modal>
  );
}

export function OfficerProfileModal({ officer, jobs, onClose, openJob }: { officer?: Officer; jobs: Job[]; onClose: () => void; openJob: (id: string) => void }) {
  if (!officer) return null;
  const officerCode = officer.code ?? officer.id;

  const history = jobs
    .map((job) => {
      const assigned = job.officers.find((item) => item.oid === officer.id);
      if (!assigned) return null;
      const scheduled = hours(job.start, job.end);
      const worked = assigned.actualStart && assigned.actualEnd ? hours(assigned.actualStart, assigned.actualEnd) : job.status === 'Completed' ? scheduled : 0;
      return {
        job,
        worked,
        pay: worked * assigned.rate,
      };
    })
    .filter((item): item is { job: Job; worked: number; pay: number } => Boolean(item));
  const completed = history.filter((item) => item.job.status === 'Completed');
  const totalHours = completed.reduce((sum, item) => sum + item.worked, 0);
  const totalPay = completed.reduce((sum, item) => sum + item.pay, 0);
  const officerTone = officer.status === 'Active' ? 'success' : officer.status === 'Blocked' ? 'danger' : 'muted';

  return (
    <Modal title={officer.name} subtitle={`${officerCode} / ${officer.phone} / ${money(officer.rate)}/h`} onClose={onClose} wide footer={<Button onClick={onClose}>Close</Button>}>
      <div className="pn-profile-head">
        <span>{initials(officer.name)}</span>
        <div>
          <strong>{officer.name}</strong>
          <small>{officerCode} / {officer.phone} / {money(officer.rate)}/h</small>
        </div>
        <Badge tone={officerTone}>{officer.status}</Badge>
        <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC received' : 'IC missing'}</Badge>
      </div>

      <div className="pn-profile-label">Officer details</div>
      <div className="pn-profile-grid">
        <ProfileCell label="OFFICER ID" value={officerCode} mono />
        <ProfileCell label="FULL NAME" value={officer.name} />
        <ProfileCell label="WHATSAPP NUMBER" value={officer.phone} mono />
        <ProfileCell label="DEFAULT HOURLY RATE" value={`${money(officer.rate)}/h`} mono />
        <ProfileCell label="IC STATUS" value={officer.ic ? 'Received' : 'Not received'} />
        <ProfileCell label="OFFICER STATUS" value={officer.status} />
      </div>

      <div className="pn-profile-stats">
        <ProfileCell label="JOBS WITH US" value={String(history.length)} />
        <ProfileCell label="COMPLETED" value={String(completed.length)} />
        <ProfileCell label="HOURS WORKED" value={`${totalHours.toFixed(2)}h`} mono />
        <ProfileCell label="TOTAL EARNED" value={money(totalPay)} mono />
      </div>

      <div className="pn-profile-label">Job history</div>
      {history.length ? (
        <div className="pn-table pn-table-profile-history">
          <div className="pn-table-head">
            <span>Job</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Hours</span>
            <span>Pay</span>
            <span>Status</span>
          </div>
          {history.map(({ job, worked, pay }) => (
            <button className="pn-table-row pn-click-row" key={job.id} onClick={() => openJob(job.id)} type="button">
              <span className="pn-mono">{job.id}</span>
              <span>{job.customer}</span>
              <span>{dateLabel(job.date)}</span>
              <span>{worked ? `${worked.toFixed(2)}h` : '-'}</span>
              <span>{money(pay)}</span>
              <span>
                <Badge tone={statusTone[job.status]} dot>{job.status}</Badge>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="pn-empty">No jobs recorded for this officer yet.</div>
      )}

      <div className="pn-profile-label">Notes</div>
      <p className="pn-profile-notes">{officer.notes || 'No notes on file.'}</p>
    </Modal>
  );
}

function ProfileCell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="pn-profile-cell">
      <span>{label}</span>
      <strong className={mono ? 'pn-mono' : ''}>{value}</strong>
    </div>
  );
}

export function JobReportModal({ job, onClose, copyText }: { job: Job; onClose: () => void; copyText: (text: string, message: string) => void }) {
  const scheduled = hours(job.start, job.end);
  const received = job.photos.filter((photo) => photo.status === 'received');
  const confirmed = job.officers.filter((officer) => officer.confirmed).length;
  const totalPay = job.officers.reduce((sum, officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled;
    return sum + worked * officer.rate;
  }, 0);
  const reportText = `PilotNow Job Report - ${job.id} - ${job.customer} - ${dateLabel(job.date)} - ${received.length} evidence photos - total payable ${money(totalPay)}`;

  return (
    <Modal
      title="Job completion report"
      onClose={onClose}
      wide
      footer={<Button variant="primary" onClick={onClose}>Close</Button>}
    >
      <div className="pn-report-actions">
        <strong>Job completion report</strong>
        <button onClick={() => window.print()} type="button">
          <PrinterIcon size={14} strokeWidth={2} />
          Print / PDF
        </button>
        <button onClick={() => copyText(reportText, 'Job completion report copied')} type="button">
          <CopyIcon size={14} strokeWidth={2} />
          Copy
        </button>
      </div>
      <div className="pn-report">
        <header className="pn-report-letterhead">
          <span>
            <ShieldCheckIcon size={19} stroke="#FF7A1A" strokeWidth={2.2} />
          </span>
          <div>
            <strong>PilotNow Security Ops</strong>
            <small>Job Completion & Evidence Report</small>
          </div>
          <aside>
            <strong>{job.id}</strong>
            <span>Generated {dateLabel(TODAY)}</span>
          </aside>
        </header>

        <section className="pn-report-section">
          <h3>JOB INFORMATION</h3>
          <div className="pn-report-title-row">
            <h2>{job.customer}</h2>
            <span className={`pn-report-status ${job.status === 'Completed' ? 'is-complete' : ''}`}>{job.status}</span>
          </div>
        </section>

        <section className="pn-report-grid">
          <div>
            <label>LOCATION</label>
            <strong>{job.location}</strong>
          </div>
          <div>
            <label>DATE</label>
            <strong>{dateLabel(job.date)}</strong>
          </div>
          <div>
            <label>TIME</label>
            <strong>{job.start}-{job.end}</strong>
          </div>
          <div>
            <label>OFFICERS</label>
            <strong>{job.officers.length} of {job.required} officers</strong>
          </div>
        </section>

        <section className="pn-report-notes">
          <div>
            <label>DESCRIPTION</label>
            <p>{job.description || 'No description provided.'}</p>
          </div>
          <div>
            <label>SPECIAL INSTRUCTIONS</label>
            <p>{job.instructions || 'No special instructions.'}</p>
          </div>
        </section>

        <section className="pn-report-section">
          <header>
            <h3>PARTICIPATING OFFICERS & EVIDENCE PHOTOS</h3>
            <span>{received.length} / {job.photos.length} photos received</span>
          </header>
          {job.officers.map((officer) => (
            <div className="pn-report-officer" key={officer.oid}>
              <div className="pn-report-officer-main">
                <span className="pn-report-avatar">{initials(officer.name)}</span>
                <div>
                  <strong>{officer.name}</strong>
                  <small>{officer.confirmed ? 'Confirmed' : 'Not confirmed'} · {officer.actualStart ? 'Reported' : 'Not reported'}</small>
                </div>
                <span className="pn-report-ic">IC {officer.ic ? '✓' : 'missing'}</span>
              </div>
              <div className="pn-report-pay">
                <strong>{money((officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled) * officer.rate)}</strong>
                <small>{(officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled).toFixed(2)}h x {money(officer.rate)}/h</small>
              </div>
              <div className="pn-report-officer-meta">
                <span>Actual hours: <strong>{officer.actualStart || job.start} - {officer.actualEnd || job.end}</strong></span>
                <span>Evidence photos: <strong>{job.photos.filter((photo) => photo.by === officer.name).length}</strong></span>
              </div>
            </div>
          ))}
          {!job.officers.length ? <p className="pn-report-empty">No officers assigned.</p> : null}
        </section>

        <footer className="pn-report-footer">
          <span>Confirmed officers</span>
          <strong>{confirmed} / {job.required}</strong>
          <span>Total payable</span>
          <strong>{money(totalPay)}</strong>
        </footer>
      </div>
    </Modal>
  );
}

export function PaymentHistoryModal({ officer, payments, onClose, openJob }: { officer: string; payments: Payment[]; onClose: () => void; openJob: (id: string) => void }) {
  const rows = payments.filter((payment) => payment.officer === officer);
  return (
    <Modal title={officer} subtitle={`Payment history / ${rows.length} records`} onClose={onClose} wide footer={<Button onClick={onClose}>Close</Button>}>
      <div className="pn-table">
        {rows.map((payment) => (
          <button
            className="pn-table-row"
            key={payment.id}
            onClick={() => {
              onClose();
              openJob(payment.jobId);
            }}
            type="button"
          >
            <span>{payment.jobId}</span>
            <span>{dateLabel(payment.jobDate)}</span>
            <span>{payment.hours.toFixed(2)}h</span>
            <span>{payment.status}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
