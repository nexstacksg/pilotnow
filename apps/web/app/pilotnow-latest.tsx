'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  Banknote,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

type JobStatus = 'Draft' | 'Waiting for Officers' | 'Confirmed' | 'Ongoing' | 'Completed' | 'Cancelled';
type BillingStatus = 'Billed' | 'Not Billed';
type PaymentStatus = 'Paid' | 'Pending';

type Officer = {
  id: string;
  name: string;
  phone: string;
  status: 'New' | 'Active' | 'Inactive' | 'Blocked';
  ic: boolean;
  rate: number;
  jobsCount: number;
};

type JobOfficer = {
  oid: string;
  name: string;
  ic: 'Yes' | 'No';
  rate: number;
  confirmed: boolean;
  onDuty: boolean;
  actualStart: string;
  actualEnd: string;
};

type PhotoSlot = {
  time: string;
  status: 'received' | 'missing' | 'upcoming';
  by?: string;
  at?: string;
  note?: string;
};

type Job = {
  id: string;
  customer: string;
  location: string;
  date: string;
  start: string;
  end: string;
  required: number;
  status: JobStatus;
  posted: boolean;
  description: string;
  instructions: string;
  officers: JobOfficer[];
  photos: PhotoSlot[];
  billing: BillingStatus;
  invoice: string;
  billedDate: string;
};

type RequestRow = {
  id: string;
  customer: string;
  method: 'WhatsApp' | 'Email';
  reqDate: string;
  location: string;
  jobDate: string;
  start: string;
  end: string;
  officers: number;
  notes: string;
  status: 'New' | 'Converted' | 'Cancelled';
};

type Payment = {
  id: string;
  officer: string;
  jobId: string;
  jobDate: string;
  hours: number;
  rate: number;
  status: PaymentStatus;
  paidDate: string;
};

type RouteKey = 'dashboard' | 'requests' | 'jobs' | 'jobDetail' | 'shift' | 'officers' | 'summary' | 'payments' | 'billing' | 'reports';

const TODAY = '2026-07-09';

const officers: Officer[] = [
  { id: 'OF-01', name: 'Rajesh Kumar', phone: '+65 8123 4501', status: 'Active', ic: true, rate: 16, jobsCount: 22 },
  { id: 'OF-02', name: 'Muhammad Faizal', phone: '+65 9223 8812', status: 'Active', ic: true, rate: 15, jobsCount: 18 },
  { id: 'OF-03', name: 'Tan Wei Ming', phone: '+65 8773 6611', status: 'Active', ic: true, rate: 18, jobsCount: 31 },
  { id: 'OF-04', name: 'Nur Aisyah', phone: '+65 9088 1142', status: 'New', ic: false, rate: 16, jobsCount: 0 },
  { id: 'OF-05', name: 'Lim Jun Hao', phone: '+65 8511 4429', status: 'Active', ic: true, rate: 17, jobsCount: 26 },
  { id: 'OF-08', name: 'Deepak Raj', phone: '+65 8990 7720', status: 'Blocked', ic: true, rate: 19, jobsCount: 11 },
];

