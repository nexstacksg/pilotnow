'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { BadgeCheck, Camera, LockKeyhole, UserRound } from 'lucide-react';

type ProfileDetails = {
  fullName: string;
  email: string;
  phone: string;
};

const initialProfile: ProfileDetails = {
  fullName: 'Serene Lau',
  email: 'serene.lau@pilotnow.sg',
  phone: '+65  8100  2233',
};

export function ProfileScreen() {
  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [message]);

  function updateField(field: keyof ProfileDetails, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedProfile(profile);
    setMessage('Profile changes saved');
  }

  function cancelProfile() {
    setProfile(savedProfile);
    setMessage('Unsaved changes discarded');
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setMessage('Profile photo selected');
  }

  function closePasswordForm() {
    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function updatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Complete all password fields');
      return;
    }
    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    closePasswordForm();
    setMessage('Password updated');
  }

  return (
    <>
      <div className="pn-profile-workspace">
        <form className="pn-profile-form" onSubmit={saveProfile}>
          <div className="pn-profile-scroll">
            <div className="pn-profile-layout">
          <aside className="pn-profile-identity-card">
            <div className="pn-profile-avatar-wrap">
              <span className="pn-profile-avatar">
                {avatarUrl ? <img alt="Serene Lau profile preview" src={avatarUrl} /> : 'SL'}
              </span>
              <span className="pn-profile-camera">
                <Camera aria-hidden="true" size={14} strokeWidth={2} />
              </span>
            </div>
            <label className="pn-profile-photo-button">
              Change Photo
              <input accept="image/*" onChange={selectPhoto} type="file" />
            </label>
            <strong>Serene Lau</strong>
            <span>Operations Admin</span>
            <div className="pn-profile-member">Member since Jan 2025</div>
          </aside>

          <div className="pn-profile-sections">
            <section className="pn-profile-panel">
              <header>
                <span><UserRound aria-hidden="true" size={16} strokeWidth={1.8} /></span>
                <h1>Profile Information</h1>
              </header>
              <div className="pn-profile-fields">
                <label>
                  Full Name
                  <input autoComplete="name" onChange={(event) => updateField('fullName', event.target.value)} value={profile.fullName} />
                </label>
                <label>
                  Email Address
                  <input autoComplete="email" onChange={(event) => updateField('email', event.target.value)} type="email" value={profile.email} />
                </label>
                <label>
                  Phone Number
                  <input autoComplete="tel" onChange={(event) => updateField('phone', event.target.value)} value={profile.phone} />
                </label>
                <label>
                  Company
                  <input disabled value="PilotNow Security Pte Ltd" />
                  <small>Company name is managed at the tenant level.</small>
                </label>
              </div>
            </section>

            <section className="pn-profile-panel pn-profile-security">
              <header>
                <span><LockKeyhole aria-hidden="true" size={16} strokeWidth={1.8} /></span>
                <h2>Security</h2>
              </header>
              <div className="pn-profile-password-summary">
                <span><LockKeyhole aria-hidden="true" size={15} strokeWidth={1.7} /></span>
                <span>
                  <strong>Password</strong>
                  <small>Last changed 1 month ago</small>
                </span>
                <button aria-expanded={passwordOpen} onClick={() => setPasswordOpen((open) => !open)} type="button">Change</button>
              </div>

              {passwordOpen ? (
                <div className="pn-profile-password-box">
                  <label>
                    Current Password
                    <input autoComplete="current-password" onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Enter current password" type="password" value={currentPassword} />
                  </label>
                  <label>
                    New Password
                    <input autoComplete="new-password" minLength={8} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 8 characters" type="password" value={newPassword} />
                  </label>
                  <label>
                    Confirm New Password
                    <input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter new password" type="password" value={confirmPassword} />
                  </label>
                  <div className="pn-profile-password-actions">
                    <button onClick={closePasswordForm} type="button">Cancel</button>
                    <button className="is-primary" onClick={updatePassword} type="button">Update Password</button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
            </div>
          </div>

          <footer className="pn-profile-actions">
            <button onClick={cancelProfile} type="button">Cancel</button>
            <button className="is-primary" type="submit">Save Changes</button>
          </footer>
        </form>
      </div>

      {message ? (
        <div aria-live="polite" className="pn-profile-toast" role="status">
          <BadgeCheck aria-hidden="true" size={16} strokeWidth={2} />
          {message}
        </div>
      ) : null}
    </>
  );
}
