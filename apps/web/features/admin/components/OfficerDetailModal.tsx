import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckIcon, MessageIcon, OfficersIcon, PencilIcon, TrashIcon, XIcon } from './icons';
import { Badge, Button, Field, Modal } from './ui';
import { dateLabel, hours, initials, money, officerStatusLabel, officerStatusTone, statusTone } from '../lib/format';
import { fetchOfficerAssignmentHistory } from '../lib/officers-api';
import type { OfficerAssignmentHistory } from '../lib/officers-api';
import type { Job, Officer, OfficerForm, Payment, PaymentStatus } from '../types';

const emptyOfficerForm: OfficerForm = {
  name: '',
  phone: '+65 ',
  rate: '16',
  ic: false,
  status: 'New',
  notes: '',
};

function noteText(value: unknown) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  if ('notes' in value && typeof value.notes === 'string') return value.notes;
  if ('note' in value && typeof value.note === 'string') return value.note;
  if ('text' in value && typeof value.text === 'string') return value.text;
  return '';
}

function officerToForm(officer: Officer): OfficerForm {
  return {
    name: officer.name,
    phone: officer.phone,
    rate: String(officer.rate),
    ic: officer.ic,
    status: officer.status,
    notes: noteText(officer.notes),
  };
}

function ProfileCell({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="pn-profile-cell">
      <span>{label}</span>
      <strong className={mono ? 'pn-mono' : ''}>{value}</strong>
    </div>
  );
}

