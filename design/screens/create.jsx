/* global React, PN_DATA, Icon, cx, Avatar */
// PilotNow — Job creation. Natural-language intake → structured job, plus a recurring-schedule builder.

const { useState: useStateC } = React;

const DOW = [
  { k: 'mon', label: 'Mo' }, { k: 'tue', label: 'Tu' }, { k: 'wed', label: 'We' },
  { k: 'thu', label: 'Th' }, { k: 'fri', label: 'Fr' }, { k: 'sat', label: 'Sa' }, { k: 'sun', label: 'Su' },
];

function Field({ label, hint, children, span }) {
  return (
    <div className={cx(span && 'span-2')}>
      <label className="f-label">{label}</label>
      {children}
      {hint && <div className="f-hint">{hint}</div>}
    </div>
  );
}

function NlIntake({ onParse }) {
  const sample = 'Need 2 officers at MBFC Tower 1 this Saturday 7am to 7pm, day shift, hourly photo proof, report to Mr Suresh.';
  const [text, setText] = useStateC('');
  return (
    <div className="form-card">
      <div className="hd">
        <Avatar initials="AI" tone="ink" size="sm" />
        <span className="t-eyebrow">Natural-language intake</span>
        <span style={{ flex: 1 }}></span>
        <span className="id-pill">parsed live · WhatsApp + paste</span>
      </div>
      <div className="bd">
        <textarea className="input" rows={3} placeholder={sample} value={text} onChange={e => setText(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-dark" onClick={() => onParse && onParse(text || sample)}><Icon name="sparkles" size={13} /> Parse into job</button>
          <button className="btn btn-ghost" onClick={() => setText(sample)}>Use example</button>
          <span style={{ flex: 1 }}></span>
          <span className="f-hint">Fields below are pre-filled — review &amp; edit before creating.</span>
        </div>
      </div>
    </div>
  );
}

window.CreateJobScreen = function CreateJobScreen({ mode: initialMode = 'single', onBack }) {
  const [mode, setMode]   = useStateC(initialMode);
  const [days, setDays]   = useStateC(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [parsed, setParsed] = useStateC(false);
  const recurring = mode === 'recurring';

  function toggleDay(k) {
    setDays(d => d.includes(k) ? d.filter(x => x !== k) : [...d, k]);
  }

  const v = parsed
    ? { site: 'S-201', client: 'C-014', start: '07:00', end: '19:00', type: 'Day shift', need: '2', notes: 'Hourly photo proof. Report to Mr. Suresh at LB.', date: '2026-05-16' }
    : { site: '', client: '', start: '', end: '', type: 'Day shift', need: '1', notes: '', date: '2026-05-13' };

  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a onClick={onBack} style={{ color: 'var(--fg-2)', cursor: 'pointer', textDecoration: 'none' }}>← Scheduling</a>
            <span style={{ color: 'var(--fg-4)' }}>/</span>
            <span>{recurring ? 'NEW RECURRING SCHEDULE' : 'NEW JOB'}</span>
          </div>
          <h1 style={{ marginTop: 6 }}>{recurring ? 'Recurring schedule' : 'Create a job'}</h1>
          <div className="meta">{recurring ? 'Generates jobs ahead on a fixed pattern · officers assigned per generated job' : 'Single shift · one site · one window'}</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
          <button className="btn btn-secondary">Save draft</button>
          <button className="btn btn-red"><Icon name="check" size={13} /> {recurring ? 'Create schedule' : 'Create job'}</button>
        </div>
      </div>

      <div className="tb">
        <div className="seg">
          <button className={cx(!recurring && 'on')} onClick={() => setMode('single')}><Icon name="calendar-plus" size={12} /> Single job</button>
          <button className={cx(recurring && 'on')} onClick={() => setMode('recurring')}><Icon name="repeat" size={12} /> Recurring</button>
        </div>
        <span className="spacer"></span>
        <span className="id-pill">Step 1 of 2 · details</span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div className="form-wrap">
          {!recurring && <NlIntake onParse={() => setParsed(true)} />}

          <div className="form-card">
            <div className="hd"><span className="t-eyebrow">Site &amp; client</span></div>
            <div className="bd">
              <div className="form-grid">
                <Field label="Client">
                  <select className="input" defaultValue={v.client}>
                    <option value="">Select client…</option>
                    {PN_DATA.CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Site">
                  <select className="input" defaultValue={v.site}>
                    <option value="">Select site…</option>
                    {PN_DATA.SITES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Job type">
                  <select className="input" defaultValue={v.type}>
                    {['Day shift', 'Night patrol', 'Concierge', 'Event', 'Standby'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Officers needed">
                  <input className="input" type="number" min="1" defaultValue={v.need} />
                </Field>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="hd"><span className="t-eyebrow">{recurring ? 'Pattern &amp; window' : 'Schedule'}</span></div>
            <div className="bd">
              {recurring ? (
                <>
                  <Field label="Repeats on">
                    <div className="dow-pick">
                      {DOW.map(d => <button key={d.k} className={cx(days.includes(d.k) && 'on')} onClick={() => toggleDay(d.k)}>{d.label}</button>)}
                    </div>
                  </Field>
                  <div className="form-grid cols-3">
                    <Field label="Start date"><input className="input" type="date" defaultValue="2026-05-13" /></Field>
                    <Field label="End date" hint="Leave blank for open-ended"><input className="input" type="date" /></Field>
                    <Field label="Generate ahead"><select className="input" defaultValue="14"><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></select></Field>
                    <Field label="Shift start"><input className="input" type="time" defaultValue={v.start || '07:00'} /></Field>
                    <Field label="Shift end"><input className="input" type="time" defaultValue={v.end || '19:00'} /></Field>
                    <Field label="Skip public holidays"><select className="input"><option>Yes</option><option>No</option></select></Field>
                  </div>
                </>
              ) : (
                <div className="form-grid cols-3">
                  <Field label="Date"><input className="input" type="date" defaultValue={v.date} /></Field>
                  <Field label="Start"><input className="input" type="time" defaultValue={v.start} /></Field>
                  <Field label="End" hint="Crosses midnight for night shifts"><input className="input" type="time" defaultValue={v.end} /></Field>
                </div>
              )}
            </div>
          </div>

          <div className="form-card">
            <div className="hd"><span className="t-eyebrow">Proof &amp; instructions</span></div>
            <div className="bd">
              <div className="form-grid">
                <Field label="Periodic proof interval"><select className="input" defaultValue="60"><option value="0">Off</option><option value="60">Every 60 min</option><option value="120">Every 2 hours</option></select></Field>
                <Field label="GPS radius override" hint="Defaults to the site’s configured radius"><input className="input" placeholder="Use site default (80 m)" /></Field>
                <Field label="Notes for officers" span><textarea className="input" rows={2} defaultValue={v.notes} placeholder="Access, uniform, who to report to…" /></Field>
              </div>
            </div>
          </div>

          {recurring && (
            <div className="form-card">
              <div className="hd"><span className="t-eyebrow">Preview · next 5 occurrences</span></div>
              <table className="tbl">
                <thead><tr><th>Date</th><th>Window</th><th>Officers</th><th>Status</th></tr></thead>
                <tbody>
                  {['Wed May 14', 'Thu May 15', 'Fri May 16', 'Mon May 19', 'Tue May 20'].map(d => (
                    <tr key={d}><td className="mono">{d}</td><td className="mono">{v.start || '07:00'}–{v.end || '19:00'}</td><td className="mono">0/{v.need}</td><td><span className="s-chip red">Unstaffed</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