const jobs: Job[] = [
  {
    id: 'PN-2041',
    customer: 'Changi Airport Group',
    location: 'Jewel Changi - Canopy Park',
    date: TODAY,
    start: '08:00',
    end: '20:00',
    required: 6,
    status: 'Ongoing',
    posted: true,
    description: 'School holiday crowd control and access checks.',
    instructions: 'Hourly photo proof. Report to terminal ops desk.',
    officers: [
      { oid: 'OF-01', name: 'Rajesh Kumar', ic: 'Yes', rate: 16, confirmed: true, onDuty: true, actualStart: '08:00', actualEnd: '' },
      { oid: 'OF-02', name: 'Muhammad Faizal', ic: 'Yes', rate: 15, confirmed: true, onDuty: true, actualStart: '08:02', actualEnd: '' },
      { oid: 'OF-03', name: 'Tan Wei Ming', ic: 'Yes', rate: 18, confirmed: true, onDuty: true, actualStart: '08:01', actualEnd: '' },
      { oid: 'OF-05', name: 'Lim Jun Hao', ic: 'Yes', rate: 17, confirmed: true, onDuty: true, actualStart: '08:04', actualEnd: '' },
    ],
    photos: [
      { time: '09:00', status: 'received', by: 'Rajesh Kumar', at: '09:02' },
      { time: '10:00', status: 'received', by: 'Muhammad Faizal', at: '10:01' },
      { time: '11:00', status: 'missing', note: 'Reminder sent to WhatsApp group' },
      { time: '12:00', status: 'upcoming' },
    ],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
  },
  {
    id: 'PN-2042',
    customer: 'OCBC Centre',
    location: 'OCBC Centre - Lobby',
    date: TODAY,
    start: '09:00',
    end: '18:00',
    required: 3,
    status: 'Waiting for Officers',
    posted: true,
    description: 'Lobby access control for tenant event.',
    instructions: 'Corporate attire.',
    officers: [{ oid: 'OF-04', name: 'Nur Aisyah', ic: 'No', rate: 16, confirmed: false, onDuty: false, actualStart: '', actualEnd: '' }],
    photos: [],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
  },
  {
    id: 'PN-2043',
    customer: 'Sentinel Events Pte Ltd',
    location: 'MBS Convention Hall 601',
    date: '2026-07-10',
    start: '18:00',
    end: '23:00',
    required: 4,
    status: 'Confirmed',
    posted: true,
    description: 'Access control at trade-expo registration counters.',
    instructions: 'Report to Hall 601 concierge.',
    officers: [
      { oid: 'OF-01', name: 'Rajesh Kumar', ic: 'Yes', rate: 16, confirmed: true, onDuty: false, actualStart: '', actualEnd: '' },
      { oid: 'OF-03', name: 'Tan Wei Ming', ic: 'Yes', rate: 18, confirmed: true, onDuty: false, actualStart: '', actualEnd: '' },
      { oid: 'OF-05', name: 'Lim Jun Hao', ic: 'Yes', rate: 17, confirmed: true, onDuty: false, actualStart: '', actualEnd: '' },
      { oid: 'OF-08', name: 'Deepak Raj', ic: 'Yes', rate: 19, confirmed: true, onDuty: false, actualStart: '', actualEnd: '' },
    ],
    photos: [],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
  },
  {
    id: 'PN-2044',
    customer: 'VivoCity Mall Mgmt',
    location: 'VivoCity - Level 1 Main Entrance',
    date: '2026-07-07',
    start: '10:00',
    end: '22:00',
    required: 2,
    status: 'Completed',
    posted: true,
    description: 'Mall entrance bag-check and crowd flow.',
    instructions: 'Standard mall SOP.',
    officers: [
      { oid: 'OF-03', name: 'Tan Wei Ming', ic: 'Yes', rate: 18, confirmed: true, onDuty: true, actualStart: '10:00', actualEnd: '22:00' },
      { oid: 'OF-05', name: 'Lim Jun Hao', ic: 'Yes', rate: 17, confirmed: true, onDuty: true, actualStart: '10:05', actualEnd: '22:10' },
    ],
    photos: [
      { time: '11:00', status: 'received', by: 'Tan Wei Ming', at: '11:02' },
      { time: '12:00', status: 'received', by: 'Lim Jun Hao', at: '12:01' },
      { time: '13:00', status: 'received', by: 'Tan Wei Ming', at: '13:03' },
    ],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
  },
  {
    id: 'PN-2045',
    customer: 'Marina Bay Sands',
    location: 'MBS Tower 3 - Lobby',
    date: '2026-07-06',
    start: '20:00',
    end: '04:00',
    required: 3,
    status: 'Completed',
    posted: true,
    description: 'Overnight lobby and lift-lobby security.',
    instructions: 'Night shift. Handover log at concierge.',
    officers: [
      { oid: 'OF-01', name: 'Rajesh Kumar', ic: 'Yes', rate: 16, confirmed: true, onDuty: true, actualStart: '20:00', actualEnd: '04:00' },
      { oid: 'OF-02', name: 'Muhammad Faizal', ic: 'Yes', rate: 15, confirmed: true, onDuty: true, actualStart: '20:00', actualEnd: '04:05' },
      { oid: 'OF-08', name: 'Deepak Raj', ic: 'Yes', rate: 19, confirmed: true, onDuty: true, actualStart: '20:10', actualEnd: '04:00' },
    ],
    photos: [],
    billing: 'Billed',
    invoice: 'INV-2026-0455',
    billedDate: '2026-07-07',
  },
  {
    id: 'PN-2046',
    customer: 'Raffles City',
    location: 'Raffles City Shopping Centre',
    date: '2026-07-11',
    start: '12:00',
    end: '21:00',
    required: 2,
    status: 'Draft',
    posted: false,
    description: 'Weekend concourse patrol.',
    instructions: '',
    officers: [],
    photos: [],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
  },
];

