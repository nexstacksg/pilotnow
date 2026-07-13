'use client';

import Link from 'next/link';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function AdminAccountMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  return (
    <div className="pn-profile-account" ref={menuRef}>
      {open ? (
        <div aria-label="Account menu" className="pn-profile-account-menu" role="menu">
          <div className="pn-profile-account-summary">
            <span className="pn-profile-mini-avatar">SL</span>
            <span>
              <strong>Serene Lau</strong>
              <small>serene.lau@pilotnow.sg</small>
            </span>
          </div>
          <Link href="/profile" onClick={() => setOpen(false)} role="menuitem">
            <UserRound aria-hidden="true" size={14} strokeWidth={1.7} />
            View profile
          </Link>
          <Link className="is-danger" href="/login" onClick={() => setOpen(false)} role="menuitem">
            <LogOut aria-hidden="true" size={14} strokeWidth={1.7} />
            Log out
          </Link>
        </div>
      ) : null}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="pn-profile-account-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="pn-profile-trigger-avatar">SL</span>
        <span>
          <strong>Serene Lau</strong>
          <small>Operations Admin</small>
        </span>
        <ChevronDown aria-hidden="true" size={14} strokeWidth={1.6} />
      </button>
    </div>
  );
}

