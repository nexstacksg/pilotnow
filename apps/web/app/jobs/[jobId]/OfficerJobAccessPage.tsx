'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

const OfficerLocationMap = dynamic(() => import('./OfficerLocationMap').then((module) => module.OfficerLocationMap), { ssr: false });

type OfficerJob = {
  job: { id: string; customer: string; site: string; address: string | null; startAt: string; endAt: string; instructions: string | null; status: string };
  officer: { id: string; name: string; phone: string };
  assignment: {
    checkInAt: string | null;
    checkInLocation: string | null;
    checkInLatitude: string | null;
    checkInLongitude: string | null;
    checkOutAt: string | null;
    checkOutLocation: string | null;
    checkOutLatitude: string | null;
    checkOutLongitude: string | null;
  };
  evidencePhotos: { id: string; mediaRef: string; proofWindow: string | null; receivedAt: string }[];
};

type Slot = { key: string; time: string; title: string; kind: 'check-in' | 'hourly' | 'check-out'; at: Date };
type Position = { latitude: number; longitude: number };

function apiPath(jobId: string, hp: string, token: string, action = '') {
  return `/api/officer-jobs/${encodeURIComponent(jobId)}${action}?hp=${encodeURIComponent(hp)}&token=${encodeURIComponent(token)}`;
}

async function readJson<T>(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Request failed');
  return body as T;
}

async function readItem(response: Response) {
  return (await readJson<{ item: OfficerJob }>(response)).item;
}

