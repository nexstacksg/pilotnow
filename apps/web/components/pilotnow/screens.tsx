'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Banknote, Camera, CalendarDays, CircleDot, CreditCard, FileBarChart, Plus } from 'lucide-react';
import { jobs, officers, payments, requests, statusRank, TODAY } from '@/lib/pilotnow/data';
import { dLabel, hrs, money } from '@/lib/pilotnow/format';
import { getStats } from '@/lib/pilotnow/stats';
import type { Job, JobStatus } from '@/lib/pilotnow/types';
import { Kpi, Section, StatusPill, Table } from './ui';

export function Dashboard() {
  const stats = getStats();
  const todayJobs = jobs.filter((job) => job.date === TODAY && job.status !== 'Cancelled');
  const missing = jobs.flatMap((job) =>
    job.status === 'Ongoing' ? job.photos.filter((photo) => photo.status === 'missing').map((photo) => ({ job, photo })) : [],
  );
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
              {missing.map(({ job, photo }) => (
                <Link href={`/jobs/${job.id}`} key={`${job.id}-${photo.time}`}>
                  <span><strong>{job.customer}</strong><small>{job.id} - expected {photo.time}</small></span>
                  <StatusPill status="Cancelled" />
                </Link>
              ))}
            </div>
          </Section>
          <Section title="Completed - not billed" count={notBilled.length}>
            <div className="pn-feed">
              {notBilled.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id}>
                  <span><strong>{job.customer}</strong><small>{job.id} - {dLabel(job.date)}</small></span>
                  <em>Bill now</em>
                </Link>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function JobCompactRow({ job }: { job: Job }) {
  return (
    <tr onClick={() => { location.href = `/jobs/${job.id}`; }}>
      <td className="mono"><strong>{job.id}</strong><small>{job.start}-{job.end}</small></td>
      <td><strong>{job.location}</strong><small>{job.customer}</small></td>
      <td><span className={`pn-count ${job.officers.length >= job.required ? 'ok' : 'warn'}`}>{job.officers.length}/{job.required}</span></td>
      <td><StatusPill status={job.status} /></td>
    </tr>
  );
}

export function JobsScreen() {
  const [filter, setFilter] = useState<JobStatus | 'All'>('All');
  const filtered = jobs
    .filter((job) => filter === 'All' || job.status === filter)
    .sort((a, b) => statusRank[a.status] - statusRank[b.status]);
  const filters: Array<JobStatus | 'All'> = ['All', 'Draft', 'Waiting for Officers', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];

  return (
    <div className="pn-content">
      <div className="pn-filter-row">
        {filters.map((item) => (
          <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
            {item} - {item === 'All' ? jobs.length : jobs.filter((job) => job.status === item).length}
          </button>
        ))}
      </div>
      <Section title="Jobs register">
        <Table headers={['Job ID', 'Customer / Location', 'Date & Time', 'Officers', 'Billing', 'Status']}>
          {filtered.map((job) => (
            <tr key={job.id} onClick={() => { location.href = `/jobs/${job.id}`; }}>
              <td className="mono"><strong>{job.id}</strong></td>
              <td><strong>{job.customer}</strong><small>{job.location}</small></td>
              <td><strong>{dLabel(job.date)}</strong><small>{job.start}-{job.end}</small></td>
              <td><span className={`pn-count ${job.officers.length >= job.required ? 'ok' : 'warn'}`}>{job.officers.length}/{job.required}</span></td>
              <td><StatusPill status={job.billing} /></td>
              <td><StatusPill status={job.status} /></td>
            </tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

export function RequestsScreen() {
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
              <td><StatusPill status={request.status} /></td>
            </tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

export function JobDetail({ jobId }: { jobId?: string }) {
  const job = jobs.find((item) => item.id === jobId) ?? jobs[0]!;
  const scheduled = hrs(job.start, job.end);
  const totalPay = job.officers.reduce((sum, officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hrs(officer.actualStart, officer.actualEnd) : scheduled;
    return sum + worked * officer.rate;
  }, 0);

  return (
    <div className="pn-content">
      <Link className="pn-back" href="/jobs">Back to jobs</Link>
      <div className="pn-detail-head">
        <div>
          <span>{job.id} - {job.customer}</span>
          <h1>{job.location}</h1>
          <p>{dLabel(job.date)} - {job.start}-{job.end} - {scheduled}h scheduled</p>
        </div>
        <StatusPill status={job.status} />
      </div>
      <div className="pn-detail-grid">
        <Section title="Participating officers">
          <Table headers={['Officer', 'IC', 'Rate', 'Duty', 'Actual', 'Pay']}>
            {job.officers.map((officer) => {
              const worked = officer.actualStart && officer.actualEnd ? hrs(officer.actualStart, officer.actualEnd) : officer.onDuty ? scheduled : 0;
              return (
                <tr key={officer.oid}>
                  <td><strong>{officer.name}</strong><small>{officer.oid}</small></td>
                  <td><StatusPill status={officer.ic === 'Yes' ? 'Active' : 'Blocked'} /></td>
                  <td>{money(officer.rate)}/h</td>
                  <td>{officer.onDuty ? 'On duty' : officer.confirmed ? 'Confirmed' : 'Waiting'}</td>
                  <td>{officer.actualStart || '-'} - {officer.actualEnd || '-'}</td>
                  <td>{money(worked * officer.rate)}</td>
                </tr>
              );
            })}
          </Table>
        </Section>
        <Section title="Hourly photo proof" count={job.photos.length}>
          <div className="pn-photo-grid">
            {job.photos.map((photo) => (
              <div key={photo.time} className={`pn-photo ${photo.status}`}>
                <Camera size={18} />
                <strong>{photo.time}</strong>
                <span>{photo.status === 'received' ? `by ${photo.by} - ${photo.at}` : photo.status === 'missing' ? 'No photo received' : 'Not due yet'}</span>
              </div>
            ))}
          </div>
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
          <div className="pn-summary">
            <StatusPill status={job.billing} />
            <p>{job.invoice || 'No invoice assigned yet.'}</p>
          </div>
        </Section>
      </div>
    </div>
  );
}

export function ShiftScreen() {
  const ongoing = jobs.filter((job) => job.status === 'Ongoing');

  return (
    <div className="pn-content">
      <div className="pn-kpis">
        <Kpi label="Received" value={ongoing.flatMap((job) => job.photos.filter((photo) => photo.status === 'received')).length} hint="photo checkpoints" />
        <Kpi label="Missing" value={ongoing.flatMap((job) => job.photos.filter((photo) => photo.status === 'missing')).length} hint="needs follow-up" danger icon={Camera} />
        <Kpi label="Upcoming" value={ongoing.flatMap((job) => job.photos.filter((photo) => photo.status === 'upcoming')).length} hint="not due yet" />
      </div>
      {ongoing.map((job) => (
        <Section key={job.id} title={`${job.id} - ${job.location}`} action={<Link href={`/jobs/${job.id}`}>Open job</Link>}>
          <div className="pn-photo-grid">
            {job.photos.map((photo) => <div key={photo.time} className={`pn-photo ${photo.status}`}><strong>{photo.time}</strong><span>{photo.status}</span></div>)}
          </div>
        </Section>
      ))}
    </div>
  );
}

export function OfficersScreen() {
  return (
    <div className="pn-content">
      <Section title="Officer Management">
        <Table headers={['Officer', 'WhatsApp', 'IC', 'Rate', 'Jobs', 'Status']}>
          {officers.map((officer) => (
            <tr key={officer.id}>
              <td><strong>{officer.name}</strong><small>{officer.id}</small></td>
              <td>{officer.phone}</td>
              <td>{officer.ic ? 'Yes' : 'No'}</td>
              <td>{money(officer.rate)}/h</td>
              <td>{officer.jobsCount}</td>
              <td><StatusPill status={officer.status} /></td>
            </tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

export function SummaryScreen() {
  const completed = jobs.filter((job) => job.status === 'Completed');

  return (
    <div className="pn-content">
      <Section title="Completed Job Summary">
        <Table headers={['Job', 'Customer / Location', 'Date', 'Officers', 'Photos', 'Total payable', 'Billing']}>
          {completed.map((job) => {
            const total = job.officers.reduce((sum, officer) => sum + hrs(officer.actualStart || job.start, officer.actualEnd || job.end) * officer.rate, 0);
            return (
              <tr key={job.id} onClick={() => { location.href = `/jobs/${job.id}`; }}>
                <td className="mono"><strong>{job.id}</strong></td>
                <td><strong>{job.customer}</strong><small>{job.location}</small></td>
                <td>{dLabel(job.date)}</td>
                <td>{job.officers.length}</td>
                <td>{job.photos.filter((photo) => photo.status === 'received').length}/{job.photos.length}</td>
                <td>{money(total)}</td>
                <td><StatusPill status={job.billing} /></td>
              </tr>
            );
          })}
        </Table>
      </Section>
    </div>
  );
}

export function PaymentsScreen() {
  const pending = payments.filter((payment) => payment.status === 'Pending').reduce((sum, payment) => sum + payment.hours * payment.rate, 0);
  const paid = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.hours * payment.rate, 0);

  return (
    <div className="pn-content">
      <div className="pn-kpis">
        <Kpi label="Pending" value={money(pending)} hint="awaiting payout" warning icon={Banknote} />
        <Kpi label="Paid" value={money(paid)} hint="settled" />
      </div>
      <Section title="Officer Payment">
        <Table headers={['Officer', 'Job', 'Date', 'Hours', 'Rate', 'Total', 'Status']}>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td><strong>{payment.officer}</strong></td>
              <td className="mono">{payment.jobId}</td>
              <td>{dLabel(payment.jobDate)}</td>
              <td>{payment.hours.toFixed(2)}h</td>
              <td>{money(payment.rate)}/h</td>
              <td>{money(payment.hours * payment.rate)}</td>
              <td><StatusPill status={payment.status} /></td>
            </tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

export function BillingScreen() {
  const completed = jobs.filter((job) => job.status === 'Completed');

  return (
    <div className="pn-content">
      <Section title="Customer Billing">
        <Table headers={['Job', 'Customer', 'Date', 'Invoice', 'Billed date', 'Status']}>
          {completed.map((job) => (
            <tr key={job.id}>
              <td className="mono">{job.id}</td>
              <td><strong>{job.customer}</strong></td>
              <td>{dLabel(job.date)}</td>
              <td>{job.invoice || '-'}</td>
              <td>{job.billedDate ? dLabel(job.billedDate) : '-'}</td>
              <td><StatusPill status={job.billing} /></td>
            </tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

export function ReportsScreen() {
  const completed = jobs.filter((job) => job.status === 'Completed');
  const total = completed.reduce((sum, job) =>
    sum + job.officers.reduce((subtotal, officer) => subtotal + hrs(officer.actualStart || job.start, officer.actualEnd || job.end) * officer.rate, 0),
  0);

  return (
    <div className="pn-content">
      <div className="pn-kpis">
        <Kpi label="Completed jobs" value={completed.length} hint="reportable jobs" icon={FileBarChart} />
        <Kpi label="Total payable" value={money(total)} hint="across completed jobs" icon={Banknote} />
        <Kpi label="Missing photos" value={getStats().missingPhotos} hint="exceptions" danger icon={Camera} />
      </div>
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
