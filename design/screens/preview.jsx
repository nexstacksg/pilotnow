/* global React, Icon, cx */
// PilotNow — Preview screens. Embeds the standalone mobile + PDF artifacts
// inside the admin so they're discoverable, not just window.open'd.

const { useState: useStateP } = React;

function PhoneFrame({ src, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 24px' }}>
      <div style={{
        width: 380, height: 760,
        background: '#0A0A0A',
        borderRadius: 44,
        padding: 12,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
        position: 'relative',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 28, background: '#000', borderRadius: 16, zIndex: 2,
        }}></div>
        <iframe
          src={src}
          title={label}
          style={{
            width: '100%', height: '100%',
            border: 'none',
            borderRadius: 32,
            background: 'var(--bg-0)',
            display: 'block',
          }}
        />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label} · 380 × 760 PREVIEW
      </div>
    </div>
  );
}

function PaperFrame({ src, label }) {
  return (
    <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 794, minHeight: 1123,
        background: 'var(--bg-0)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)',
        position: 'relative',
      }}>
        <iframe
          src={src}
          title={label}
          style={{ width: '100%', height: 1123, border: 'none', display: 'block' }}
        />
        <div style={{ position: 'absolute', top: -22, left: 0, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label} · A4 · 210 × 297 MM
        </div>
      </div>
    </div>
  );
}

window.OfficerScreen = function OfficerScreen() {
  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">FIELD APP · MOBILE WEB · OFFICER</div>
          <h1>Officer mobile</h1>
          <div className="meta">Supervisor's on-site companion · check-in, hourly photo, late alerts, signature handoff</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost" onClick={() => window.open('officer.html', '_blank')}><Icon name="external-link" size={13} /> Open full</button>
          <button className="btn btn-secondary"><Icon name="qr-code" size={13} /> Send link to phone</button>
        </div>
      </div>
      <div className="tb">
        <span className="fchip"><span className="k">Persona</span> Tan Wei Ming · Senior Officer</span>
        <span className="fchip"><span className="k">Job</span> J-1814 · Tampines Mall</span>
        <span className="fchip"><span className="k">Policy</span> P-day-mall · 60-min photo</span>
        <span className="spacer"></span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LIVE PREVIEW · INTERACTIVE</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-1)' }}>
        <PhoneFrame src="officer.html" label="OFFICER.HTML" />
      </div>
    </>
  );
};

window.SignatureScreen = function SignatureScreen() {
  const [step, setStep] = useStateP('client');
  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">DO SIGNATURE · 2-STEP · MOBILE WEB</div>
          <h1>Signature page</h1>
          <div className="meta">Step 1: our site supervisor · Step 2: client site manager · Fresh-stroke anti-reuse enforced</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost" onClick={() => window.open('signature.html', '_blank')}><Icon name="external-link" size={13} /> Open full</button>
          <button className="btn btn-secondary"><Icon name="link" size={13} /> Copy signed link</button>
          <button className="btn btn-dark"><Icon name="send" size={13} /> Send to signer</button>
        </div>
      </div>
      <div className="tb">
        <div className="seg">
          <button className={cx(step === 'supervisor' && 'on')} onClick={() => setStep('supervisor')}>Step 1 · Site supervisor</button>
          <button className={cx(step === 'client' && 'on')} onClick={() => setStep('client')}>Step 2 · Client manager</button>
        </div>
        <span className="fchip"><span className="k">DO</span> J-1814-001</span>
        <span className="fchip"><span className="k">Token</span> ····7D14 · expires 23:59</span>
        <span className="spacer"></span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FRESH-STROKE CANVAS · INTERACTIVE</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-1)' }}>
        <PhoneFrame src="signature.html" label="SIGNATURE.HTML" />
      </div>
    </>
  );
};

window.DoReportScreen = function DoReportScreen() {
  return (
    <>
      <div className="ph">
        <div>
          <div className="eyebrow">DELIVERY ORDER · PDF · 1 DO PER JOB</div>
          <h1>DO report</h1>
          <div className="meta">Auto-assembled at checkout · 1:1 with job · sent to finance once both signatures complete</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost" onClick={() => window.open('do-report.html', '_blank')}><Icon name="external-link" size={13} /> Open full</button>
          <button className="btn btn-secondary"><Icon name="printer" size={13} /> Print / PDF</button>
          <button className="btn btn-dark"><Icon name="mail" size={13} /> Email finance</button>
        </div>
      </div>
      <div className="tb">
        <span className="fchip"><span className="k">DO</span> DO-J1814-001</span>
        <span className="fchip"><span className="k">Job</span> J-1814 · Tampines Mall</span>
        <span className="fchip active"><span className="k">Status</span> Signed · ready</span>
        <span className="spacer"></span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>A4 PRINT-READY · 1 PAGE</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-2)' }}>
        <PaperFrame src="do-report.html" label="DO-REPORT.HTML" />
      </div>
    </>
  );
};
