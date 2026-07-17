'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { PencilIcon } from '../../../features/admin/components/icons';

type Report = {
  id: string;
  customer: { name: string };
  site: { name: string; address: string | null };
  startAt: string;
  endAt: string;
  assignments: {
    officerId: string;
    officerName: string;
    checkInAt: string | null;
    checkOutAt: string | null;
  }[];
  proofPhotos: {
    officerId: string;
    officerName: string;
    proofWindow: string | null;
    receivedAt: string;
    photoUrl: string;
  }[];
};

export function SignReportPage({ jobId, token }: { jobId: string; token: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'images' | 'sign'>('images');
  const [signed, setSigned] = useState(false);
  const [signatureImage, setSignatureImage] = useState('');
  const [clearSignatureCount, setClearSignatureCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openOfficerId, setOpenOfficerId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/jobs/${encodeURIComponent(jobId)}/sign-report?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Could not load report');
        setReport(body.item);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load report'));
  }, [jobId, token]);

  const photosByOfficer = useMemo(() => {
    const groups = new Map<string, Report['proofPhotos']>();
    report?.proofPhotos.forEach((photo) => groups.set(photo.officerId, [...(groups.get(photo.officerId) ?? []), photo]));
    return groups;
  }, [report]);

  useEffect(() => {
    if (!openOfficerId && report?.assignments[0]) setOpenOfficerId(report.assignments[0].officerId);
  }, [openOfficerId, report]);

  async function sendToAdmin() {
    if (!signed || sending || sent) return;
    setSending(true);
    setError('');
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/sign-report`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Could not send report');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send report');
    } finally {
      setSending(false);
    }
  }

  if (error) return <main style={styles.shell}><section style={styles.card}><h1>Report unavailable</h1><p>{error}</p></section></main>;
  if (!report) return <main style={styles.shell}><section style={styles.card}>Loading report...</section></main>;

  return (
    <main style={styles.shell}>
      <style>{responsiveCss}</style>
      <section style={styles.card}>
        <p style={styles.kicker}>ACTIVE JOB <span style={styles.badge}>• In Progress</span></p>
        <h1 style={styles.title}>{report.customer.name} — {report.site.name}</h1>
        <p style={styles.muted}>Assigned by Admin · Today · {time(report.startAt)}–{time(report.endAt)}</p>
      </section>

      <div style={styles.tabs}>
        <button onClick={() => setTab('images')} style={tab === 'images' ? styles.activeTab : styles.tab} type="button">Images</button>
        <button onClick={() => setTab('sign')} style={tab === 'sign' ? styles.activeTab : styles.tab} type="button">Signature & Report</button>
      </div>

      {tab === 'images' ? (
        <section style={styles.card}>
          <h2>Photo Evidence</h2>
          <p style={styles.muted}>GPS-verified hourly check-in photos</p>
          {report.assignments.map((officer) => {
            const photos = photosByOfficer.get(officer.officerId) ?? [];
            const checkIn = photos.filter((photo) => photo.proofWindow === 'check-in');
            const checkOut = photos.filter((photo) => photo.proofWindow === 'check-out');
            const hourly = photos.filter((photo) => photo.proofWindow !== 'check-in' && photo.proofWindow !== 'check-out');
            const isOpen = openOfficerId === officer.officerId;
            return (
              <div style={styles.officerBlock} key={officer.officerId}>
                <button
                  onClick={() => setOpenOfficerId(isOpen ? null : officer.officerId)}
                  style={styles.officerToggle}
                  type="button"
                >
                  <span>
                    <strong>{officer.officerName}</strong>
                    <small style={styles.officerSummary}>
                      {time(officer.checkInAt)} - {time(officer.checkOutAt)} · {photos.length} photos
                    </small>
                  </span>
                  <span aria-hidden>{isOpen ? '⌃' : '⌄'}</span>
                </button>
                {isOpen ? (
                  <div style={styles.officerBody}>
                    <PhotoGroup title={`Check-In Evidence (${checkIn.length})`} photos={checkIn} />
                    <PhotoGroup title={`Hourly Photos (${hourly.length})`} photos={hourly} />
                    <PhotoGroup title={`Check-Out Evidence (${checkOut.length})`} photos={checkOut} />
                  </div>
                ) : null}
              </div>
            );
          })}
          <button onClick={() => setTab('sign')} style={styles.primary} type="button">Process to Sign Report</button>
        </section>
      ) : (
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Duty Officer Report</h2>
          <p style={styles.mono}>DO-{report.id.replace(/\D/g, '').padStart(4, '0')}-001</p>
          <div style={styles.reportGrid}>
            <Info label="CLIENT" value={report.customer.name} />
            <Info label="SITE" value={report.site.address || report.site.name} />
            <Info label="DATE" value={new Date(report.startAt).toLocaleDateString()} />
            <Info label="SHIFT" value={`${time(report.startAt)} - ${time(report.endAt)}`} />
            <Info label="OFFICERS" value={`${report.assignments.length} deployed`} />
          </div>
          <h3 style={styles.subTitle}>Assigned Officers</h3>
          {report.assignments.map((officer) => (
            <div style={styles.assigned} key={officer.officerId}>
              <b style={styles.avatar}>{initials(officer.officerName)}</b>
              <span style={styles.assignedText}><strong>{officer.officerName}</strong><small>{officer.officerId} · {time(officer.checkInAt)} - {time(officer.checkOutAt)} · {(photosByOfficer.get(officer.officerId) ?? []).length} photos</small></span>
            </div>
          ))}
          <h3 style={styles.subTitle}>Site Manager Signature</h3>
          <SignaturePad clearCount={clearSignatureCount} onSigned={(image) => {
            setSignatureImage(image);
            setSigned(true);
          }} />
          <div style={styles.actions}>
            <button onClick={() => {
              setSigned(false);
              setSignatureImage('');
              setClearSignatureCount((count) => count + 1);
            }} style={styles.secondary} type="button">Clear</button>
            <button disabled={!signed} style={styles.primary} type="button">Confirm Signature</button>
          </div>
          <div style={styles.signedBox}>
            <span>Signed by</span><strong>Mr. James Lim</strong>
            <span>Role</span><strong>Site Manager</strong>
            <span>Date & Time</span><strong>{signed ? new Date().toLocaleString() : '-'}</strong>
          </div>
          <div style={styles.actions}>
            <button disabled={!signed} onClick={() => window.print()} style={styles.secondary} type="button">Download PDF</button>
            <button disabled={!signed || sending || sent} onClick={sendToAdmin} style={styles.primary} type="button">
              {sent ? 'Completed' : sending ? 'Sending...' : 'Send to Admin'}
            </button>
          </div>
          <PrintableReport report={report} photosByOfficer={photosByOfficer} sent={sent} signatureImage={signatureImage} signed={signed} />
        </section>
      )}
    </main>
  );
}

function PhotoGroup({ title, photos }: { title: string; photos: Report['proofPhotos'] }) {
  return (
    <div style={styles.photoGroup}>
      <strong>✓ {title}</strong>
      <p style={styles.muted}>GPS · GPS Verified - 123 Nassim Road</p>
      <div className="sign-thumbs" style={styles.thumbs}>
        {photos.map((photo) => <img alt="" src={photo.photoUrl} style={styles.thumb} key={`${photo.photoUrl}-${photo.receivedAt}`} />)}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div style={styles.infoItem}><span style={styles.infoLabel}>{label}</span><strong style={styles.infoValue}>{value}</strong></div>;
}

function SignaturePad({ clearCount, onSigned }: { clearCount: number; onSigned: (image: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [penOn, setPenOn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(rect.height * scale);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(scale, scale);
    context.clearRect(0, 0, rect.width, rect.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 2.4;
    context.strokeStyle = '#0A0A0A';
  }, [clearCount]);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!penOn) return;
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const { x, y } = point(event);
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(x, y);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const { x, y } = point(event);
    context.lineTo(x, y);
    context.stroke();
    onSigned(event.currentTarget.toDataURL('image/png'));
  }

  function stop(event: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div style={styles.signature}>
      <button aria-label={penOn ? 'Disable pencil' : 'Use pencil'} onClick={() => setPenOn((value) => !value)} style={penOn ? styles.penButtonActive : styles.penButton} type="button">
        <PencilIcon size={15} strokeWidth={2.2} />
      </button>
      <canvas
        aria-label="Site manager signature pad"
        onPointerCancel={stop}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        ref={canvasRef}
        style={{ ...styles.signatureCanvas, cursor: penOn ? 'crosshair' : 'default' }}
      />
      <span style={styles.signatureHint}>{penOn ? 'Sign here' : 'Click Pen to sign'}</span>
    </div>
  );
}

function PrintableReport({ photosByOfficer, report, sent, signatureImage, signed }: { photosByOfficer: Map<string, Report['proofPhotos']>; report: Report; sent: boolean; signatureImage: string; signed: boolean }) {
  const checkSets = report.assignments.reduce((count, officer) => {
    const photos = photosByOfficer.get(officer.officerId) ?? [];
    return count + Number(photos.some((photo) => photo.proofWindow === 'check-in') && photos.some((photo) => photo.proofWindow === 'check-out'));
  }, 0);
  const hourly = report.proofPhotos.filter((photo) => photo.proofWindow !== 'check-in' && photo.proofWindow !== 'check-out').length;
  const docNo = `DO-${report.id.replace(/\D/g, '').padStart(4, '0')}-001`;
  return (
    <section className="do-print-report">
      <header>
        <div>
          <span>DUTY OFFICER REPORT</span>
          <h1>{report.site.name}</h1>
          <p>{report.customer.name} · {report.site.address || report.site.name}</p>
        </div>
        <div>
          <strong>{docNo}</strong>
          <b>{sent ? 'Completed' : 'Pending'}</b>
        </div>
      </header>
      <div className="do-rule" />
      <div className="do-facts">
        <Info label="DATE" value={new Date(report.startAt).toLocaleDateString()} />
        <Info label="SHIFT" value={`${time(report.startAt)} - ${time(report.endAt)}`} />
        <Info label="OFFICERS" value={`${report.assignments.length} deployed`} />
        <Info label="CLIENT REF" value={report.id} />
      </div>
      <h2>ASSIGNED OFFICERS</h2>
      <table>
        <thead><tr><th>OFFICER</th><th>ID</th><th>CHECK-IN / OUT</th><th>PHOTOS</th></tr></thead>
        <tbody>
          {report.assignments.map((officer) => (
            <tr key={officer.officerId}>
              <td>{officer.officerName}</td>
              <td>{officer.officerId}</td>
              <td>{time(officer.checkInAt)} - {time(officer.checkOutAt)}</td>
              <td>{(photosByOfficer.get(officer.officerId) ?? []).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>PHOTO EVIDENCE SUMMARY</h2>
      <div className="do-summary">
        <div><strong>{checkSets}</strong><span>Check-in / out sets</span></div>
        <div><strong>{hourly}</strong><span>Hourly patrol photos</span></div>
        <div><strong>✓ GPS</strong><span>All check-ins verified</span></div>
      </div>
      <h2>SITE MANAGER SIGN-OFF</h2>
      <div className="do-signature">
        {signed && signatureImage ? <img alt="Site manager signature" src={signatureImage} /> : <strong>Pending signature</strong>}
        <span>SIGNED</span>
      </div>
      <footer>
        <strong>Mr. James Lim · Site Manager</strong>
        <b>{signed ? new Date().toLocaleString() : '-'}</b>
      </footer>
      <small>Generated by PilotNow · pilotnow.app <span>{docNo} · Page 1 of 1</span></small>
    </section>
  );
}

function time(value: string | null) {
  return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-';
}

function initials(value: string) {
  return value.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

const responsiveCss = `
  .do-print-report {
    display: none;
  }

  @media (min-width: 900px) {
    .sign-thumbs {
      grid-template-columns: repeat(8, minmax(72px, 1fr)) !important;
    }
  }

  @media (max-width: 560px) {
    .sign-thumbs {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }
  }

  @media print {
    @page {
      margin: 14mm;
    }

    body {
      background: #fff !important;
    }

    body * {
      visibility: hidden !important;
    }

    .do-print-report,
    .do-print-report * {
      visibility: visible !important;
    }

    .do-print-report {
      display: block !important;
      position: absolute;
      inset: 0 auto auto 0;
      width: 100%;
      color: #111;
      background: #fff;
      font-family: Geist, -apple-system, system-ui, sans-serif;
    }

    .do-print-report header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
    }

    .do-print-report header span,
    .do-print-report h2,
    .do-print-report th,
    .do-print-report small {
      color: #555;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 10px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    .do-print-report h1 {
      margin: 10px 0 5px;
      font-size: 28px;
      line-height: 1.05;
    }

    .do-print-report p {
      margin: 0;
      color: #555;
      font-size: 14px;
    }

    .do-print-report header > div:last-child {
      display: grid;
      gap: 10px;
      justify-items: end;
    }

    .do-print-report header strong {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
    }

    .do-print-report header b {
      color: #16803A;
      font-size: 12px;
    }

    .do-rule {
      height: 2px;
      margin: 24px 0 24px;
      background: #111;
    }

    .do-facts,
    .do-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 28px;
    }

    .do-print-report h2 {
      margin: 28px 0 10px;
      color: #222;
      font-weight: 800;
    }

    .do-print-report table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .do-print-report th,
    .do-print-report td {
      border-top: 1px solid #E5E5E5;
      padding: 10px 0;
      text-align: left;
    }

    .do-print-report th:last-child,
    .do-print-report td:last-child {
      text-align: right;
    }

    .do-summary {
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .do-summary div {
      border: 1px solid #E5E5E5;
      border-radius: 4px;
      padding: 16px;
    }

    .do-summary strong {
      display: block;
      font-size: 24px;
      line-height: 1;
    }

    .do-summary span {
      display: block;
      margin-top: 6px;
      color: #555;
      font-size: 12px;
    }

    .do-signature {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      gap: 28px;
      border-top: 1px solid #E5E5E5;
      padding-top: 20px;
    }

    .do-signature img {
      width: 360px;
      max-height: 92px;
      object-fit: contain;
      object-position: left bottom;
      border-bottom: 1px solid #111;
      padding-bottom: 4px;
    }

    .do-signature > strong {
      width: 360px;
      border-bottom: 1px solid #111;
      padding-bottom: 8px;
      font-size: 20px;
    }

    .do-signature span {
      color: #777;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 10px;
      letter-spacing: .12em;
    }

    .do-print-report footer {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-top: 8px;
      font-size: 12px;
    }

    .do-print-report > small {
      display: flex;
      justify-content: space-between;
      margin-top: 34px;
      color: #777;
      text-transform: none;
    }
  }
`;

const styles: Record<string, CSSProperties> = {
  shell: { minHeight: '100vh', background: '#D7ECF4', color: '#0A0A0A', padding: 18, fontFamily: 'Geist, -apple-system, system-ui, sans-serif' },
  card: { width: '100%', maxWidth: 760, boxSizing: 'border-box', margin: '0 auto 10px', border: '1px solid #E3E3E3', borderRadius: 8, background: '#fff', padding: 16 },
  kicker: { color: '#9A9A9A', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11, letterSpacing: 1.2 },
  badge: { float: 'right', borderRadius: 999, background: '#E7F7EE', color: '#087443', padding: '4px 9px', fontFamily: 'Geist, sans-serif', fontSize: 12, letterSpacing: 0 },
  title: { margin: '8px 0 4px', fontSize: 21, lineHeight: 1.15 },
  muted: { margin: '3px 0 10px', color: '#666', fontSize: 13 },
  tabs: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: '100%', maxWidth: 760, boxSizing: 'border-box', margin: '0 auto 10px', border: '1px solid #E3E3E3', borderRadius: 6, background: '#fff', padding: 4 },
  tab: { height: 36, border: 0, borderRadius: 4, background: '#F7F7F7', fontWeight: 700 },
  activeTab: { height: 36, border: 0, borderRadius: 4, background: '#050505', color: '#fff', fontWeight: 800 },
  officerBlock: { marginTop: 10, border: '1px solid #E7E7E7', borderRadius: 6, background: '#FAFAFA', overflow: 'hidden' },
  officerToggle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', border: 0, background: '#FAFAFA', padding: 12, textAlign: 'left', fontSize: 15 },
  officerSummary: { display: 'block', marginTop: 4, color: '#666', fontSize: 13, fontWeight: 400 },
  officerBody: { padding: '0 16px 16px' },
  photoGroup: { marginTop: 10, padding: 12, border: '1px solid #E3E3E3', borderRadius: 6, background: '#fff' },
  thumbs: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  thumb: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 2 },
  primary: { width: '100%', minHeight: 40, border: 0, borderRadius: 4, background: '#050505', color: '#fff', fontSize: 14, fontWeight: 800 },
  secondary: { width: '100%', minHeight: 40, border: '1px solid #DADADA', borderRadius: 4, background: '#fff', fontSize: 14, fontWeight: 800 },
  sectionTitle: { margin: '4px 0 12px', fontSize: 22, lineHeight: 1.15 },
  subTitle: { margin: '16px 0 8px', fontSize: 16, lineHeight: 1.2 },
  reportGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 42, rowGap: 14, margin: '14px 0', paddingBottom: 16, borderBottom: '1px solid #E3E3E3' },
  infoItem: { display: 'grid', gap: 5, minWidth: 0 },
  infoLabel: { color: '#9A9A9A', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1.2 },
  infoValue: { color: '#0A0A0A', fontSize: 14, lineHeight: 1.2 },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  assigned: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, padding: '10px 12px', border: '1px solid #E3E3E3', borderRadius: 6, background: '#fff' },
  avatar: { display: 'grid', width: 30, height: 30, placeItems: 'center', flex: '0 0 30px', borderRadius: 999, background: '#F4F4F4', fontSize: 12 },
  assignedText: { display: 'grid', gap: 2, minWidth: 0 },
  signature: { position: 'relative', height: 150, border: '1px dashed #BDBDBD', borderRadius: 6, background: '#FAFAFA', overflow: 'hidden' },
  signatureCanvas: { width: '100%', height: '100%', touchAction: 'none' },
  signatureHint: { position: 'absolute', left: 14, bottom: 10, color: '#A3A3A3', fontSize: 12, pointerEvents: 'none' },
  penButton: { position: 'absolute', top: 10, right: 10, zIndex: 1, height: 30, border: '1px solid #DADADA', borderRadius: 4, background: '#FFFFFF', color: '#262626', padding: '0 12px', fontSize: 12, fontWeight: 800 },
  penButtonActive: { position: 'absolute', top: 10, right: 10, zIndex: 1, height: 30, border: '1px solid #050505', borderRadius: 4, background: '#050505', color: '#FFFFFF', padding: '0 12px', fontSize: 12, fontWeight: 800 },
  actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 },
  signedBox: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, padding: 12, border: '1px solid #E3E3E3', borderRadius: 6, background: '#FAFAFA', fontSize: 13 },
};
