import { Field } from './ui';
import type { JobForm, OfficerForm } from '../types';

type FormSetter<T> = (updater: (form: T) => T) => void;

export function JobFormFields({ form, setForm }: { form: JobForm; setForm: FormSetter<JobForm> }) {
  return (
    <div className="pn-form-grid">
      <Field label="Customer" required>
        <input placeholder="e.g. Sentinel Events Pte Ltd" value={form.customer} onChange={(event) => setForm((item) => ({ ...item, customer: event.target.value }))} />
      </Field>
      <Field label="Job location" required>
        <input placeholder="e.g. Marina Bay Sands - Expo Hall B" value={form.location} onChange={(event) => setForm((item) => ({ ...item, location: event.target.value }))} />
      </Field>
      <div className="pn-form-row pn-form-row-time">
        <Field label="Job date">
          <input type="date" value={form.date} onChange={(event) => setForm((item) => ({ ...item, date: event.target.value }))} />
        </Field>
        <Field label="Start">
          <input type="time" value={form.start} onChange={(event) => setForm((item) => ({ ...item, start: event.target.value }))} />
        </Field>
        <Field label="End">
          <input type="time" value={form.end} onChange={(event) => setForm((item) => ({ ...item, end: event.target.value }))} />
        </Field>
      </div>
      <Field label="Officers">
        <select value={form.required} onChange={(event) => setForm((item) => ({ ...item, required: event.target.value }))}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
            <option key={count} value={count}>
              {count} officer{count > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Description">
        <textarea placeholder="What is the job?" rows={2} value={form.description} onChange={(event) => setForm((item) => ({ ...item, description: event.target.value }))} />
      </Field>
      <Field label="Instructions">
        <textarea placeholder="Dress code, reporting point, etc." rows={2} value={form.instructions} onChange={(event) => setForm((item) => ({ ...item, instructions: event.target.value }))} />
      </Field>
    </div>
  );
}

export function OfficerFormFields({ form, setForm }: { form: OfficerForm; setForm: FormSetter<OfficerForm> }) {
  return (
    <div className="pn-form-grid">
      <Field label="Full name" required>
        <input placeholder="e.g. Ravi Chandran" value={form.name} onChange={(event) => setForm((item) => ({ ...item, name: event.target.value }))} />
      </Field>
      <Field label="WhatsApp number" required>
        <input className="pn-mono-input" placeholder="+65 8123 4567" value={form.phone} onChange={(event) => setForm((item) => ({ ...item, phone: event.target.value }))} />
      </Field>
      <div className="pn-form-row">
        <Field label="Default hourly rate (S$)">
          <input className="pn-mono-input" max="40" min="10" type="number" value={form.rate} onChange={(event) => setForm((item) => ({ ...item, rate: event.target.value }))} />
        </Field>
        <Field label="Officer status">
          <select value={form.status} onChange={(event) => setForm((item) => ({ ...item, status: event.target.value as OfficerForm['status'] }))}>
            {['New', 'Active', 'Inactive', 'Blocked'].map((status) => (
              <option key={status}>{status}</option>
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
        <textarea placeholder="Availability, certifications, etc." rows={2} value={form.notes} onChange={(event) => setForm((item) => ({ ...item, notes: event.target.value }))} />
      </Field>
    </div>
  );
}
