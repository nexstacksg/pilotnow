'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './components/ui';
import { ChevronDownIcon, PlusIcon, SearchIcon, ShieldCheckIcon } from './components/icons';
import { AddOfficerModal, BillingModal, CreateJobModal, JobReportModal, OfficerProfileModal, PaymentHistoryModal } from './components/modals';
import { emptyJobForm, emptyOfficerForm, navGroups, navIcons, screenTitles } from './config';
import { jobsSeed, officersSeed, paymentsSeed } from './data';
import { TODAY, nextId } from './lib/format';
import { routeForScreen } from './routes';
import { BillingScreen } from './screens/BillingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { JobDetailScreen } from './screens/JobDetailScreen';
import { JobsScreen } from './screens/JobsScreen';
import { OfficersScreen } from './screens/OfficersScreen';
import { PaymentsScreen } from './screens/PaymentsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import type { BillForm, Job, JobForm, JobOfficer, JobStatus, Officer, OfficerForm, Payment, Screen } from './types';

export function AdminApp({ initialScreen = 'dashboard', initialJobId = 'PN-2041' }: { initialScreen?: Screen; initialJobId?: string }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [jobs, setJobs] = useState<Job[]>(jobsSeed);
  const [officers, setOfficers] = useState<Officer[]>(officersSeed);
  const [payments, setPayments] = useState<Payment[]>(paymentsSeed);
  const [jobId, setJobId] = useState(initialJobId);
  const [jobFilter, setJobFilter] = useState<JobStatus | 'All'>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [officerOpen, setOfficerOpen] = useState(false);
  const [officerProfileId, setOfficerProfileId] = useState<string | null>(null);
  const [billId, setBillId] = useState<string | null>(null);
  const [payOfficer, setPayOfficer] = useState<string | null>(null);
  const [reportJobId, setReportJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<JobForm>(emptyJobForm);
  const [officerForm, setOfficerForm] = useState<OfficerForm>(emptyOfficerForm);
  const [billForm, setBillForm] = useState<BillForm>({ invoice: '', billedDate: TODAY });
  const [toast, setToast] = useState('');

  const fallbackJob = jobsSeed[0] as Job;
  const selectedJob: Job = jobs.find((job) => job.id === jobId) ?? jobs[0] ?? fallbackJob;
  const completedJobs = jobs.filter((job) => job.status === 'Completed');
  const billTarget = billId ? jobs.find((job) => job.id === billId) : null;

  useEffect(() => {
    setScreen(initialScreen);
    if (initialJobId) setJobId(initialJobId);
  }, [initialJobId, initialScreen]);

  const stats = useMemo(() => {
    const pendingPayments = payments.filter((payment) => payment.status === 'Pending').length;
    return {
      todayJobs: jobs.filter((job) => job.date === TODAY && job.status !== 'Cancelled').length,
      waitingJobs: jobs.filter((job) => job.status === 'Waiting for Officers' || job.status === 'Posted to WhatsApp').length,
      ongoingJobs: jobs.filter((job) => job.status === 'Ongoing').length,
      missingPhotos: jobs.flatMap((job) => job.photos).filter((photo) => photo.status === 'missing').length,
      officersNeeded: jobs.reduce((sum, job) => sum + Math.max(0, job.required - job.officers.length), 0),
      pendingPayments,
      notBilled: completedJobs.filter((job) => job.billing === 'Not Billed').length,
    };
  }, [completedJobs, jobs, payments]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  }

  function copyText(text: string, message: string) {
    void navigator.clipboard?.writeText(text);
    flash(message || 'Copied to clipboard');
  }

  function navigateToScreen(nextScreen: Screen) {
    setScreen(nextScreen);
    router.push(routeForScreen(nextScreen, selectedJob.id));
  }

  function openJob(id: string) {
    setJobId(id);
    setScreen('jobDetail');
    router.push(routeForScreen('jobDetail', id));
  }

  function updateJob(id: string, updater: (job: Job) => Job) {
    setJobs((items) => items.map((job) => (job.id === id ? updater(job) : job)));
  }

  function saveJob() {
    if (!jobForm.customer.trim() || !jobForm.location.trim()) {
      flash('Enter a customer and location first');
      return;
    }
    const id = nextId('PN-', jobs.map((job) => job.id));
    const job: Job = {
      id,
      customer: jobForm.customer.trim(),
      location: jobForm.location.trim(),
      date: jobForm.date,
      start: jobForm.start,
      end: jobForm.end,
      required: Number(jobForm.required) || 1,
      status: 'Draft',
      posted: false,
      description: jobForm.description.trim() || 'No description provided.',
      instructions: jobForm.instructions.trim(),
      cancelReason: '',
      officers: [],
      photos: [],
      billing: 'Not Billed',
      invoice: '',
      billedDate: '',
    };
    setJobs((items) => [job, ...items]);
    setCreateOpen(false);
    setJobForm(emptyJobForm);
    openJob(id);
    flash(`Job ${id} created as Draft`);
  }

  function addOfficerToJob(oid: string) {
    const officer = officers.find((item) => item.id === oid);
    if (!officer || officer.status === 'Blocked') return;
    if (selectedJob.officers.some((item) => item.oid === oid)) {
      flash('Officer already added to this job');
      return;
    }
    const jobOfficer: JobOfficer = {
      oid: officer.id,
      name: officer.name,
      ic: officer.ic,
      rate: officer.rate,
      confirmed: false,
      onDuty: false,
      actualStart: '',
      actualEnd: '',
    };
    updateJob(selectedJob.id, (job) => ({ ...job, officers: [...job.officers, jobOfficer] }));
    flash(`${officer.name} added`);
  }

  function toggleOfficer(jobIdValue: string, oid: string, field: 'confirmed' | 'onDuty') {
    updateJob(jobIdValue, (job) => ({
      ...job,
      officers: job.officers.map((officer) =>
        officer.oid === oid
          ? { ...officer, [field]: !officer[field], actualStart: field === 'onDuty' && !officer.onDuty && !officer.actualStart ? job.start : officer.actualStart }
          : officer,
      ),
    }));
  }

  function cancelJob(id: string) {
    updateJob(id, (job) => ({
      ...job,
      status: 'Cancelled',
      cancelReason: job.cancelReason || 'Cancelled by admin',
    }));
    flash('Job cancelled');
  }

  function completeJob(id: string) {
    updateJob(id, (job) => ({
      ...job,
      status: 'Completed',
      officers: job.officers.map((officer) => ({ ...officer, actualStart: officer.actualStart || job.start, actualEnd: officer.actualEnd || job.end })),
    }));
    flash('Job marked as completed');
  }

  function removeOfficerFromJob(oid: string) {
    updateJob(selectedJob.id, (job) => ({
      ...job,
      officers: job.officers.filter((officer) => officer.oid !== oid),
    }));
    flash('Officer removed from job');
  }

  function markPhoto(jobIdValue: string, index: number, status: 'received' | 'missing') {
    updateJob(jobIdValue, (job) => ({
      ...job,
      photos: job.photos.map((photo, photoIndex) =>
        photoIndex === index ? { ...photo, status, by: status === 'received' ? job.officers[0]?.name ?? 'Admin' : '', at: status === 'received' ? photo.time : '' } : photo,
      ),
    }));
    flash(status === 'received' ? 'Photo marked received' : 'Photo marked missing');
  }

  function saveOfficer() {
    if (!officerForm.name.trim() || officerForm.phone.replace(/[^0-9]/g, '').length < 6) {
      flash('Enter a name and valid WhatsApp number');
      return;
    }
    const officer: Officer = {
      id: nextId('OF-', officers.map((item) => item.id), 2),
      name: officerForm.name.trim(),
      phone: officerForm.phone.trim(),
      status: officerForm.status,
      ic: officerForm.ic,
      rate: Number(officerForm.rate) || 14,
      jobsCount: 0,
      notes: officerForm.notes.trim(),
    };
    setOfficers((items) => [officer, ...items]);
    setOfficerOpen(false);
    setOfficerForm(emptyOfficerForm);
    flash(`Officer ${officer.name} added`);
  }

  function markPaid(id: string) {
    setPayments((items) => items.map((payment) => (payment.id === id ? { ...payment, status: 'Paid', paidDate: TODAY } : payment)));
    flash('Payment marked as paid');
  }

  function confirmBill() {
    if (!billTarget || !billForm.invoice.trim() || !billForm.billedDate) {
      flash('Enter invoice number and billed date');
      return;
    }
    updateJob(billTarget.id, (job) => ({ ...job, billing: 'Billed', invoice: billForm.invoice.trim(), billedDate: billForm.billedDate }));
    setBillId(null);
    setBillForm({ invoice: '', billedDate: TODAY });
    flash(`Job ${billTarget.id} marked as billed`);
  }

  const [crumb, title] = screenTitles[screen];
  const pageTitle = screen === 'jobDetail' ? selectedJob.id : title;

  return (
    <div className="pn-app">
      <aside className="pn-sidebar">
        <div className="pn-brand">
          <div className="pn-logo">
            <ShieldCheckIcon size={19} stroke="#FF7A1A" strokeWidth={2.2} />
          </div>
          <div>
            <strong>PilotNow</strong>
            <span>Security Ops</span>
          </div>
        </div>
        <nav>
          {navGroups.map((group) => (
            <div key={group.label} className="pn-nav-group">
              <p>{group.label}</p>
              {group.items.map((item) => (
                <button className={screen === item.screen ? 'active' : ''} key={item.screen} onClick={() => navigateToScreen(item.screen)} type="button">
                  {navIcons[item.screen]}
                  <span>{item.label}</span>
                  {item.screen === 'payments' && stats.pendingPayments ? <b>{stats.pendingPayments}</b> : null}
                  {item.screen === 'billing' && stats.notBilled ? <b>{stats.notBilled}</b> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="pn-user">
          <div>SL</div>
          <span>
            <strong>Serene Lau</strong>
            Operations Admin
          </span>
          <ChevronDownIcon size={15} stroke="#A3A3A3" strokeWidth={2} />
        </div>
      </aside>

      <main className="pn-main">
        <header className="pn-topbar">
          <div>
            <p>{crumb}</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="pn-search">
            <SearchIcon size={16} stroke="#A3A3A3" strokeWidth={2} />
            <input aria-label="Search" placeholder="Search jobs, officers..." />
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setJobForm(emptyJobForm);
              setCreateOpen(true);
            }}
          >
            <PlusIcon size={16} strokeWidth={2.2} />
            Create Job
          </Button>
        </header>

        <div className="pn-content">
          {screen === 'dashboard' ? (
            <DashboardScreen
              jobs={jobs}
              stats={stats}
              openCreateJob={() => {
                setJobForm(emptyJobForm);
                setCreateOpen(true);
              }}
              openJob={openJob}
              setScreen={navigateToScreen}
            />
          ) : null}
          {screen === 'jobs' ? <JobsScreen filter={jobFilter} jobs={jobs} openJob={openJob} setFilter={setJobFilter} /> : null}
          {screen === 'jobDetail' ? (
            <JobDetailScreen
              job={selectedJob}
              officers={officers}
              addOfficer={addOfficerToJob}
              completeJob={completeJob}
              cancelJob={cancelJob}
              copyText={copyText}
              markPhoto={markPhoto}
              onEdit={() => flash('Edit mode (demo)')}
              openReport={() => setReportJobId(selectedJob.id)}
              removeOfficer={removeOfficerFromJob}
              setScreen={navigateToScreen}
              toggleOfficer={toggleOfficer}
            />
          ) : null}
          {screen === 'officers' ? <OfficersScreen officers={officers} openOfficer={() => setOfficerOpen(true)} openOfficerProfile={setOfficerProfileId} /> : null}
          {screen === 'summary' ? <SummaryScreen jobs={completedJobs} /> : null}
          {screen === 'payments' ? <PaymentsScreen markPaid={markPaid} payments={payments} setPayOfficer={setPayOfficer} /> : null}
          {screen === 'billing' ? (
            <BillingScreen
              jobs={completedJobs}
              openBill={(id) => {
                setBillId(id);
                setBillForm({ invoice: '', billedDate: TODAY });
              }}
            />
          ) : null}
          {screen === 'reports' ? <ReportsScreen jobs={jobs} officers={officers} payments={payments} /> : null}
        </div>
      </main>

      {createOpen ? <CreateJobModal form={jobForm} setForm={setJobForm} onClose={() => setCreateOpen(false)} onSave={saveJob} /> : null}
      {officerOpen ? <AddOfficerModal form={officerForm} setForm={setOfficerForm} onClose={() => setOfficerOpen(false)} onSave={saveOfficer} /> : null}
      {billTarget ? <BillingModal job={billTarget} form={billForm} setForm={setBillForm} onClose={() => setBillId(null)} onConfirm={confirmBill} /> : null}
      {reportJobId ? <JobReportModal copyText={copyText} job={jobs.find((job) => job.id === reportJobId) ?? selectedJob} onClose={() => setReportJobId(null)} /> : null}
      {officerProfileId ? (
        <OfficerProfileModal
          jobs={jobs}
          officer={officers.find((officer) => officer.id === officerProfileId)}
          onClose={() => setOfficerProfileId(null)}
          openJob={(id) => {
            setOfficerProfileId(null);
            openJob(id);
          }}
        />
      ) : null}
      {payOfficer ? <PaymentHistoryModal officer={payOfficer} payments={payments} onClose={() => setPayOfficer(null)} openJob={openJob} /> : null}
      {toast ? <div className="pn-toast">{toast}</div> : null}
    </div>
  );
}
