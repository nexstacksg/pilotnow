'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Bell, Plus, Search, ShieldCheck } from 'lucide-react';
import { nav, routeMeta } from '@/lib/pilotnow/data';
import { getStats } from '@/lib/pilotnow/stats';
import type { RouteKey } from '@/lib/pilotnow/types';

export function PilotNowShell({ active, children }: { active: RouteKey; children: ReactNode }) {
  const [createOpen, setCreateOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="pn-app">
      <Sidebar active={active} />
      <main className="pn-main">
        <Header active={active} onCreate={() => setCreateOpen(true)} />
        {children}
      </main>
      {createOpen && (
        <CreateJobModal
          onClose={() => {
            setCreateOpen(false);
            if (pathname === '/') router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Sidebar({ active }: { active: RouteKey }) {
  const stats = getStats();
  const counts: Partial<Record<RouteKey, number>> = {
    requests: stats.newRequests,
    shift: stats.missingPhotos,
    payments: stats.pendingPayments,
    billing: stats.notBilled,
  };
  const activeKey = active === 'jobDetail' ? 'jobs' : active;

  return (
    <aside className="pn-sidebar">
      <div className="pn-brand">
        <div className="pn-mark"><ShieldCheck size={19} strokeWidth={2.2} /></div>
        <div>
          <div className="pn-brand-name">PilotNow</div>
          <div className="pn-brand-sub">SECURITY OPS</div>
        </div>
      </div>
      <nav className="pn-nav">
        {nav.map((group) => (
          <div key={group.section}>
            <div className="pn-nav-section">{group.section}</div>
            {group.items.map((item) => (
              <Link key={item.key} href={item.href} className={`pn-nav-item ${activeKey === item.key ? 'active' : ''}`}>
                <item.icon size={17} strokeWidth={1.9} />
                <span>{item.label}</span>
                {counts[item.key] ? <b>{counts[item.key]}</b> : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="pn-user">
        <div className="pn-avatar">SL</div>
        <div>
          <strong>Serene Lau</strong>
          <span>Operations Admin</span>
        </div>
      </div>
    </aside>
  );
}

function Header({ active, onCreate }: { active: RouteKey; onCreate: () => void }) {
  const meta = routeMeta[active];

  return (
    <header className="pn-topbar">
      <div className="pn-title">
        <span>{meta.crumb}</span>
        <strong>{active === 'jobDetail' ? 'Job detail' : meta.title}</strong>
      </div>
      <div className="pn-search">
        <Search size={16} />
        <input placeholder="Search jobs, officers..." />
      </div>
      <button className="pn-icon" aria-label="Notifications"><Bell size={16} /></button>
      <button className="pn-primary" onClick={onCreate}><Plus size={16} />Create Job</button>
    </header>
  );
}

function CreateJobModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="pn-modal-backdrop">
      <div className="pn-modal">
        <div className="pn-modal-head">
          <h2>Create Job</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="pn-form-grid">
          <label>Customer<input defaultValue="Great World City" /></label>
          <label>Location<input defaultValue="Great World City - Main Atrium" /></label>
          <label>Date<input type="date" defaultValue="2026-07-12" /></label>
          <label>Start<input type="time" defaultValue="09:00" /></label>
          <label>End<input type="time" defaultValue="18:00" /></label>
          <label>Officers<select defaultValue="2"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
          <label className="wide">Description<textarea defaultValue="Mall event weekend security and access control." /></label>
        </div>
        <div className="pn-modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="pn-primary" onClick={onClose}>Save draft</button>
        </div>
      </div>
    </div>
  );
}
