'use client';

import { Check, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import styles from '../auth.module.css';
import { http } from '../../lib/api';
import { HttpError } from '@pilotnow/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim().includes('@') || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await http.post('/auth/login', { email: email.trim(), password, remember });
      router.replace('/');
      router.refresh();
    } catch (loginError) {
      const message = loginError instanceof HttpError && loginError.status === 401
        ? 'Email address or password is incorrect.'
        : 'Unable to sign in. Check that the API and database are running.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-heading">
        <h1 className={`${styles.brand} ${styles.loginBrand}`}>PilotNow</h1>
        <h2 id="login-heading" className={`${styles.title} ${styles.loginTitle}`}>
          Manage security jobs, officers, attendance proof, and<br /> reports with PilotNow.
        </h2>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">Email Address<span className={styles.required}>*</span></label>
            <div className={styles.inputWrap}>
              <input
                id="email"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type="email"
                placeholder="Enter your email address"
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

          <div className={styles.field}>
            <label htmlFor="password">Password <span className={styles.required}>*</span></label>
            <div className={styles.inputWrap}>
              <input
                id="password"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className={styles.iconButton}
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
              </button>
            </div>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.formMeta}>
            <label className={styles.remember}>
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span className={styles.checkbox} aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
              Remember Me
            </label>
            <Link className={styles.link} href="/forgot-password">Forgot Password</Link>
          </div>

          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}
