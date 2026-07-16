'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { http } from '../../../lib/api';
import { Button, Modal } from './ui';

type AdminUser = { id: string; email: string; name: string; role: string; avatarUrl: string | null };

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export function AdminAccountMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  useEffect(() => {
    let active = true;
    const updateProfile = (event: Event) => {
      const profile = (event as CustomEvent<AdminUser>).detail;
      if (profile?.id) setUser(profile);
    };
    window.addEventListener('pilotnow:profile-updated', updateProfile);
    http.get<{ user: AdminUser }>('/auth/me')
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) router.replace('/login');
      });
    return () => {
      active = false;
      window.removeEventListener('pilotnow:profile-updated', updateProfile);
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await http.post('/auth/logout');
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  const accountLoaded = user !== null;
  const displayName = user?.name ?? '';
  const displayInitials = user ? initials(displayName) : '';
  const avatar = user?.avatarUrl;

  return (
    <div className="pn-profile-account" ref={menuRef}>
      {open ? (
        <div aria-label="Account menu" className="pn-profile-account-menu" role="menu">
          <div className="pn-profile-account-summary">
            <span className="pn-profile-mini-avatar">{avatar ? <img alt="" src={avatar} /> : displayInitials}</span>
            <span>
              <strong className={!accountLoaded ? 'pn-profile-account-loading is-name' : undefined}>{accountLoaded ? displayName : 'Loading account'}</strong>
              <small className={!accountLoaded ? 'pn-profile-account-loading is-detail' : undefined}>{user?.email ?? 'Loading account details'}</small>
            </span>
          </div>
          <a href="/profile" onClick={() => setOpen(false)} role="menuitem">
            <UserRound aria-hidden="true" size={14} strokeWidth={1.7} />
            View profile
          </a>
          <button className="is-danger" onClick={() => { setOpen(false); setLogoutConfirmOpen(true); }} role="menuitem" type="button">
            <LogOut aria-hidden="true" size={14} strokeWidth={1.7} />
            Log out
          </button>
        </div>
      ) : null}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-busy={!accountLoaded}
        className="pn-profile-account-trigger"
        disabled={!accountLoaded}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="pn-profile-trigger-avatar">{avatar ? <img alt="" src={avatar} /> : displayInitials}</span>
        <span>
          <strong className={!accountLoaded ? 'pn-profile-account-loading is-name' : undefined}>{accountLoaded ? displayName : 'Loading account'}</strong>
          <small className={!accountLoaded ? 'pn-profile-account-loading is-detail' : undefined}>{user?.role ?? 'Loading account details'}</small>
        </span>
        <ChevronDown aria-hidden="true" size={14} strokeWidth={1.6} />
      </button>
      {logoutConfirmOpen ? (
        <Modal
          title="Log out of PilotNow?"
          hideHeader
          onClose={() => setLogoutConfirmOpen(false)}
        >
          <div className="pn-logout-confirmation">
            <button aria-label="Close logout confirmation" className="pn-logout-confirm-close" disabled={loggingOut} onClick={() => setLogoutConfirmOpen(false)} type="button">
              <X aria-hidden="true" size={17} />
            </button>
            <span className="pn-logout-confirm-icon">
              <LogOut aria-hidden="true" size={22} strokeWidth={1.8} />
            </span>
            <div className="pn-logout-confirm-copy">
              <h2>Log out of PilotNow?</h2>
              <small>You’ll need to sign in again to access your account.</small>
            </div>
            <div className="pn-logout-confirm-actions">
              <Button disabled={loggingOut} onClick={() => setLogoutConfirmOpen(false)}>Cancel</Button>
              <Button disabled={loggingOut} onClick={() => void handleLogout()} variant="danger">
                <LogOut aria-hidden="true" size={15} strokeWidth={1.8} />
                {loggingOut ? 'Logging out...' : 'Log out'}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

