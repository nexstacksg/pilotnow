'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

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
          <h2>Duty Officer Report</h2>
          <p style={styles.mono}>DO-{report.id.replace(/\D/g, '').padStart(4, '0')}-001</p>
          <div style={styles.reportGrid}>
            <Info label="CLIENT" value={report.customer.name} />
            <Info label="SITE" value={report.site.address || report.site.name} />
            <Info label="DATE" value={new Date(report.startAt).toLocaleDateString()} />
            <Info label="SHIFT" value={`${time(report.startAt)} - ${time(report.endAt)}`} />
            <Info label="OFFICERS" value={`${report.assignments.length} deployed`} />
          </div>
          <h3>Assigned Officers</h3>
          {report.assignments.map((officer) => (
            <div style={styles.assigned} key={officer.officerId}>
              <b>{initials(officer.officerName)}</b>
              <span><strong>{officer.officerName}</strong><small>{officer.officerId} · {time(officer.checkInAt)} - {time(officer.checkOutAt)} · {(photosByOfficer.get(officer.officerId) ?? []).length} photos</small></span>
            </div>
          ))}
          <h3>Site Manager Signature</h3>
          <div style={styles.signature}>{signed ? 'Signed' : 'Sign Above'}</div>
          <div style={styles.actions}>
            <button onClick={() => setSigned(false)} style={styles.secondary} type="button">Clear</button>
            <button onClick={() => setSigned(true)} style={styles.primary} type="button">{signed ? 'Confirmed' : 'Confirm Signature'}</button>
          </div>
          <div style={styles.signedBox}>
            <span>Signed by</span><strong>Mr. James Lim</strong>
            <span>Role</span><strong>Site Manager</strong>
            <span>Date & Time</span><strong>{signed ? new Date().toLocaleString() : '-'}</strong>
          </div>
          <div style={styles.actions}>
            <button style={styles.secondary} type="button">Download PDF</button>
            <button disabled={!signed || sending || sent} onClick={sendToAdmin} style={styles.primary} type="button">
              {sent ? 'Sent to Admin' : sending ? 'Sending...' : 'Send to Admin'}
            </button>
          </div>
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
  return <div><span style={styles.kicker}>{label}</span><strong>{value}</strong></div>;
}

function time(value: string | null) {
  return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-';
}

function initials(value: string) {
  return value.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

const responsiveCss = `
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
`;

const styles: Record<string, CSSProperties> = {
  shell: { minHeight: '100vh', background: '#D7ECF4', color: '#0A0A0A', padding: 18, fontFamily: 'Geist, -apple-system, system-ui, sans-serif' },
  card: { width: '100%', maxWidth: 980, boxSizing: 'border-box', margin: '0 auto 14px', border: '1px solid #E3E3E3', borderRadius: 8, background: '#fff', padding: 18 },
  kicker: { color: '#9A9A9A', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, letterSpacing: 1.4 },
  badge: { float: 'right', borderRadius: 999, background: '#E7F7EE', color: '#087443', padding: '5px 10px', fontFamily: 'Geist, sans-serif', letterSpacing: 0 },
  title: { margin: '10px 0 6px', fontSize: 24 },
  muted: { margin: '4px 0 12px', color: '#666' },
  tabs: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%', maxWidth: 980, boxSizing: 'border-box', margin: '0 auto 14px', border: '1px solid #E3E3E3', borderRadius: 6, background: '#fff', padding: 4 },
  tab: { height: 44, border: 0, borderRadius: 4, background: '#F7F7F7', fontWeight: 700 },
  activeTab: { height: 44, border: 0, borderRadius: 4, background: '#050505', color: '#fff', fontWeight: 800 },
  officerBlock: { marginTop: 14, border: '1px solid #E7E7E7', borderRadius: 6, background: '#FAFAFA', overflow: 'hidden' },
  officerToggle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, width: '100%', border: 0, background: '#FAFAFA', padding: 16, textAlign: 'left', fontSize: 18 },
  officerSummary: { display: 'block', marginTop: 4, color: '#666', fontSize: 13, fontWeight: 400 },
  officerBody: { padding: '0 16px 16px' },
  photoGroup: { marginTop: 12, padding: 14, border: '1px solid #E3E3E3', borderRadius: 6, background: '#fff' },
  thumbs: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  thumb: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 2 },
  primary: { width: '100%', minHeight: 48, border: 0, borderRadius: 4, background: '#050505', color: '#fff', fontSize: 16, fontWeight: 800 },
  secondary: { width: '100%', minHeight: 48, border: '1px solid #DADADA', borderRadius: 4, background: '#fff', fontSize: 16, fontWeight: 800 },
  reportGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, margin: '20px 0', paddingBottom: 18, borderBottom: '1px solid #E3E3E3' },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  assigned: { display: 'flex', gap: 14, alignItems: 'center', marginBottom: 10, padding: 14, border: '1px solid #E3E3E3', borderRadius: 6 },
  signature: { display: 'grid', height: 220, placeItems: 'end center', border: '1px dashed #CFCFCF', borderRadius: 4, color: '#999', padding: 22 },
  actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 },
  signedBox: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20, padding: 16, border: '1px solid #E3E3E3', borderRadius: 6 },
};