function OfficerProfileFields({
  form,
  setForm,
}: {
  form: OfficerForm;
  setForm: (updater: (form: OfficerForm) => OfficerForm) => void;
}) {
  return (
    <div className="pn-form-grid">
      <Field label="Full name" required>
        <input
          placeholder="e.g. Ravi Chandran"
          value={form.name}
          onChange={(event) => setForm((item) => ({ ...item, name: event.target.value }))}
        />
      </Field>
      <Field label="WhatsApp number" required>
        <input
          className="pn-mono-input"
          placeholder="+65 8123 4567"
          value={form.phone}
          onChange={(event) => setForm((item) => ({ ...item, phone: event.target.value }))}
        />
      </Field>
      <div className="pn-form-row">
        <Field label="Default hourly rate (S$)">
          <input
            className="pn-mono-input"
            max="40"
            min="10"
            type="number"
            value={form.rate}
            onChange={(event) => setForm((item) => ({ ...item, rate: event.target.value }))}
          />
        </Field>
        <Field label="Account status">
          <select value={form.status} onChange={(event) => setForm((item) => ({ ...item, status: event.target.value as OfficerForm['status'] }))}>
            {(['New', 'Active', 'Inactive', 'Blocked'] as const).map((status) => (
              <option key={status} value={status}>
                {officerStatusLabel[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <label className="pn-check">
        <input checked={form.ic} onChange={(event) => setForm((item) => ({ ...item, ic: event.target.checked }))} type="checkbox" />
        <span>
          <strong>IC received</strong>
          <small>Tick if the officer's IC copy has been received.</small>
        </span>
      </label>
      <Field label="Notes">
        <textarea
          placeholder="Availability, certifications, etc."
          rows={2}
          value={form.notes}
          onChange={(event) => setForm((item) => ({ ...item, notes: event.target.value }))}
        />
      </Field>
    </div>
  );
}

export function OfficerDetailModal({
  officer,
  jobs,
  payments,
  initialMode = 'view',
  onClose,
  onDelete,
  onSave,
  openJob,
}: {
  officer?: Officer;
  jobs: Job[];
  payments: Payment[];
  initialMode?: 'view' | 'edit';
  onClose: () => void;
  onDelete: (id: string) => Promise<boolean>;
  onSave: (id: string, form: OfficerForm) => Promise<boolean>;
  openJob: (id: string) => void;
}) {
  const [editing, setEditing] = useState(initialMode === 'edit');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState<OfficerAssignmentHistory[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [form, setForm] = useState<OfficerForm>(() => (officer ? officerToForm(officer) : emptyOfficerForm));

  useEffect(() => {
    if (officer) {
      setForm(officerToForm(officer));
      setEditing(initialMode === 'edit');
    }
  }, [initialMode, officer]);

  useEffect(() => {
    if (!officer) return;
    let cancelled = false;
    setHistoryReady(false);

    void fetchOfficerAssignmentHistory(officer.id)
      .then((items) => {
        if (!cancelled) {
          setAssignmentHistory(items);
          setHistoryReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAssignmentHistory([]);
          setHistoryReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [officer]);

  if (!officer) return null;

  const paymentById = new Map(payments.map((payment) => [payment.id, payment]));
  const paymentByJobOfficer = new Map(payments.map((payment) => [`${payment.jobId}::${payment.officer.toLowerCase()}`, payment]));
  const paymentForHistory = (id: string, jobId: string): Payment | undefined => (
    paymentById.get(id) ?? paymentByJobOfficer.get(`${jobId}::${officer.name.toLowerCase()}`)
  );
  const paymentStatusForHistory = (id: string, jobId: string, fallback: PaymentStatus): PaymentStatus => {
    const payment = paymentForHistory(id, jobId);
    return payment?.status === 'Paid' || fallback === 'Paid' ? 'Paid' : 'Pending';
  };

  const history = jobs
    .map((job) => {
      const assigned = job.officers.find((item) => item.oid === officer.id);
      if (!assigned) return null;
      const scheduled = hours(job.start, job.end);
      const worked = assigned.actualStart && assigned.actualEnd ? hours(assigned.actualStart, assigned.actualEnd) : job.status === 'Completed' || assigned.actualStart ? scheduled : 0;
      return { job, worked, pay: worked * assigned.rate };
    })
    .filter((item): item is { job: Job; worked: number; pay: number } => Boolean(item))
    .sort((a, b) => b.job.date.localeCompare(a.job.date) || b.job.id.localeCompare(a.job.id));
  const dbHistory = assignmentHistory.map((item) => ({
    jobId: item.jobId,
    customer: item.customerName,
    date: item.date,
    worked: item.hours,
    pay: item.payable,
    status: item.status,
    paymentId: item.id,
    paymentStatus: paymentStatusForHistory(item.id, item.jobId, item.paymentStatus),
  }));
  const visibleHistory = dbHistory.length ? dbHistory : history.map(({ job, worked, pay }) => ({
    jobId: job.id,
    customer: job.customer,
    date: job.date,
    worked,
    pay,
    status: job.status,
    paymentStatus: paymentStatusForHistory('', job.id, 'Pending'),
    paymentId: '',
  }));
  const completed = visibleHistory.filter((item) => item.status === 'Completed');
  const totalHours = completed.reduce((sum, item) => sum + item.worked, 0);
  const totalPay = completed.reduce((sum, item) => sum + item.pay, 0);
  const officerTone = officerStatusTone[officer.status];
  const officerId = officer.id;
  const officerCode = officer.code ?? officer.id;

  async function saveProfile() {
    setSaving(true);
    const ok = await onSave(officerId, form);
    setSaving(false);
    if (ok) {
      if (initialMode === 'edit') {
        onClose();
      } else {
        setEditing(false);
      }
    }
  }

  async function deleteProfile() {
    setDeleting(true);
    const ok = await onDelete(officerId);
    if (!ok) setDeleting(false);
  }

  if (editing) {
    return (
      <Modal
        title="Edit officer"
        subtitle={`Update the profile for ${officerCode}.`}
        onClose={onClose}
        headerIcon={<OfficersIcon size={19} strokeWidth={2.2} />}
        footer={
          <>
            <Button
              onClick={() => {
                setForm(officerToForm(officer));
                if (initialMode === 'edit') {
                  onClose();
                } else {
                  setEditing(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button disabled={saving} variant="primary" onClick={saveProfile}>
              <OfficersIcon size={16} strokeWidth={2.2} />
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </>
        }
      >
        <OfficerProfileFields form={form} setForm={setForm} />
      </Modal>
    );
  }

  return (
    <Modal title={officer.name} onClose={onClose} wide hideHeader>
      <div className="pn-profile-head">
        <span className="pn-profile-avatar">{initials(officer.name)}</span>
        <div className="pn-profile-title">
          <div className="pn-profile-name-row">
            <strong>{officer.name}</strong>
            <div className="pn-profile-badges">
              <Badge tone={officerTone}>{officer.status}</Badge>
              <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC ✓' : 'No IC'}</Badge>
            </div>
          </div>
          <small>{officerCode} / {officer.phone} / {money(officer.rate)}/h</small>
        </div>
        <div className="pn-profile-actions">
          <button className="pn-icon-btn" type="button" aria-label={`Message ${officer.name}`}>
            <MessageIcon size={16} strokeWidth={2} />
          </button>
          <Button onClick={() => setEditing((value) => !value)}>
            <PencilIcon size={15} strokeWidth={2.1} />
            {editing ? 'View' : 'Edit'}
          </Button>
          <button className="pn-icon-btn pn-profile-delete-btn" type="button" aria-label={`Delete ${officer.name}`} disabled={deleting} onClick={deleteProfile}>
            <TrashIcon size={16} strokeWidth={2.1} />
          </button>
          <button className="pn-icon-btn" onClick={onClose} type="button" aria-label="Close">
            <XIcon size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="pn-profile-label pn-profile-details-label">Officer details</div>
      <div className="pn-profile-grid">
        <ProfileCell label="OFFICER ID" value={officerCode} mono />
        <ProfileCell label="FULL NAME" value={officer.name} />
        <ProfileCell label="WHATSAPP NUMBER" value={officer.phone} mono />
        <ProfileCell label="DEFAULT HOURLY RATE" value={`${money(officer.rate)}/h`} mono />
        <ProfileCell
          label="IC STATUS"
          value={
            <span className="pn-profile-cell-inline">
              <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? <><span>IC</span><CheckIcon size={13} strokeWidth={2.4} /></> : 'No IC'}</Badge>
              {officer.ic ? 'Received' : 'Not received'}
            </span>
          }
        />
        <ProfileCell label="OFFICER STATUS" value={<Badge tone={officerTone}>{officer.status}</Badge>} />
      </div>

      <div className="pn-profile-stats">
        <ProfileCell label="JOBS WITH US" value={String(visibleHistory.length)} />
        <ProfileCell label="COMPLETED" value={String(completed.length)} />
        <ProfileCell label="HOURS WORKED" value={`${totalHours.toFixed(2)}h`} mono />
        <ProfileCell label="TOTAL EARNED" value={money(totalPay)} mono />
      </div>

      <div className="pn-profile-label pn-profile-label-line">Job history</div>
      {!historyReady ? (
        <div className="pn-empty">Loading assignment history...</div>
      ) : visibleHistory.length ? (
        <div className="pn-table pn-table-profile-history">
          <div className="pn-table-head">
            <span>Job</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Hours</span>
            <span>Pay</span>
            <span>Status</span>
            <span>Payment</span>
          </div>
          {visibleHistory.map((item) => (
            <button className="pn-table-row pn-click-row" key={item.jobId} onClick={() => openJob(item.jobId)} type="button">
              <span className="pn-mono">{item.jobId}</span>
              <span>{item.customer}</span>
              <span>{dateLabel(item.date)}</span>
              <span>{item.worked ? `${item.worked.toFixed(2)}h` : '-'}</span>
              <span>{money(item.pay)}</span>
              <span>
                <Badge tone={statusTone[item.status]} dot>{item.status}</Badge>
              </span>
              <span>
                <Badge tone={item.paymentStatus === 'Paid' ? 'success' : 'warning'}>{item.paymentStatus}</Badge>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="pn-empty">No jobs recorded for this officer yet.</div>
      )}

      <div className="pn-profile-label">Notes</div>
      <p className="pn-profile-notes">{noteText(officer.notes) || 'No notes on file.'}</p>
    </Modal>
  );
}
