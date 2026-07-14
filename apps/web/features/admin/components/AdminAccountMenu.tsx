'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { http } from '../../../lib/api';

type AdminUser = { id: string; email: string; name: string; role: string };

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export function AdminAccountMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [user, setUser] = useState<AdminUser | null>(null);
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
    http.get<{ user: AdminUser }>('/auth/me')
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) router.replace('/login');
      });
    return () => { active = false; };
  }, [router]);

  async function handleLogout() {
    try {
      await http.post('/auth/logout');
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  const displayName = user?.name ?? 'PilotNow Admin';
  const displayInitials = initials(displayName);

  return (
    <div className="pn-profile-account" ref={menuRef}>
      {open ? (
        <div aria-label="Account menu" className="pn-profile-account-menu" role="menu">
          <div className="pn-profile-account-summary">
            <span className="pn-profile-mini-avatar">{displayInitials}</span>
            <span>
              <strong>{displayName}</strong>
              <small>{user?.email ?? ''}</small>
            </span>
          </div>
          <Link href="/profile" onClick={() => setOpen(false)} role="menuitem">
            <UserRound aria-hidden="true" size={14} strokeWidth={1.7} />
            View profile
          </Link>
          <button className="is-danger" onClick={handleLogout} role="menuitem" type="button">
            <LogOut aria-hidden="true" size={14} strokeWidth={1.7} />
            Log out
          </button>
        </div>
      ) : null}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="pn-profile-account-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="pn-profile-trigger-avatar">{displayInitials}</span>
        <span>
          <strong>{displayName}</strong>
          <small>{user?.role ?? 'Operations Admin'}</small>
        </span>
        <ChevronDown aria-hidden="true" size={14} strokeWidth={1.6} />
      </button>
    </div>
  );
}