const requests: RequestRow[] = [
  { id: 'RQ-118', customer: 'Sentinel Events Pte Ltd', method: 'WhatsApp', reqDate: '2026-07-06', location: 'Marina Bay Sands', jobDate: '2026-07-08', start: '18:00', end: '23:00', officers: 4, notes: 'Corporate gala, black tie', status: 'Converted' },
  { id: 'RQ-119', customer: 'Changi Airport Group', method: 'Email', reqDate: '2026-07-06', location: 'Jewel Changi', jobDate: '2026-07-08', start: '08:00', end: '20:00', officers: 6, notes: 'School holiday coverage', status: 'Converted' },
  { id: 'RQ-120', customer: 'OCBC Centre', method: 'WhatsApp', reqDate: '2026-07-07', location: 'OCBC Centre', jobDate: '2026-07-12', start: '09:00', end: '18:00', officers: 3, notes: 'Lobby access control', status: 'New' },
  { id: 'RQ-121', customer: 'Great World City', method: 'WhatsApp', reqDate: '2026-07-07', location: 'Great World City', jobDate: '2026-07-13', start: '10:00', end: '22:00', officers: 2, notes: 'Mall event weekend', status: 'New' },
];

const payments: Payment[] = [
  { id: 'PY-01', officer: 'Tan Wei Ming', jobId: 'PN-2044', jobDate: '2026-07-07', hours: 12, rate: 18, status: 'Pending', paidDate: '' },
  { id: 'PY-02', officer: 'Lim Jun Hao', jobId: 'PN-2044', jobDate: '2026-07-07', hours: 12.08, rate: 17, status: 'Pending', paidDate: '' },
  { id: 'PY-03', officer: 'Rajesh Kumar', jobId: 'PN-2045', jobDate: '2026-07-06', hours: 8, rate: 16, status: 'Paid', paidDate: '2026-07-07' },
  { id: 'PY-04', officer: 'Muhammad Faizal', jobId: 'PN-2045', jobDate: '2026-07-06', hours: 8.08, rate: 15, status: 'Paid', paidDate: '2026-07-07' },
  { id: 'PY-05', officer: 'Deepak Raj', jobId: 'PN-2045', jobDate: '2026-07-06', hours: 7.83, rate: 19, status: 'Paid', paidDate: '2026-07-07' },
];

const routeMeta: Record<RouteKey, { crumb: string; title: string }> = {
  dashboard: { crumb: 'Overview', title: 'Dashboard' },
  requests: { crumb: 'Operations', title: 'Job Requests' },
  jobs: { crumb: 'Operations', title: 'Jobs' },
  jobDetail: { crumb: 'Operations / Jobs', title: 'Job detail' },
  shift: { crumb: 'Operations', title: 'Shift Monitoring' },
  officers: { crumb: 'People', title: 'Officer Management' },
  summary: { crumb: 'Finance', title: 'Completed Job Summary' },
  payments: { crumb: 'Finance', title: 'Officer Payment' },
  billing: { crumb: 'Finance', title: 'Customer Billing' },
  reports: { crumb: 'Insights', title: 'Reports' },
};

const statusRank: Record<JobStatus, number> = {
  'Waiting for Officers': 0,
  Confirmed: 1,
  Ongoing: 2,
  Completed: 3,
  Draft: 4,
  Cancelled: 5,
};