export function OfficerJobAccessPage({ hp, jobId, token }: { hp: string; jobId: string; token: string }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState('');
  const [lateFile, setLateFile] = useState<File | null>(null);
  const [latePhoto, setLatePhoto] = useState('');
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [positionError, setPositionError] = useState('');
  const [localCheckInAt, setLocalCheckInAt] = useState<string | null>(null);
  const [localCheckOutAt, setLocalCheckOutAt] = useState<string | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const queryKey = ['officer-job', jobId, hp, token] as const;
  const jobQuery = useQuery({
    queryKey,
    queryFn: async () => readItem(await fetch(apiPath(jobId, hp, token))),
  });

  const data = jobQuery.data;
  const slots = useMemo(() => data ? buildSlots(data.job.startAt, data.job.endAt) : [], [data]);
  const uploadedByWindow = useMemo(() => new Map((data?.evidencePhotos ?? []).map((item) => [item.proofWindow || 'photo', item])), [data]);
  const pendingHourlySlots = slots.filter((slot) => slot.kind === 'hourly' && !uploadedByWindow.has(slot.key));
  const scheduledNow = data ? alignTimeToDate(now, new Date(data.job.startAt)) : now;
  const actualNextUploadSlot = pendingHourlySlots.find((slot) => !isSlotLate(slot, now) && !isSlotMissed(slot, now)) ?? null;
  const nextUploadSlot = actualNextUploadSlot ?? pendingHourlySlots.find((slot) => !isSlotLate(slot, scheduledNow) && !isSlotMissed(slot, scheduledNow)) ?? null;
  const uploadClock = actualNextUploadSlot ? now : scheduledNow;
  const lateSlot = pendingHourlySlots.find((slot) => isSlotLate(slot, uploadClock)) ?? null;
  const shiftHours = data ? Math.max(1, Math.round((new Date(data.job.endAt).getTime() - new Date(data.job.startAt).getTime()) / 3_600_000)) : 0;
  const checkedIn = Boolean(data?.assignment.checkInAt || localCheckInAt);
  const checkedOut = Boolean(data?.assignment.checkOutAt || localCheckOutAt);
  const photoCount = (file ? 1 : 0) + (photo.trim() ? 1 : 0);
  const latePhotoCount = (lateFile ? 1 : 0) + (latePhoto.trim() ? 1 : 0);
  const doneCount = data ? Number(checkedIn) + data.evidencePhotos.filter((item) => item.proofWindow && !['check-in', 'check-out'].includes(item.proofWindow)).length + Number(checkedOut) : 0;
  const checkInTime = timestampTime(data?.assignment.checkInAt ?? localCheckInAt);
  const currentTime = clockTime(now);
  const uploadCountdown = nextUploadSlot ? countdownLabel(nextUploadSlot.at, uploadClock) : '';

  async function refreshPosition() {
    setPositionError('');
    try {
      setPosition(await currentPosition());
    } catch {
      setPositionError('Allow location access to continue');
    }
  }

  useEffect(() => {
    if (data && !checkedOut) void refreshPosition();
  }, [data?.assignment.checkInAt, data?.assignment.checkOutAt]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  async function uploadPhoto(sourceFile = file, sourcePhoto = photo) {
    if (!data) throw new Error('Job not loaded');
    if (sourcePhoto.trim()) return sourcePhoto.trim();
    if (!sourceFile) throw new Error('Add a photo first');

    const form = new FormData();
    form.set('photo', sourceFile);
    return (await readJson<{ mediaRef: string }>(await fetch(apiPath(jobId, hp, token, '/evidence-file'), {
      method: 'POST',
      body: form,
    }))).mediaRef;
  }

  const attendanceMutation = useMutation({
    mutationFn: async ({ action }: { action: '/check-in' | '/check-out' }) => {
      const [latestPosition, mediaRef] = await Promise.all([position ? Promise.resolve(position) : currentPosition(), uploadPhoto()]);
      setPosition(latestPosition);
      return readItem(await fetch(apiPath(jobId, hp, token, action), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ evidencePhotoUrl: mediaRef, location: data?.job.site, ...latestPosition }),
      }));
    },
    onSuccess: (item, variables) => {
      if (variables.action === '/check-in') setLocalCheckInAt(item.assignment.checkInAt ?? new Date().toISOString());
      if (variables.action === '/check-out') setLocalCheckOutAt(item.assignment.checkOutAt ?? new Date().toISOString());
      queryClient.setQueryData(queryKey, item);
      setFile(null);
      setPhoto('');
    },
  });
  const evidenceMutation = useMutation({
    mutationFn: async ({ proofWindow, file: evidenceFile = file, photo: evidencePhoto = photo }: { proofWindow: string; file?: File | null; photo?: string }) => {
      const mediaRef = await uploadPhoto(evidenceFile, evidencePhoto);
      return readItem(await fetch(apiPath(jobId, hp, token, '/evidence'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mediaRef, proofWindow }),
      }));
    },
    onSuccess: (item) => {
      queryClient.setQueryData(queryKey, item);
      setFile(null);
      setPhoto('');
      setLateFile(null);
      setLatePhoto('');
      setActiveSlot(null);
    },
  });

  const submitError = attendanceMutation.error || evidenceMutation.error;
  const busy = attendanceMutation.isPending || evidenceMutation.isPending;
  if (jobQuery.error) return <PageShell><Panel><h1>Job link unavailable</h1><p>{jobQuery.error instanceof Error ? jobQuery.error.message : 'Could not load job'}</p></Panel></PageShell>;
  if (!data) return <PageShell><Panel><p>Loading job...</p></Panel></PageShell>;

  return (
    <PageShell>
      {checkedOut ? (
        <Summary data={data} doneCount={doneCount} localCheckInAt={localCheckInAt} localCheckOutAt={localCheckOutAt} shiftHours={shiftHours} slots={slots} uploadedByWindow={uploadedByWindow} />
      ) : showCheckoutForm ? (
        <CheckoutForm
          busy={busy}
          data={data}
          file={file}
          photo={photo}
          photoCount={photoCount}
          position={position}
          positionError={positionError}
          setFile={setFile}
          setPhoto={setPhoto}
          onBack={() => {
            setFile(null);
            setPhoto('');
            setShowCheckoutForm(false);
          }}
          onRefreshLocation={refreshPosition}
          onSubmit={() => attendanceMutation.mutate({ action: '/check-out' })}
          currentTime={currentTime}
        />
      ) : checkedIn ? (
        <>
          <TitleBlock kicker={`ON SHIFT · ${data.job.id}`} title={data.job.site} badge={`Checked in ${checkInTime}`} />
          <SubmitError error={submitError} />
          {nextUploadSlot ? (
            <Panel>
              <div style={styles.panelHead}><span>NEXT UPLOAD · {nextUploadSlot.time}</span><Badge>Upcoming</Badge></div>
              <div style={styles.uploadCardBody}>
                <span style={styles.startsIn}>STARTS IN</span>
                <div style={styles.uploadTimer}>{uploadCountdown}</div>
                <p style={styles.centerMuted}>Nothing to do yet — we'll notify you at {nextUploadSlot.time}.</p>
                <NextUploadControls disabled={!isSlotReady(nextUploadSlot, uploadClock)} file={file} setFile={setFile} />
                {isSlotReady(nextUploadSlot, uploadClock) ? (
                  <button disabled={busy || photoCount === 0} onClick={() => evidenceMutation.mutate({ proofWindow: nextUploadSlot.key })} style={styles.lateButton} type="button">Submit {nextUploadSlot.time} evidence</button>
                ) : (
                  <p style={styles.tooEarly}>Too early — the upload window opens at {nextUploadSlot.time}.</p>
                )}
              </div>
            </Panel>
          ) : null}
          {lateSlot ? <LateEvidenceCard busy={busy} file={lateFile} photoCount={latePhotoCount} setFile={setLateFile} slot={lateSlot} submit={() => evidenceMutation.mutate({ proofWindow: lateSlot.key, file: lateFile, photo: latePhoto })} /> : null}
          <Panel>
            <div style={styles.panelHead}><strong>Today's evidence</strong><span>{doneCount} OF {slots.length} DONE</span></div>
            {slots.map((slot) => {
              const done = slot.kind === 'check-in' ? checkedIn : slot.kind === 'check-out' ? checkedOut : uploadedByWindow.has(slot.key);
              const selected = activeSlot === slot.key;
              const ready = isSlotReady(slot, uploadClock);
              const late = isSlotLate(slot, uploadClock);
              const missed = isSlotMissed(slot, uploadClock);
              const title = evidenceRowTitle(slot, data, checkedIn, uploadedByWindow, nextUploadSlot, late);
              const rowTime = slot.kind === 'check-in' && checkedIn ? checkInTime : slot.time;
              return (
                <div key={slot.key} style={styles.slotRow}>
                  <span style={styles.mono}>{rowTime}</span>
                  <span style={{ ...styles.dot, background: done ? '#11875D' : '#D4D4D4' }} />
                  <span style={styles.slotTitle}>{title}</span>
                  {done ? <Badge tone="success">Done</Badge> : missed ? <Badge tone="danger">Missed</Badge> : late ? <Badge tone="danger">Upload late</Badge> : slot.kind === 'hourly' && ready ? <button style={styles.tinyButton} onClick={() => setActiveSlot(selected ? null : slot.key)} type="button">{selected ? 'Close' : 'Upload'}</button> : <Badge>Upcoming</Badge>}
                  {selected ? (
                    <div style={styles.inlineUpload}>
                      <PhotoControls disabled={!ready} file={file} photo={photo} setFile={setFile} setPhoto={setPhoto} />
                      <button disabled={busy || !ready || photoCount === 0} onClick={() => evidenceMutation.mutate({ proofWindow: slot.key })} style={styles.lateButton} type="button">Submit {slot.time} evidence</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </Panel>
          <button onClick={() => {
            setFile(null);
            setPhoto('');
            setShowCheckoutForm(true);
          }} style={styles.secondaryAction} type="button">Check out</button>
        </>
      ) : (
        <>
          <TitleBlock kicker={`CHECK-IN - ${data.job.id}`} title={`${data.job.customer} - ${data.job.site}`} badge="Link verified" subtitle={`Assigned by Admin - Today - ${scheduledTime(data.job.startAt)}-${scheduledTime(data.job.endAt)}`} />
          <SubmitError error={submitError} />
          <AssignmentPanel data={data} shiftHours={shiftHours} />
          <LocationPanel data={data} onRefresh={refreshPosition} position={position} positionError={positionError} />
          <Panel>
            <div style={styles.panelHead}><strong>Login proof photo</strong><span>{photoCount} ADDED - MIN 1</span></div>
            <PhotoControls file={file} photo={photo} setFile={setFile} setPhoto={setPhoto} />
          </Panel>
          <button disabled={busy || photoCount === 0 || !position} onClick={() => attendanceMutation.mutate({ action: '/check-in' })} style={styles.primaryAction} type="button">{busy ? 'Checking in...' : `Confirm check-in (${currentTime})`}</button>
          <p style={styles.footerNote}>Location and photos are sent to your admin on confirm.</p>
        </>
      )}
    </PageShell>
  );
}

function CheckoutForm({ busy, data, file, photo, photoCount, position, positionError, setFile, setPhoto, onBack, onRefreshLocation, onSubmit, currentTime }: { busy: boolean; data: OfficerJob; file: File | null; photo: string; photoCount: number; position: Position | null; positionError: string; setFile: (file: File | null) => void; setPhoto: (value: string) => void; onBack: () => void; onRefreshLocation: () => void; onSubmit: () => void; currentTime: string }) {
  return (
    <>
      <TitleBlock kicker={`CHECK-OUT - ${data.job.id}`} title="End of shift" badge="Link verified" subtitle="Confirm your location and add a final proof photo." />
      <LocationPanel data={data} onRefresh={onRefreshLocation} position={position} positionError={positionError} />
      <Panel>
        <div style={styles.panelHead}><strong>Check-out photos</strong><span>{photoCount} ADDED - MIN 1</span></div>
        <PhotoControls file={file} photo={photo} setFile={setFile} setPhoto={setPhoto} />
      </Panel>
      <button disabled={busy || photoCount === 0 || !position} onClick={onSubmit} style={styles.primaryAction} type="button">{busy ? 'Checking out...' : `Confirm check-out - ${currentTime}`}</button>
      <button disabled={busy} onClick={onBack} style={styles.backToShift} type="button">Back to shift</button>
    </>
  );
}

function SubmitError({ error }: { error: unknown }) {
  return error ? <div style={styles.errorBox}>{error instanceof Error ? error.message : 'Could not submit. Please try again.'}</div> : null;
}

function LateEvidenceCard({ busy, file, photoCount, setFile, slot, submit }: { busy: boolean; file: File | null; photoCount: number; setFile: (file: File | null) => void; slot: Slot; submit: () => void }) {
  const lockTime = formatTime(new Date(slot.at.getTime() + 30 * 60_000));
  return (
    <section style={styles.lateCard}>
      <div style={styles.lateHead}>
        <strong>△&nbsp; {slot.time} evidence — missed</strong>
        <span>LATE UNTIL&nbsp; {lockTime}</span>
      </div>
      <div style={styles.lateBody}>
        <p>You can still upload for the {slot.time} hour — it will be marked Late. At {lockTime} this window locks as Missed. Your admin has been notified.</p>
        <NextUploadControls file={file} setFile={setFile} />
        <button disabled={busy || photoCount === 0} onClick={submit} style={styles.lateButton} type="button">Submit {slot.time} evidence as late</button>
      </div>
    </section>
  );
}

function Summary({ data, doneCount, localCheckInAt, localCheckOutAt, shiftHours, slots, uploadedByWindow }: { data: OfficerJob; doneCount: number; localCheckInAt: string | null; localCheckOutAt: string | null; shiftHours: number; slots: Slot[]; uploadedByWindow: Map<string, OfficerJob['evidencePhotos'][number]> }) {
  const missed = slots.filter((slot) => slot.kind === 'hourly' && !uploadedByWindow.has(slot.key)).length;
  const checkInAt = data.assignment.checkInAt ?? localCheckInAt;
  const checkOutAt = data.assignment.checkOutAt ?? localCheckOutAt;
  return (
    <>
      <div style={styles.successMark}>✓</div>
      <h2 style={styles.summaryTitle}>Shift recorded</h2>
      <p style={styles.centerMuted}>Your check-in, hourly evidence and check-out were sent to Admin.</p>
      <Panel>
        <div style={styles.stats}>
          <Stat label="ON SITE" value={`${shiftHours}h`} />
          <Stat label="EVIDENCE" value={`${doneCount}/${slots.length}`} tone="#B7791F" />
          <Stat label="MISSED" value={String(missed)} tone="#FF3B30" />
        </div>
      </Panel>
      <Panel>
        <div style={styles.panelHead}><strong>Shift log</strong><span>{data.job.id}</span></div>
        {slots.map((slot) => {
          const ok = slot.kind === 'check-in' ? Boolean(checkInAt) : slot.kind === 'check-out' ? Boolean(checkOutAt) : uploadedByWindow.has(slot.key);
          const rowTime = slot.kind === 'check-in' && checkInAt ? timestampTime(checkInAt) : slot.kind === 'check-out' && checkOutAt ? timestampTime(checkOutAt) : slot.time;
          const title = slot.kind === 'check-in' ? 'Checked in · GPS ±8 m · photos' : slot.kind === 'check-out' ? 'Checked out · GPS ±6 m · photo' : slot.title;
          return <div key={slot.key} style={styles.slotRow}><span style={styles.mono}>{rowTime}</span><span style={{ ...styles.dot, background: ok ? '#11875D' : '#FF3B30' }} /><span style={styles.slotTitle}>{title}</span><Badge tone={ok ? 'success' : 'danger'}>{ok ? 'OK' : 'Missed'}</Badge></div>;
        })}
      </Panel>
    </>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <main style={styles.shell}><style>{officerResponsiveCss}</style><section className="officer-form" style={styles.form}>{children}</section></main>;
}

function Panel({ children }: { children: React.ReactNode }) {
  return <section style={styles.panel}>{children}</section>;
}

function TitleBlock({ kicker, title, badge, subtitle }: { kicker: string; title: string; badge: string; subtitle?: string }) {
  return <section className="officer-title-block" style={styles.titleBlock}><div><p style={styles.kicker}>{kicker}</p><h2 style={styles.jobTitle}>{title}</h2>{subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}</div><Badge tone="success">• {badge}</Badge></section>;
}

function AssignmentPanel({ data, shiftHours }: { data: OfficerJob; shiftHours: number }) {
  return (
    <section style={styles.assignmentTable}>
      <div style={styles.assignmentHead}><strong>Assignment</strong><span>{shiftHours}h&nbsp; SHIFT</span></div>
      <InfoRow label="SITE" value={[data.job.site, data.job.address].filter(Boolean).join(', ')} />
      <InfoRow label="EVIDENCE" value="Photo upload every hour, on the hour" />
      <InfoRow label="CHECK-IN" value={`Location + photo required at ${scheduledTime(data.job.startAt)}`} />
      <InfoRow label="CHECK-OUT" value={`Location + photo required at ${scheduledTime(data.job.endAt)}`} />
    </section>
  );
}

function LocationPanel({ data, onRefresh, position, positionError }: { data: OfficerJob; onRefresh: () => void; position: Position | null; positionError: string }) {
  const lat = position?.latitude ?? numberOrNull(data.assignment.checkInLatitude) ?? 1.2939;
  const lng = position?.longitude ?? numberOrNull(data.assignment.checkInLongitude) ?? 103.8560;
  const center: [number, number] = [lat, lng];
  return (
    <Panel>
      <div style={styles.panelHead}>
        <strong>Your location</strong>
        {position ? <Badge tone="success">• GPS locked · ±8 m</Badge> : <button style={styles.tinyButton} onClick={onRefresh} type="button">Enable GPS</button>}
      </div>
      <div className="officer-map" style={styles.map}>
        <OfficerLocationMap center={center} />
      </div>
      <div style={styles.mapFoot}><span>{positionError || data.job.site}</span><span>{gps(lat, lng)}</span></div>
    </Panel>
  );
}

function PhotoControls({ disabled = false, file, photo, setFile, setPhoto }: { disabled?: boolean; file: File | null; photo: string; setFile: (file: File | null) => void; setPhoto: (value: string) => void }) {
  const preview = useObjectUrl(file);
  return (
    <div style={styles.photoBlock}>
      <div style={styles.thumbs}>
        {file ? <Thumb label={file.name} onClear={() => setFile(null)} src={preview} /> : null}
      </div>
      <div className="officer-photo-actions" style={styles.photoActions}>
        <label style={{ ...styles.fileButton, ...(disabled ? styles.fileButtonDisabled : {}) }}>Camera<input accept="image/*" capture="environment" disabled={disabled} hidden onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" /></label>
      </div>
    </div>
  );
}

function NextUploadControls({ disabled = false, file, setFile }: { disabled?: boolean; file: File | null; setFile: (file: File | null) => void }) {
  const preview = useObjectUrl(file);
  return (
    <div style={styles.photoBlock}>
      <div style={styles.thumbs}>
        {file ? <Thumb label={file.name} onClear={() => setFile(null)} src={preview} /> : null}
      </div>
      <div className="officer-photo-actions officer-next-upload-actions" style={styles.nextUploadActions}>
        <label style={{ ...styles.fileButton, ...(disabled ? styles.fileButtonDisabled : {}) }}>▧&nbsp; Camera<input accept="image/*" capture="environment" disabled={disabled} hidden onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" /></label>
      </div>
    </div>
  );
}

function Thumb({ label, onClear, src }: { label: string; onClear: () => void; src?: string }) {
  return <div style={styles.thumb}><button onClick={onClear} style={styles.clearThumb} type="button">×</button>{src ? <img alt="" src={src} style={styles.thumbImage} /> : <span>□</span>}<small>{label}</small></div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="officer-info-row" style={styles.infoRow}><span>{label}</span><strong>{value}</strong></div>;
}

function Badge({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'success' | 'danger' }) {
  const colors = tone === 'success' ? { color: '#087443', background: '#E7F7EE', borderColor: '#B7E4C8' } : tone === 'danger' ? { color: '#D92D20', background: '#FFF0F0', borderColor: '#FFD2D2' } : {};
  return <span style={{ ...styles.badge, ...colors }}>{children}</span>;
}

function Stat({ label, value, tone = '#0A0A0A' }: { label: string; value: string; tone?: string }) {
  return <div style={styles.stat}><strong style={{ ...styles.statValue, color: tone }}>{value}</strong><span style={styles.statLabel}>{label}</span></div>;
}

function buildSlots(startAt: string, endAt: string): Slot[] {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const slots: Slot[] = [{ key: 'check-in', time: scheduledTime(startAt), title: 'Check-in - GPS + photo', kind: 'check-in', at: start }];
  for (const at = new Date(start.getTime() + 3_600_000); at < end; at.setHours(at.getHours() + 1)) {
    const key = dateTimeKey(at);
    slots.push({ key, time: formatTimeKey(key), title: 'Hourly evidence - 1 photo', kind: 'hourly', at: new Date(at) });
  }
  slots.push({ key: 'check-out', time: scheduledTime(endAt), title: 'Check-out - GPS + photo', kind: 'check-out', at: end });
  return slots;
}

function alignTimeToDate(timeSource: Date, dateSource: Date) {
  const time = singaporeTimeParts(timeSource);
  const date = singaporeDateParts(dateSource);
  return new Date(`${date.year}-${date.month}-${date.day}T${time.hour}:${time.minute}:00+08:00`);
}

function evidenceRowTitle(slot: Slot, data: OfficerJob, checkedIn: boolean, uploadedByWindow: Map<string, OfficerJob['evidencePhotos'][number]>, currentSlot: Slot | null, late: boolean) {
  if (slot.kind === 'check-in') {
    const proofCount = checkedIn ? checkInProofCount(data) : 1;
    return `Check-in · GPS + ${proofCount} photo${proofCount === 1 ? '' : 's'}`;
  }
  if (slot.kind === 'check-out') return 'Check-out · GPS + photo';
  if (uploadedByWindow.has(slot.key)) return 'Hourly evidence · 1 photo';
  if (late) return 'Hourly evidence · late window open';
  if (currentSlot?.key === slot.key) return 'Hourly evidence · next up';
  return 'Hourly evidence';
}

function isSlotReady(slot: Slot, now: Date) {
  return slot.kind !== 'hourly' || now >= slot.at;
}

function isSlotLate(slot: Slot, now: Date) {
  const elapsed = now.getTime() - slot.at.getTime();
  return slot.kind === 'hourly' && elapsed > 5 * 60_000 && elapsed <= 30 * 60_000;
}

function isSlotMissed(slot: Slot, now: Date) {
  return slot.kind === 'hourly' && now.getTime() > slot.at.getTime() + 30 * 60_000;
}

function checkInProofCount(data: OfficerJob) {
  return Math.max(1, data.evidencePhotos.filter((item) => item.proofWindow === 'check-in').length);
}

function currentPosition() {
  return new Promise<Position>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }), reject, { enableHighAccuracy: true, timeout: 8000 });
  });
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file) {
      setUrl('');
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

function scheduledTime(value: string | null) {
  return value ? formatTime(new Date(value)) : '--:--';
}

function timestampTime(value: string | null) {
  return value ? formatTime(new Date(value)) : '--:--';
}

function clockTime(value: Date) {
  return formatTime(value);
}

function countdownLabel(target: Date, now: Date) {
  const seconds = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 1_000));
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const secs = seconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function dateTimeKey(value: Date) {
  const parts = singaporeTimeParts(value);
  return `${parts.hour}:${parts.minute}`;
}

function formatTime(value: Date) {
  return value.toLocaleTimeString('en-GB', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatTimeKey(value: string) {
  const [hour = '0', minute = '00'] = value.split(':');
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

function singaporeTimeParts(value: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(value);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '00';
  return { hour: part('hour'), minute: part('minute') };
}

function singaporeDateParts(value: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '01';
  return { year: part('year'), month: part('month'), day: part('day') };
}

function numberOrNull(value: string | null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function gps(lat: number, lng: number) {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

const appFont = "'Geist', -apple-system, system-ui, sans-serif";
const officerResponsiveCss = `
  @media (min-width: 900px) {
    .officer-form {
      max-width: 720px !important;
    }
  }

  @media (max-width: 640px) {
    .officer-title-block {
      display: grid !important;
      gap: 8px !important;
    }

    .officer-info-row {
      grid-template-columns: 92px 1fr !important;
      gap: 10px !important;
      min-height: 38px !important;
      padding: 8px 12px !important;
    }

    .officer-photo-actions {
      grid-template-columns: 1fr !important;
    }

    .officer-map {
      height: 120px !important;
      margin: 0 10px !important;
    }
  }
`;
const styles: Record<string, CSSProperties> = {
  shell: { minHeight: '100vh', background: '#FFFFFF', color: '#0A0A0A', padding: '18px 12px', fontFamily: appFont },
  form: { width: 'min(720px, 100%)', margin: '0 auto', background: '#FFFFFF' },
  titleBlock: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
  kicker: { margin: '0 0 6px', color: '#A3A3A3', fontFamily: appFont, fontSize: 11, letterSpacing: 1.1 },
  jobTitle: { margin: 0, fontSize: 22, lineHeight: 1.1 },
  subtitle: { margin: '8px 0 0', color: '#525252', fontSize: 13 },
  panel: { marginBottom: 12, overflow: 'hidden', border: '1px solid #E3E3E3', borderRadius: 6, background: '#FFFFFF' },
  panelHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', borderBottom: '1px solid #E8E8E8', fontSize: 14 },
  errorBox: { marginBottom: 10, border: '1px solid #FFD2D2', borderRadius: 6, background: '#FFF7F7', color: '#B42318', padding: '10px 12px', fontSize: 13 },
  assignmentTable: { marginBottom: 12, overflow: 'hidden', border: '1px solid #E3E3E3', borderRadius: 6, background: '#FFFFFF' },
  assignmentHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, height: 42, padding: '0 14px', borderBottom: '1px solid #E8E8E8', fontSize: 14 },
  badge: { display: 'inline-flex', alignItems: 'center', height: 21, border: '1px solid #DADADA', borderRadius: 3, background: '#FAFAFA', color: '#525252', padding: '0 6px', fontFamily: appFont, fontSize: 10, whiteSpace: 'nowrap' },
  infoRow: { display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', minHeight: 38, padding: '0 14px', borderBottom: '1px solid #EFEFEF', fontSize: 14 },
  map: { position: 'relative', height: 150, margin: '0 12px', overflow: 'hidden', background: '#F7F7F7' },
  leafletMap: { width: '100%', height: '100%' },
  mapFoot: { display: 'flex', justifyContent: 'space-between', gap: 8, padding: '9px 12px', color: '#737373', fontSize: 12 },
  photoBlock: { padding: 12 },
  thumbs: { display: 'flex', gap: 10, minHeight: 0, marginBottom: 10 },
  thumb: { position: 'relative', display: 'grid', width: 110, height: 92, placeItems: 'center', border: '1px solid #E2E2E2', borderRadius: 6, background: '#F4F4F4', color: '#8A8A8A', fontFamily: appFont, fontSize: 11, overflow: 'hidden', padding: 8 },
  thumbImage: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  clearThumb: { position: 'absolute', top: 4, right: 4, zIndex: 1, width: 17, height: 17, border: '1px solid #DDD', borderRadius: 999, background: '#FFF', color: '#9A9A9A', lineHeight: 1 },
  photoActions: { display: 'grid', gridTemplateColumns: '1fr', gap: 8 },
  nextUploadActions: { display: 'grid', gridTemplateColumns: '1fr', gap: 8 },
  fileButton: { display: 'grid', height: 38, placeItems: 'center', border: '1px solid #D4D4D4', borderRadius: 4, background: '#FFFFFF', fontSize: 12, fontWeight: 700 },
  fileButtonDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  primaryAction: { width: '100%', height: 44, border: 0, borderRadius: 4, background: '#050505', color: '#FFFFFF', fontSize: 13, fontWeight: 800 },
  secondaryAction: { width: '100%', height: 44, border: '1px solid #DADADA', borderRadius: 4, background: '#FFFFFF', color: '#0A0A0A', fontSize: 13, fontWeight: 800 },
  backToShift: { display: 'block', width: '100%', height: 52, marginTop: 18, border: 0, background: 'transparent', color: '#525252', fontSize: 16, fontWeight: 700 },
  footerNote: { margin: '8px 0 0', color: '#A3A3A3', textAlign: 'center', fontSize: 10 },
  uploadCardBody: { padding: '18px 10px 12px', textAlign: 'center' },
  startsIn: { display: 'block', color: '#A3A3A3', fontSize: 10, letterSpacing: 1.5 },
  uploadTimer: { margin: '4px 0 6px', textAlign: 'center', fontFamily: appFont, fontSize: 44, lineHeight: 1, fontWeight: 900 },
  timer: { margin: '20px 0 6px', textAlign: 'center', fontFamily: appFont, fontSize: 42, fontWeight: 900 },
  centerMuted: { margin: '0 20px 14px', color: '#737373', textAlign: 'center', fontSize: 12 },
  tooEarly: { margin: '0 0 2px', color: '#A3A3A3', textAlign: 'center', fontSize: 11 },
  slotRow: { display: 'grid', gridTemplateColumns: '70px 10px 1fr auto', alignItems: 'center', gap: 9, padding: '9px 10px', borderTop: '1px solid #EFEFEF', fontSize: 12 },
  mono: { fontFamily: appFont, fontWeight: 700, whiteSpace: 'nowrap' },
  dot: { width: 7, height: 7, borderRadius: 999 },
  slotTitle: { minWidth: 0 },
  tinyButton: { border: '1px solid #FFD2D2', borderRadius: 3, background: '#FFF7F7', color: '#D92D20', padding: '3px 6px', fontSize: 10 },
  inlineUpload: { gridColumn: '1 / -1', borderLeft: '2px solid #FF3B30', background: '#FFF7F7' },
  lateCard: { marginBottom: 20, overflow: 'hidden', border: '1px solid #FF6B6B', borderLeft: '3px solid #FF3B30', borderRadius: 8, background: '#FFFFFF' },
  lateHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid #FFD9D9', background: '#FFF0F0', color: '#D92D20', fontSize: 15 },
  lateBody: { padding: '14px 16px' },
  lateButton: { width: '100%', height: 44, border: 0, borderRadius: 4, background: '#FF9D9D', color: '#FFFFFF', fontSize: 14, fontWeight: 800 },
  successMark: { display: 'grid', width: 42, height: 42, placeItems: 'center', margin: '34px auto 14px', borderRadius: 999, background: '#050505', color: '#FFFFFF', fontSize: 22 },
  summaryTitle: { margin: 0, textAlign: 'center', fontSize: 18 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, padding: 8 },
  stat: { display: 'grid', gap: 2, minHeight: 54, placeItems: 'center', border: '1px solid #ECECEC', borderRadius: 6, background: '#FAFAFA' },
  statValue: { fontSize: 20, lineHeight: 1, fontWeight: 900 },
  statLabel: { color: '#737373', fontSize: 10, fontWeight: 800, letterSpacing: 0.6 },
};
