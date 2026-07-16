'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { BadgeCheck, Camera, LockKeyhole, UserRound } from 'lucide-react';
import { changePassword, fetchProfile, profileErrorMessage, saveProfile } from '../lib/profile-api';
import type { AdminProfile } from '../lib/profile-api';

type ProfileDetails = Pick<AdminProfile, 'name' | 'email' | 'phone' | 'company' | 'avatarUrl'>;
const emptyProfile: ProfileDetails = { name: '', email: '', phone: null, company: '', avatarUrl: null };

export function ProfileScreen() {
  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [account, setAccount] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void fetchProfile()
      .then(({ profile: loaded }) => {
        if (!active) return;
        const details = { name: loaded.name, email: loaded.email, phone: loaded.phone, company: loaded.company, avatarUrl: loaded.avatarUrl };
        setAccount(loaded);
        setProfile(details);
        setSavedProfile(details);
      })
      .catch((error) => active && setMessage(profileErrorMessage(error, 'Could not load profile')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  function updateField(field: 'name' | 'email' | 'phone' | 'company', value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const { profile: updated } = await saveProfile(profile);
      const details = { name: updated.name, email: updated.email, phone: updated.phone, company: updated.company, avatarUrl: updated.avatarUrl };
      setAccount(updated);
      setProfile(details);
      setSavedProfile(details);
      window.dispatchEvent(new CustomEvent('pilotnow:profile-updated', { detail: updated }));
      setMessage('Profile changes saved');
    } catch (error) {
      setMessage(profileErrorMessage(error, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1_000_000) {
      setMessage('Choose a PNG, JPEG, or WebP image under 1 MB');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const avatarUrl = String(reader.result);
      setProfile((current) => ({ ...current, avatarUrl }));
      setSaving(true);
      try {
        const { profile: updated } = await saveProfile({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          company: profile.company,
          avatarUrl,
        });
        const details = { name: updated.name, email: updated.email, phone: updated.phone, company: updated.company, avatarUrl: updated.avatarUrl };
        setAccount(updated);
        setProfile(details);
        setSavedProfile(details);
        window.dispatchEvent(new CustomEvent('pilotnow:profile-updated', { detail: updated }));
        setMessage('Profile photo updated');
      } catch (error) {
        setProfile((current) => ({ ...current, avatarUrl: savedProfile.avatarUrl }));
        setMessage(profileErrorMessage(error, 'Could not update profile photo'));
      } finally {
        setSaving(false);
        input.value = '';
      }
    };
    reader.onerror = () => {
      input.value = '';
      setMessage('Could not read that profile photo');
    };
    reader.readAsDataURL(file);
  }

  function closePasswordForm() {
    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  async function updatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) return setMessage('Complete all password fields');
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) return setMessage('Use at least 8 characters with a letter and number');
    if (newPassword !== confirmPassword) return setMessage('New passwords do not match');
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      closePasswordForm();
      setAccount((current) => current ? { ...current, passwordChangedAt: new Date().toISOString() } : current);
      setMessage('Password updated');
    } catch (error) {
      setMessage(profileErrorMessage(error, 'Could not update password'));
    } finally {
      setSaving(false);
    }
  }

  const initials = profile.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '--';
  const memberSince = account ? new Intl.DateTimeFormat('en-SG', { month: 'short', year: 'numeric' }).format(new Date(account.createdAt)) : '...';
  const passwordChanged = account?.passwordChangedAt ? new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium' }).format(new Date(account.passwordChangedAt)) : 'Not changed yet';

  return (
    <>
      <div className="pn-profile-workspace">
        <form className="pn-profile-form" onSubmit={submitProfile}>
          <div className="pn-profile-scroll"><div className="pn-profile-layout">
            <aside className="pn-profile-identity-card">
              <div className="pn-profile-avatar-wrap"><span className="pn-profile-avatar">{profile.avatarUrl ? <img alt={`${profile.name} profile`} src={profile.avatarUrl} /> : initials}</span><span className="pn-profile-camera"><Camera aria-hidden="true" size={14} /></span></div>
              <label className="pn-profile-photo-button">Change Photo<input accept="image/png,image/jpeg,image/webp" disabled={loading || saving} onChange={selectPhoto} type="file" /></label>
              <strong>{profile.name || 'Loading profile...'}</strong><span>{account?.role || 'Operations Admin'}</span><div className="pn-profile-member">Member since {memberSince}</div>
            </aside>
            <div className="pn-profile-sections">
              <section className="pn-profile-panel"><header><span><UserRound aria-hidden="true" size={16} /></span><h1>Profile Information</h1></header>
                <div className="pn-profile-fields">
                  <label>Full Name<input autoComplete="name" disabled={loading || saving} onChange={(event) => updateField('name', event.target.value)} required value={profile.name} /></label>
                  <label>Email Address<input autoComplete="email" disabled={loading || saving} onChange={(event) => updateField('email', event.target.value)} required type="email" value={profile.email} /><small>Email is your login identifier.</small></label>
                  <label>Phone Number<input autoComplete="tel" disabled={loading || saving} onChange={(event) => updateField('phone', event.target.value)} placeholder="e.g. +65 9123 4567" value={profile.phone ?? ''} /></label>
                  <label>Company<input autoComplete="organization" disabled={loading || saving} onChange={(event) => updateField('company', event.target.value)} required value={profile.company} /></label>
                </div>
              </section>
              <section className="pn-profile-panel pn-profile-security"><header><span><LockKeyhole aria-hidden="true" size={16} /></span><h2>Security</h2></header>
                <div className="pn-profile-password-summary"><span><LockKeyhole aria-hidden="true" size={15} /></span><span><strong>Password</strong><small>{passwordChanged}</small></span><button aria-expanded={passwordOpen} disabled={loading || saving} onClick={() => setPasswordOpen((open) => !open)} type="button">Change</button></div>
                {passwordOpen ? <div className="pn-profile-password-box">
                  <label>Current Password<input autoComplete="current-password" onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Enter your current password" type="password" value={currentPassword} /></label>
                  <label>New Password<input autoComplete="new-password" onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 8 characters with a letter and number" type="password" value={newPassword} /></label>
                  <label>Confirm New Password<input autoComplete="new-password" onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your new password" type="password" value={confirmPassword} /></label>
                  <div className="pn-profile-password-actions"><button disabled={saving} onClick={closePasswordForm} type="button">Cancel</button><button className="is-primary" disabled={saving} onClick={() => void updatePassword()} type="button">{saving ? 'Updating...' : 'Update Password'}</button></div>
                </div> : null}
              </section>
            </div>
          </div></div>
          <footer className="pn-profile-actions"><button disabled={loading || saving} onClick={() => { setProfile(savedProfile); setMessage('Unsaved changes discarded'); }} type="button">Cancel</button><button className="is-primary" disabled={loading || saving} type="submit">{saving ? 'Saving...' : 'Save Changes'}</button></footer>
        </form>
      </div>
      {message ? <div aria-live="polite" className="pn-profile-toast" role="status"><BadgeCheck aria-hidden="true" size={16} />{message}</div> : null}
    </>
  );
}