const nav = [
  { section: 'OPERATIONS', items: [{ key: 'dashboard', href: '/', label: 'Dashboard', icon: LayoutDashboard }, { key: 'jobs', href: '/jobs', label: 'Jobs', icon: BriefcaseBusiness }, { key: 'shift', href: '/shift', label: 'Shift Monitoring', icon: CircleDot }, { key: 'requests', href: '/requests', label: 'Job Requests', icon: ClipboardCheck }] },
  { section: 'PEOPLE', items: [{ key: 'officers', href: '/officers', label: 'Officer Management', icon: Users }] },
  { section: 'FINANCE', items: [{ key: 'summary', href: '/finance/summary', label: 'Completed Job Summary', icon: Check }, { key: 'payments', href: '/finance/payments', label: 'Officer Payment', icon: CreditCard }, { key: 'billing', href: '/finance/billing', label: 'Customer Billing', icon: FileText }] },
  { section: 'INSIGHTS', items: [{ key: 'reports', href: '/reports', label: 'Reports', icon: FileBarChart }] },
] satisfies { section: string; items: { key: RouteKey; href: string; label: string; icon: LucideIcon }[] }[];

function money(n: number) {
  return `S$${n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dLabel(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return value.toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' });
}

function hrs(start: string, end: string) {
  const [h1 = 0, m1 = 0] = start.split(':').map(Number);
  const [h2 = 0, m2 = 0] = end.split(':').map(Number);
  let delta = h2 * 60 + m2 - (h1 * 60 + m1);
  if (delta < 0) delta += 1440;
  return Math.round((delta / 60) * 100) / 100;
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function statusPill(status: JobStatus | BillingStatus | PaymentStatus | RequestRow['status'] | Officer['status']) {
  const tone =
    status === 'Ongoing' || status === 'New' ? 'blue' :
    status === 'Completed' || status === 'Billed' || status === 'Paid' || status === 'Converted' || status === 'Active' ? 'green' :
    status === 'Waiting for Officers' || status === 'Pending' || status === 'Not Billed' ? 'amber' :
    status === 'Cancelled' || status === 'Blocked' ? 'red' : '';
  return <span className={`pn-pill ${tone}`}><span />{status}</span>;
}

function routeFromSlug(slug: string[]) {
  if (!slug.length) return { key: 'dashboard' as RouteKey };
  if (slug[0] === 'jobs' && slug[1]) return { key: 'jobDetail' as RouteKey, jobId: slug[1] };
  if (slug[0] === 'jobs') return { key: 'jobs' as RouteKey };
  if (slug[0] === 'requests') return { key: 'requests' as RouteKey };
  if (slug[0] === 'shift') return { key: 'shift' as RouteKey };
  if (slug[0] === 'officers') return { key: 'officers' as RouteKey };
  if (slug[0] === 'reports') return { key: 'reports' as RouteKey };
  if (slug[0] === 'finance' && slug[1] === 'payments') return { key: 'payments' as RouteKey };
  if (slug[0] === 'finance' && slug[1] === 'billing') return { key: 'billing' as RouteKey };
  if (slug[0] === 'finance') return { key: 'summary' as RouteKey };
  return { key: 'dashboard' as RouteKey };
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
        <div><div className="pn-brand-name">PilotNow</div><div className="pn-brand-sub">SECURITY OPS</div></div>
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
        <div><strong>Serene Lau</strong><span>Operations Admin</span></div>
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
      <div className="pn-search"><Search size={16} /><input placeholder="Search jobs, officers..." /></div>
      <button className="pn-icon" aria-label="Notifications"><Bell size={16} /></button>
      <button className="pn-primary" onClick={onCreate}><Plus size={16} />Create Job</button>
    </header>
  );
}

function getStats() {
  const missingPhotos = jobs.flatMap((job) => job.status === 'Ongoing' ? job.photos.filter((photo) => photo.status === 'missing') : []).length;
  const notBilled = jobs.filter((job) => job.status === 'Completed' && job.billing === 'Not Billed').length;
  return {
    todayJobs: jobs.filter((job) => job.date === TODAY).length,
    waitingJobs: jobs.filter((job) => job.status === 'Waiting for Officers').length,
    officersNeeded: jobs.filter((job) => job.status === 'Waiting for Officers').reduce((sum, job) => sum + Math.max(0, job.required - job.officers.length), 0),
    ongoingJobs: jobs.filter((job) => job.status === 'Ongoing').length,
    missingPhotos,
    notBilled,
    newRequests: requests.filter((request) => request.status === 'New').length,
    pendingPayments: payments.filter((payment) => payment.status === 'Pending').length,
  };
}

function Dashboard() {
  const stats = getStats();
  const todayJobs = jobs.filter((job) => job.date === TODAY && job.status !== 'Cancelled');
  const missing = jobs.flatMap((job) => job.status === 'Ongoing' ? job.photos.filter((photo) => photo.status === 'missing').map((photo) => ({ job, photo })) : []);
  const notBilled = jobs.filter((job) => job.status === 'Completed' && job.billing === 'Not Billed');
  return (
    <div className="pn-content">
      <div className="pn-kpis">
        <Kpi label="Today's jobs" value={stats.todayJobs} hint={`scheduled for ${dLabel(TODAY)}`} icon={CalendarDays} />
        <Kpi label="Waiting for officers" value={stats.waitingJobs} hint={`${stats.officersNeeded} officers still needed`} warning />
        <Kpi label="Ongoing jobs" value={stats.ongoingJobs} hint="officers on duty now" icon={CircleDot} />
        <Kpi label="Missing hourly photos" value={stats.missingPhotos} hint="needs follow-up" danger icon={Camera} />
      </div>
      <div className="pn-two-col">
        <Section title="Today's jobs" action={<Link href="/jobs">View all</Link>}>
          <Table headers={['Job', 'Location', 'Officers', 'Status']}>
            {todayJobs.map((job) => <JobCompactRow key={job.id} job={job} />)}
          </Table>
        </Section>
        <div className="pn-side-stack">
          <Section title="Quick actions">
            <div className="pn-actions">
              <Link href="/jobs" className="pn-action"><Plus size={18} />Create Job</Link>
              <Link href="/finance/payments" className="pn-action"><CreditCard size={18} />Run Payments</Link>
            </div>
          </Section>
          <Section title="Missing hourly photos" count={missing.length} danger>
            <div className="pn-feed">
              {missing.map(({ job, photo }) => <Link href={`/jobs/${job.id}`} key={`${job.id}-${photo.time}`}><span><strong>{job.customer}</strong><small>{job.id} - expected {photo.time}</small></span>{statusPill('Cancelled')}</Link>)}
            </div>
          </Section>
          <Section title="Completed - not billed" count={notBilled.length}>
            <div className="pn-feed">
              {notBilled.map((job) => <Link href={`/jobs/${job.id}`} key={job.id}><span><strong>{job.customer}</strong><small>{job.id} - {dLabel(job.date)}</small></span><em>Bill now</em></Link>)}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, icon: Icon = CalendarDays, danger, warning }: { label: string; value: number | string; hint: string; icon?: LucideIcon; danger?: boolean; warning?: boolean }) {
  return (
    <div className="pn-kpi">
      <div><span>{label}</span><i className={danger ? 'danger' : warning ? 'warning' : ''}><Icon size={16} /></i></div>
      <strong>{value}</strong>
      <small className={danger ? 'danger' : warning ? 'warning' : ''}>{hint}</small>
    </div>
  );
}

function Section({ title, children, action, count, danger }: { title: string; children: ReactNode; action?: ReactNode; count?: number; danger?: boolean }) {
  return (
    <section className="pn-section">
      <div className="pn-section-head">
        {danger && <span className="pn-dot danger" />}
        <h2>{title}</h2>
        {typeof count === 'number' && <small>{count}</small>}
        <div className="pn-section-action">{action}</div>
      </div>
      {children}
    </section>
  );
}

function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <table className="pn-table">
      <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function JobCompactRow({ job }: { job: Job }) {
  return (
    <tr onClick={() => { location.href = `/jobs/${job.id}`; }}>
      <td className="mono"><strong>{job.id}</strong><small>{job.start}-{job.end}</small></td>
      <td><strong>{job.location}</strong><small>{job.customer}</small></td>
      <td><span className={`pn-count ${job.officers.length >= job.required ? 'ok' : 'warn'}`}>{job.officers.length}/{job.required}</span></td>
      <td>{statusPill(job.status)}</td>
    </tr>
  );
}

function JobsScreen() {
  const [filter, setFilter] = useState<JobStatus | 'All'>('All');
  const filtered = jobs
    .filter((job) => filter === 'All' || job.status === filter)
    .sort((a, b) => statusRank[a.status] - statusRank[b.status]);
  const filters: Array<JobStatus | 'All'> = ['All', 'Draft', 'Waiting for Officers', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];
  return (
    <div className="pn-content">
      <div className="pn-filter-row">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item} - {item === 'All' ? jobs.length : jobs.filter((job) => job.status === item).length}</button>)}</div>
      <Section title="Jobs register">
        <Table headers={['Job ID', 'Customer / Location', 'Date & Time', 'Officers', 'Billing', 'Status']}>
          {filtered.map((job) => (
            <tr key={job.id} onClick={() => { location.href = `/jobs/${job.id}`; }}>
              <td className="mono"><strong>{job.id}</strong></td>
              <td><strong>{job.customer}</strong><small>{job.location}</small></td>
              <td><strong>{dLabel(job.date)}</strong><small>{job.start}-{job.end}</small></td>
              <td><span className={`pn-count ${job.officers.length >= job.required ? 'ok' : 'warn'}`}>{job.officers.length}/{job.required}</span></td>
              <td>{statusPill(job.billing)}</td>
              <td>{statusPill(job.status)}</td>
            </tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

function RequestsScreen() {
  return (
    <div className="pn-content">
      <Section title="Job requests">
        <Table headers={['Request', 'Customer / Location', 'Requested', 'Job window', 'Officers', 'Status']}>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="mono"><strong>{request.id}</strong><small>{request.method}</small></td>
              <td><strong>{request.customer}</strong><small>{request.location}</small></td>
              <td>{dLabel(request.reqDate)}</td>
              <td><strong>{dLabel(request.jobDate)}</strong><small>{request.start}-{request.end}</small></td>
              <td>{request.officers}</td>
              <td>{statusPill(request.status)}</td>
            </tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

function JobDetail({ jobId }: { jobId?: string }) {
  const job = jobs.find((item) => item.id === jobId) ?? jobs[0]!;
  const scheduled = hrs(job.start, job.end);
  const totalPay = job.officers.reduce((sum, officer) => sum + (officer.actualStart && officer.actualEnd ? hrs(officer.actualStart, officer.actualEnd) : scheduled) * officer.rate, 0);
  return (
    <div className="pn-content">
      <Link className="pn-back" href="/jobs">Back to jobs</Link>
      <div className="pn-detail-head">
        <div><span>{job.id} - {job.customer}</span><h1>{job.location}</h1><p>{dLabel(job.date)} - {job.start}-{job.end} - {scheduled}h scheduled</p></div>
        {statusPill(job.status)}
      </div>
      <div className="pn-detail-grid">
        <Section title="Participating officers">
          <Table headers={['Officer', 'IC', 'Rate', 'Duty', 'Actual', 'Pay']}>
            {job.officers.map((officer) => {
              const worked = officer.actualStart && officer.actualEnd ? hrs(officer.actualStart, officer.actualEnd) : officer.onDuty ? scheduled : 0;
              return <tr key={officer.oid}><td><strong>{officer.name}</strong><small>{officer.oid}</small></td><td>{officer.ic === 'Yes' ? statusPill('Active') : statusPill('Blocked')}</td><td>{money(officer.rate)}/h</td><td>{officer.onDuty ? 'On duty' : officer.confirmed ? 'Confirmed' : 'Waiting'}</td><td>{officer.actualStart || '-'} - {officer.actualEnd || '-'}</td><td>{money(worked * officer.rate)}</td></tr>;
            })}
          </Table>
        </Section>
        <Section title="Hourly photo proof" count={job.photos.length}>
          <div className="pn-photo-grid">{job.photos.map((photo) => <div key={photo.time} className={`pn-photo ${photo.status}`}><Camera size={18} /><strong>{photo.time}</strong><span>{photo.status === 'received' ? `by ${photo.by} - ${photo.at}` : photo.status === 'missing' ? 'No photo received' : 'Not due yet'}</span></div>)}</div>
        </Section>
      </div>
      <div className="pn-detail-grid">
        <Section title="Job summary">
          <div className="pn-summary">
            <p>{job.description}</p>
            <p>{job.instructions || 'No special instructions.'}</p>
            <strong>Total payable: {money(totalPay)}</strong>
          </div>
        </Section>
        <Section title="Billing">
          <div className="pn-summary">{statusPill(job.billing)}<p>{job.invoice || 'No invoice assigned yet.'}</p></div>
        </Section>
      </div>
    </div>
  );
}

function ShiftScreen() {
  const ongoing = jobs.filter((job) => job.status === 'Ongoing');
  return (
    <div className="pn-content">
      <div className="pn-kpis">
        <Kpi label="Received" value={ongoing.flatMap((job) => job.photos.filter((photo) => photo.status === 'received')).length} hint="photo checkpoints" />
        <Kpi label="Missing" value={ongoing.flatMap((job) => job.photos.filter((photo) => photo.status === 'missing')).length} hint="needs follow-up" danger icon={Camera} />
        <Kpi label="Upcoming" value={ongoing.flatMap((job) => job.photos.filter((photo) => photo.status === 'upcoming')).length} hint="not due yet" />
      </div>
      {ongoing.map((job) => <Section key={job.id} title={`${job.id} - ${job.location}`} action={<Link href={`/jobs/${job.id}`}>Open job</Link>}><div className="pn-photo-grid">{job.photos.map((photo) => <div key={photo.time} className={`pn-photo ${photo.status}`}><strong>{photo.time}</strong><span>{photo.status}</span></div>)}</div></Section>)}
    </div>
  );
}

function OfficersScreen() {
  return (
    <div className="pn-content">
      <Section title="Officer Management">
        <Table headers={['Officer', 'WhatsApp', 'IC', 'Rate', 'Jobs', 'Status']}>
          {officers.map((officer) => <tr key={officer.id}><td><strong>{officer.name}</strong><small>{officer.id}</small></td><td>{officer.phone}</td><td>{officer.ic ? 'Yes' : 'No'}</td><td>{money(officer.rate)}/h</td><td>{officer.jobsCount}</td><td>{statusPill(officer.status)}</td></tr>)}
        </Table>
      </Section>
    </div>
  );
}

function SummaryScreen() {
  const completed = jobs.filter((job) => job.status === 'Completed');
  return (
    <div className="pn-content">
      <Section title="Completed Job Summary">
        <Table headers={['Job', 'Customer / Location', 'Date', 'Officers', 'Photos', 'Total payable', 'Billing']}>
          {completed.map((job) => {
            const total = job.officers.reduce((sum, officer) => sum + hrs(officer.actualStart || job.start, officer.actualEnd || job.end) * officer.rate, 0);
            return <tr key={job.id} onClick={() => { location.href = `/jobs/${job.id}`; }}><td className="mono"><strong>{job.id}</strong></td><td><strong>{job.customer}</strong><small>{job.location}</small></td><td>{dLabel(job.date)}</td><td>{job.officers.length}</td><td>{job.photos.filter((photo) => photo.status === 'received').length}/{job.photos.length}</td><td>{money(total)}</td><td>{statusPill(job.billing)}</td></tr>;
          })}
        </Table>
      </Section>
    </div>
  );
}

function PaymentsScreen() {
  const pending = payments.filter((payment) => payment.status === 'Pending').reduce((sum, payment) => sum + payment.hours * payment.rate, 0);
  const paid = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.hours * payment.rate, 0);
  return (
    <div className="pn-content">
      <div className="pn-kpis"><Kpi label="Pending" value={money(pending)} hint="awaiting payout" warning icon={Banknote} /><Kpi label="Paid" value={money(paid)} hint="settled" /></div>
      <Section title="Officer Payment">
        <Table headers={['Officer', 'Job', 'Date', 'Hours', 'Rate', 'Total', 'Status']}>
          {payments.map((payment) => <tr key={payment.id}><td><strong>{payment.officer}</strong></td><td className="mono">{payment.jobId}</td><td>{dLabel(payment.jobDate)}</td><td>{payment.hours.toFixed(2)}h</td><td>{money(payment.rate)}/h</td><td>{money(payment.hours * payment.rate)}</td><td>{statusPill(payment.status)}</td></tr>)}
        </Table>
      </Section>
    </div>
  );
}

function BillingScreen() {
  const completed = jobs.filter((job) => job.status === 'Completed');
  return (
    <div className="pn-content">
      <Section title="Customer Billing">
        <Table headers={['Job', 'Customer', 'Date', 'Invoice', 'Billed date', 'Status']}>
          {completed.map((job) => <tr key={job.id}><td className="mono">{job.id}</td><td><strong>{job.customer}</strong></td><td>{dLabel(job.date)}</td><td>{job.invoice || '-'}</td><td>{job.billedDate ? dLabel(job.billedDate) : '-'}</td><td>{statusPill(job.billing)}</td></tr>)}
        </Table>
      </Section>
    </div>
  );
}

function ReportsScreen() {
  const completed = jobs.filter((job) => job.status === 'Completed');
  const total = completed.reduce((sum, job) => sum + job.officers.reduce((subtotal, officer) => subtotal + hrs(officer.actualStart || job.start, officer.actualEnd || job.end) * officer.rate, 0), 0);
  return (
    <div className="pn-content">
      <div className="pn-kpis"><Kpi label="Completed jobs" value={completed.length} hint="reportable jobs" icon={FileBarChart} /><Kpi label="Total payable" value={money(total)} hint="across completed jobs" icon={Banknote} /><Kpi label="Missing photos" value={getStats().missingPhotos} hint="exceptions" danger icon={Camera} /></div>
      <Section title="Completed job report">
        <Table headers={['Job', 'Customer', 'Date', 'Officers', 'Total payable']}>
          {completed.map((job) => {
            const pay = job.officers.reduce((sum, officer) => sum + hrs(officer.actualStart || job.start, officer.actualEnd || job.end) * officer.rate, 0);
            return <tr key={job.id}><td className="mono">{job.id}</td><td>{job.customer}</td><td>{dLabel(job.date)}</td><td>{job.officers.length}</td><td>{money(pay)}</td></tr>;
          })}
        </Table>
      </Section>
    </div>
  );
}

function CreateJobModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="pn-modal-backdrop">
      <div className="pn-modal">
        <div className="pn-modal-head"><h2>Create Job</h2><button onClick={onClose}>Close</button></div>
        <div className="pn-form-grid">
          <label>Customer<input defaultValue="Great World City" /></label>
          <label>Location<input defaultValue="Great World City - Main Atrium" /></label>
          <label>Date<input type="date" defaultValue="2026-07-12" /></label>
          <label>Start<input type="time" defaultValue="09:00" /></label>
          <label>End<input type="time" defaultValue="18:00" /></label>
          <label>Officers<select defaultValue="2"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
          <label className="wide">Description<textarea defaultValue="Mall event weekend security and access control." /></label>
        </div>
        <div className="pn-modal-actions"><button onClick={onClose}>Cancel</button><button className="pn-primary" onClick={onClose}>Save draft</button></div>
      </div>
    </div>
  );
}

export function PilotNowLatest({ slug }: { slug: string[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const route = routeFromSlug(slug);
  const active = route.key;
  return (
    <div className="pn-app">
      <Sidebar active={active} />
      <main className="pn-main">
        <Header active={active} onCreate={() => setCreateOpen(true)} />
        {active === 'dashboard' && <Dashboard />}
        {active === 'requests' && <RequestsScreen />}
        {active === 'jobs' && <JobsScreen />}
        {active === 'jobDetail' && <JobDetail jobId={route.jobId} />}
        {active === 'shift' && <ShiftScreen />}
        {active === 'officers' && <OfficersScreen />}
        {active === 'summary' && <SummaryScreen />}
        {active === 'payments' && <PaymentsScreen />}
        {active === 'billing' && <BillingScreen />}
        {active === 'reports' && <ReportsScreen />}
      </main>
      {createOpen && <CreateJobModal onClose={() => { setCreateOpen(false); if (pathname === '/') router.refresh(); }} />}
    </div>
  );
}
