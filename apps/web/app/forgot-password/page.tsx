'use client';

import { Check, CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import styles from '../auth.module.css';

type ResetStep = 'email' | 'code' | 'password' | 'success';

const INITIAL_SECONDS = 59;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(INITIAL_SECONDS);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step !== 'code' || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [step, seconds]);

  function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setSeconds(INITIAL_SECONDS);
    setStep('code');
  }

  function updateCode(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    setCode((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 3) codeRefs.current[index + 1]?.focus();
  }

  function handleCodeKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !code[index] && index > 0) codeRefs.current[index - 1]?.focus();
  }

  function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.join('').length !== 4) {
      setError('Enter the complete 4-digit code.');
      return;
    }
    setError('');
    setStep('password');
  }

  function resetCode() {
    setCode(['', '', '', '']);
    setSeconds(INITIAL_SECONDS);
    setError('');
    window.setTimeout(() => codeRefs.current[0]?.focus(), 0);
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setStep('success');
  }

  return (
    <main className={styles.page}>
      {step === 'email' && (
        <section className={styles.panel} aria-labelledby="forgot-heading">
          <h1 className={styles.brand}>PilotNow</h1>
          <h2 id="forgot-heading" className={styles.title}>Forgot your password?</h2>
          <p className={styles.subtitle}>Enter your email address and you will receive a verification code.</p>
          <form className={styles.form} onSubmit={requestCode} noValidate>
            <div className={styles.field}>
              <label htmlFor="reset-email">Email Address</label>
              <div className={styles.inputWrap}>
                <input
                  id="reset-email"
                  className={`${styles.input} ${error ? styles.inputError : ''}`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
                {email.includes('@') && (
                  <span className={styles.inputIcon} aria-hidden="true"><Check size={18} strokeWidth={1.8} /></span>
                )}
              </div>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={styles.button} type="submit">Get Reset Code</button>
          </form>
          <p className={styles.backLink}>Go back to&nbsp; <Link className={styles.link} href="/login">Login page</Link></p>
        </section>
      )}

      {step === 'code' && (
        <section className={`${styles.panel} ${styles.codePanel}`} aria-labelledby="code-heading">
          <h1 className={styles.brand}>PilotNow</h1>
          <h2 id="code-heading" className={styles.title}>Enter Authentication Code</h2>
          <p className={`${styles.subtitle} ${styles.leftSubtitle}`}>Please enter the 4-digit verification code that we have sent via the<br /> email.</p>
          <form className={styles.codeForm} onSubmit={verifyCode} noValidate>
            <div className={styles.codeFields}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { codeRefs.current[index] = element; }}
                  className={styles.codeInput}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateCode(index, event.target.value)}
                  onKeyDown={(event) => handleCodeKeyDown(index, event)}
                  aria-label={`Verification code digit ${index + 1}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <p className={styles.timer}>code expire in : <span>00:{String(seconds).padStart(2, '0')}</span></p>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={styles.button} type="submit">Continue</button>
          </form>
          <p className={styles.resend}>Didn&apos;t get the code? <button className={styles.link} type="button" onClick={resetCode}>Resend Code</button></p>
        </section>
      )}

      {(step === 'password' || step === 'success') && (
        <section className={`${styles.panel} ${styles.resetPanel}`} aria-labelledby="password-heading">
          <h1 className={styles.brand}>PilotNow</h1>
          <h2 id="password-heading" className={styles.title}>Create New Password</h2>
          <p className={`${styles.subtitle} ${styles.leftSubtitle}`}>Enter new a new password . It must be min. 8 characters with a<br /> combinations of letters &amp; numbers</p>
          <form className={styles.form} onSubmit={submitPassword} noValidate>
            <div className={styles.field}>
              <label htmlFor="new-password">Enter new password</label>
              <input
                id="new-password"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={styles.button} type="submit">Submit</button>
          </form>
          <p className={styles.backLink}>Go back to&nbsp; <Link className={styles.link} href="/login">Login page</Link></p>
        </section>
      )}

      {step === 'success' && (
        <div className={styles.successBackdrop} role="dialog" aria-modal="true" aria-labelledby="success-heading">
          <div className={styles.successModal}>
            <CircleCheck className={styles.successIcon} size={112} strokeWidth={1.8} aria-hidden="true" />
            <h2 id="success-heading">Password Reset Complete</h2>
            <p>Password reset successful.<br />Back to sign in with your updated password.</p>
            <Link className={`${styles.button} ${styles.modalButton}`} href="/login">Back to Login</Link>
          </div>
        </div>
      )}
    </main>
  );
}
