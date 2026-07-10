'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BillingIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  DashboardIcon,
  JobsIcon,
  MessageIcon,
  OfficersIcon,
  PaymentIcon,
  PlusIcon,
  PrinterIcon,
  ReportsIcon,
  SearchIcon,
  ShieldCheckIcon,
  SummaryIcon,
} from './components/icons';
import { Badge, Button, Field, Modal } from './components/ui';
import { screenTitles } from './config';
import { jobsSeed, officersSeed, paymentsSeed } from './data';
import { fetchBillingJobs, markJobBilled } from './lib/billing-api';
import { cancelJobInApi, completeJobInApi, createJobFromForm, fetchJobs, updateJobFromForm } from './lib/jobs-api';
import { fetchOfficerPayments, markOfficerPaymentPaid } from './lib/payments-api';
import { fetchOperationsReport } from './lib/reports-api';
import type { OperationsReport } from './lib/reports-api';
import { BillingScreen } from './screens/BillingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { JobDetailScreen } from './screens/JobDetailScreen';
import { JobsScreen } from './screens/JobsScreen';
import { OfficersScreen } from './screens/OfficersScreen';
import { PaymentsScreen } from './screens/PaymentsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { routeForScreen } from './routes';
import { TODAY, dateLabel, hours, money, nextId, normalizeJobStage, officerStatusLabel, officerStatusTone, statusTone } from './lib/format';
import type { BillForm, Job, JobForm, JobOfficer, JobStatus, Officer, OfficerForm, Payment, Screen } from './types';

const navIcons: Record<Screen, ReactNode> = {
  dashboard: <DashboardIcon />,
  jobs: <JobsIcon />,
  jobDetail: <JobsIcon />,
  officers: <OfficersIcon />,
  summary: <SummaryIcon />,
  payments: <PaymentIcon />,
  billing: <BillingIcon />,
  reports: <ReportsIcon />,
};

const navGroups: { label: string; items: { screen: Screen; label: string }[] }[] = [
  { label: 'Operations', items: [{ screen: 'dashboard', label: 'Dashboard' }, { screen: 'jobs', label: 'Jobs' }] },
  { label: 'People', items: [{ screen: 'officers', label: 'Officer Management' }] },
  {
    label: 'Finance',
    items: [
      { screen: 'summary', label: 'Completed Job Summary' },
      { screen: 'payments', label: 'Officer Payment' },
      { screen: 'billing', label: 'Customer Billing' },
    ],
  },
  { label: 'Insights', items: [{ screen: 'reports', label: 'Reports' }] },
];

const JOBS_STORAGE_KEY = 'pilotnow.admin.jobs';

const emptyJobForm: JobForm = {
  customer: '',
  location: '',
  date: '2026-07-12',
  start: '09:00',
  end: '18:00',
  required: '2',
  description: '',
  instructions: '',
};

const emptyOfficerForm: OfficerForm = {
  name: '',
  phone: '+65 ',
  rate: '16',
  ic: false,
  status: 'New',
  notes: '',
};

export function AdminApp({
  initialScreen = 'dashboard',
  initialJobId = 'PN-2041',
  initialSummaryJobId = null,
}: {
  initialScreen?: Screen;
  initialJobId?: string;
  initialSummaryJobId?: string | null;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [jobs, setJobs] = useState<Job[]>(() => jobsSeed.map((job) => normalizeJobStage(job)));
  const [officers, setOfficers] = useState<Officer[]>(officersSeed);
  const [payments, setPayments] = useState<Payment[]>(paymentsSeed);
  const [jobId, setJobId] = useState(initialJobId);
  const [summaryJobId, setSummaryJobId] = useState<string | null>(initialSummaryJobId);
  const [jobFilter, setJobFilter] = useState<JobStatus | 'All'>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [officerOpen, setOfficerOpen] = useState(false);
  const [officerProfileId, setOfficerProfileId] = useState<string | null>(null);
  const [billId, setBillId] = useState<string | null>(null);
  const [payOfficer, setPayOfficer] = useState<string | null>(null);
  const [reportJobId, setReportJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<JobForm>(emptyJobForm);
  const [officerForm, setOfficerForm] = useState<OfficerForm>(emptyOfficerForm);
  const [billForm, setBillForm] = useState<BillForm>({ invoice: '', billedDate: TODAY });
  const [savingJob, setSavingJob] = useState(false);
  const [jobsReady, setJobsReady] = useState(false);
  const [paymentsReady, setPaymentsReady] = useState(false);
  const [billingReady, setBillingReady] = useState(false);
  const [reportsReady, setReportsReady] = useState(false);
  const [jobsHydrated, setJobsHydrated] = useState(false);
  const [operationsReport, setOperationsReport] = useState<OperationsReport | null>(null);
  const [toast, setToast] = useState('');

  const fallbackJob = jobsSeed[0] as Job;
  const selectedJob: Job = jobs.find((job) => job.id === jobId) ?? jobs[0] ?? fallbackJob;
  const completedJobs = jobs.filter((job) => job.status === 'Completed');
  const billTarget = billId ? jobs.find((job) => job.id === billId) : null;

  useLayoutEffect(() => {
    setScreen(initialScreen);
    setJobId(initialJobId);
    setSummaryJobId(initialSummaryJobId);
  }, [initialJobId, initialScreen, initialSummaryJobId]);

  const stats = useMemo(() => {
    const pendingPayments = payments.filter((payment) => payment.status === 'Pending').length;
    return {
      todayJobs: jobs.filter((job) => job.date === TODAY && job.status !== 'Cancelled').length,
      openJobs: jobs.filter((job) => job.status === 'Open').length,
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
    setBillId(null);
    setPayOfficer(null);
    setReportJobId(null);
    setOfficerProfileId(null);
    setScreen(nextScreen);
    if (nextScreen === 'summary') setSummaryJobId(null);
    router.push(routeForScreen(nextScreen, selectedJob.id));
  }

  function openJob(id: string) {
    setJobId(id);
    setScreen('jobDetail');
    router.push(routeForScreen('jobDetail', id));
  }

  function openSummaryJob(id: string) {
    setSummaryJobId(id);
    setScreen('summary');
    router.push(`/admin/summary/${encodeURIComponent(id)}`);
  }

  function closeSummaryJob() {
    setSummaryJobId(null);
    setScreen('summary');
    router.push('/admin/summary');
  }

  function updateJob(id: string, updater: (job: Job) => Job) {
    setJobs((items) => items.map((job) => (job.id === id ? normalizeJobStage(updater(job)) : normalizeJobStage(job))));
  }

  function openCreateJob() {
    setEditingJobId(null);
    setJobForm(emptyJobForm);
    setCreateOpen(true);
  }

  function openEditJob(job: Job) {
    setEditingJobId(job.id);
    setJobForm({
      customer: job.customer,
      location: job.location,
      date: job.date,
      start: job.start,
      end: job.end,
      required: String(job.required),
      description: job.description,
      instructions: job.instructions,
    });
    setCreateOpen(true);
  }

  async function saveJob() {
    if (!jobForm.customer.trim() || !jobForm.location.trim()) {
      flash('Enter a customer and location first');
      return;
    }
    setSavingJob(true);
    try {
      const existing = editingJobId ? jobs.find((job) => job.id === editingJobId) : undefined;
      const job = editingJobId ? await updateJobFromForm(editingJobId, jobForm, existing) : await createJobFromForm(jobForm);
      setJobs((items) => (editingJobId ? items.map((item) => normalizeJobStage(item.id === job.id ? job : item)) : [normalizeJobStage(job), ...items.filter((item) => item.id !== job.id).map((item) => normalizeJobStage(item))]));
      setCreateOpen(false);
      setEditingJobId(null);
      setJobForm(emptyJobForm);
      openJob(job.id);
      flash(editingJobId ? `Job ${job.id} updated` : `Job ${job.id} created`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Check that the API and database are running.';
      flash(`Could not ${editingJobId ? 'update' : 'create'} job. ${reason}`);
    } finally {
      setSavingJob(false);
    }
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

  async function cancelJob(id: string) {
    const current = jobs.find((job) => job.id === id);
    try {
      const job = await cancelJobInApi(id, current);
      setJobs((items) => items.map((item) => normalizeJobStage(item.id === id ? job : item)));
      flash('Job cancelled');
    } catch {
      flash('Could not cancel job. Check that the API is running.');
    }
  }

  async function completeJob(id: string) {
    const current = jobs.find((job) => job.id === id);
    try {
      const job = await completeJobInApi(id, current);
      setJobs((items) =>
        items.map((item) =>
          item.id === id
            ? normalizeJobStage({
                ...job,
                officers: item.officers.map((officer) => ({
                  ...officer,
                  confirmed: true,
                  onDuty: true,
                  actualStart: officer.actualStart || item.start,
                  actualEnd: officer.actualEnd || item.end,
                })),
                photos: item.photos.length ? item.photos : job.photos,
              })
            : normalizeJobStage(item),
        ),
      );
      flash('Job marked as completed');
    } catch {
      flash('Could not complete job. Check that it is confirmed in the API.');
    }
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

  async function markPaid(id: string) {
    setPayments((items) => items.map((payment) => (payment.id === id ? { ...payment, status: 'Paid', paidDate: TODAY } : payment)));

    try {
      const updated = await markOfficerPaymentPaid(id);
      setPayments((items) => items.map((payment) => (payment.id === id ? updated : payment)));
      flash('Payment marked as paid');
    } catch {
      flash('Payment marked as paid locally - API unavailable');
    }
  }

  async function confirmBill() {
    if (!billTarget || !billForm.invoice.trim() || !billForm.billedDate) {
      flash('Enter invoice number and billed date');
      return;
    }
    try {
      const updated = await markJobBilled(billTarget.id, billForm, billTarget);
      setJobs((items) => items.map((job) => normalizeJobStage(job.id === updated.id ? { ...job, ...updated } : job)));
      setBillId(null);
      setBillForm({ invoice: '', billedDate: TODAY });
      flash(`Job ${billTarget.id} marked as billed`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Check that the API and database are running.';
      flash(`Could not mark billed. ${reason}`);
    }
  }

  const [crumb, title] = screenTitles[screen];
  const pageTitle = screen === 'jobDetail' ? selectedJob.id : title;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(JOBS_STORAGE_KEY);
      if (stored) setJobs((JSON.parse(stored) as Job[]).map((job) => normalizeJobStage(job)));
    } catch {
      // Keep seeded data when local storage is unavailable or stale.
    }
    setJobsHydrated(true);
  }, []);

  useEffect(() => {
    if (!jobsHydrated) return;
    try {
      window.localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    } catch {
      // Ignore storage failures; the in-memory admin state still works.
    }
  }, [jobs, jobsHydrated]);

  useEffect(() => {
    if (!jobsHydrated) return;
    const updateStages = () => setJobs((items) => items.map((job) => normalizeJobStage(job)));
    updateStages();
    const timer = window.setInterval(updateStages, 60_000);
    return () => window.clearInterval(timer);
  }, [jobsHydrated]);

  useEffect(() => {
    if (!jobsHydrated) return;
    let cancelled = false;

    void fetchJobs(jobs)
      .then((items) => {
        if (cancelled) return;
        setJobs((current) =>
          items.map((item) => {
            const existing = current.find((job) => job.id === item.id);
            return normalizeJobStage({
              ...item,
              officers: existing?.officers.length ? existing.officers : item.officers,
              photos: existing?.photos.length ? existing.photos : item.photos,
            });
          }),
        );
        if (items.length) {
          setJobId((id) => (items.some((job) => job.id === id) ? id : items[0]?.id ?? id));
        }
        setJobsReady(true);
      })
      .catch(() => {
        // Keep seeded demo data when the API is not running.
        setJobsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [jobsHydrated]);

  useEffect(() => {
    let cancelled = false;

    void fetchOfficerPayments()
      .then((items) => {
        if (!cancelled) {
          setPayments(items);
          setPaymentsReady(true);
        }
      })
      .catch(() => {
        // Keep seeded demo payments when the API is not running.
        setPaymentsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetchBillingJobs(jobsSeed)
      .then((items) => {
        if (cancelled) return;
        setJobs((current) => {
          const merged = current.map((job) => {
            const billingJob = items.find((item) => item.id === job.id);
            return normalizeJobStage(billingJob ? { ...job, ...billingJob, officers: job.officers, photos: job.photos } : job);
          });
          const missing = items.filter((item) => !merged.some((job) => job.id === item.id)).map((job) => normalizeJobStage(job));
          return [...merged, ...missing];
        });
        setBillingReady(true);
      })
      .catch(() => {
        // Keep current billing data when the API is not running.
        setBillingReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetchOperationsReport()
      .then((report) => {
        if (!cancelled) {
          setOperationsReport(report);
          setReportsReady(true);
        }
      })
      .catch(() => {
        // Fall back to client-side reports when the API is not running.
        setReportsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
            onClick={openCreateJob}
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
              openCreateJob={openCreateJob}
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
              onEdit={() => openEditJob(selectedJob)}
              openReport={() => setReportJobId(selectedJob.id)}
              removeOfficer={removeOfficerFromJob}
              setScreen={navigateToScreen}
              toggleOfficer={toggleOfficer}
            />
          ) : null}
          {screen === 'officers' ? <OfficersScreen officers={officers} openOfficer={() => setOfficerOpen(true)} openOfficerProfile={setOfficerProfileId} /> : null}
          {screen === 'summary' ? (
            jobsReady ? <SummaryScreen closeSummaryJob={closeSummaryJob} detailJobId={summaryJobId} jobs={completedJobs} openSummaryJob={openSummaryJob} /> : <LoadingPanel />
          ) : null}
          {screen === 'payments' ? (paymentsReady ? <PaymentsScreen markPaid={markPaid} payments={payments} setPayOfficer={setPayOfficer} /> : <LoadingPanel />) : null}
          {screen === 'billing' ? (
            jobsReady && billingReady ? (
              <BillingScreen
                jobs={completedJobs}
                openBill={(id) => {
                  setBillId(id);
                  setBillForm({ invoice: '', billedDate: TODAY });
                }}
              />
            ) : (
              <LoadingPanel />
            )
          ) : null}
          {screen === 'reports' ? (jobsReady && paymentsReady && reportsReady ? <ReportsScreen jobs={jobs} officers={officers} payments={payments} report={operationsReport} /> : <LoadingPanel />) : null}
        </div>
      </main>

      {createOpen ? (
        <Modal
          title={editingJobId ? 'Edit job' : 'Create new job'}
          subtitle={editingJobId ? 'Update the job details in PilotNow.' : 'Saved in PilotNow - you can post it to WhatsApp next.'}
          onClose={() => {
            setCreateOpen(false);
            setEditingJobId(null);
          }}
          footer={
            <>
              <Button
                onClick={() => {
                  setCreateOpen(false);
                  setEditingJobId(null);
                }}
              >
                Cancel
              </Button>
              <Button disabled={savingJob} variant="primary" onClick={saveJob}>
                {savingJob ? 'Saving...' : editingJobId ? 'Save changes' : 'Create job'}
              </Button>
            </>
          }
        >
          <JobFormFields form={jobForm} setForm={setJobForm} />
        </Modal>
      ) : null}

      {officerOpen ? (
        <Modal
          title="Add new officer"
          subtitle="Create a profile for an officer who volunteered."
          onClose={() => setOfficerOpen(false)}
          footer={
            <>
              <Button onClick={() => setOfficerOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveOfficer}>
                Add officer
              </Button>
            </>
          }
        >
          <OfficerFormFields form={officerForm} setForm={setOfficerForm} />
        </Modal>
      ) : null}

      {billTarget ? (
        <Modal
          title="Mark as billed"
          subtitle={`${billTarget.id} / ${billTarget.customer} / ${dateLabel(billTarget.date)}`}
          onClose={() => setBillId(null)}
          footer={
            <>
              <Button onClick={() => setBillId(null)}>Cancel</Button>
              <Button variant="primary" onClick={confirmBill}>
                Confirm Billed
              </Button>
            </>
          }
        >
          <Field label="Invoice number" required>
            <input value={billForm.invoice} onChange={(event) => setBillForm((form) => ({ ...form, invoice: event.target.value }))} placeholder="INV-2026-0460" />
          </Field>
          <Field label="Billed date" required>
            <input type="date" value={billForm.billedDate} onChange={(event) => setBillForm((form) => ({ ...form, billedDate: event.target.value }))} />
          </Field>
        </Modal>
      ) : null}

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

function LoadingPanel() {
  return <div className="pn-empty">Loading...</div>;
}

function JobFormFields({ form, setForm }: { form: JobForm; setForm: (updater: (form: JobForm) => JobForm) => void }) {
  return (
    <div className="pn-form-grid">
      <Field label="Customer" required>
        <input placeholder="e.g. Sentinel Events Pte Ltd" value={form.customer} onChange={(event) => setForm((item) => ({ ...item, customer: event.target.value }))} />
      </Field>
      <Field label="Job location" required>
        <input placeholder="e.g. Marina Bay Sands - Expo Hall B" value={form.location} onChange={(event) => setForm((item) => ({ ...item, location: event.target.value }))} />
      </Field>
      <div className="pn-form-row pn-form-row-time">
        <Field label="Job date">
          <input type="date" value={form.date} onChange={(event) => setForm((item) => ({ ...item, date: event.target.value }))} />
        </Field>
        <Field label="Start">
          <input type="time" value={form.start} onChange={(event) => setForm((item) => ({ ...item, start: event.target.value }))} />
        </Field>
        <Field label="End">
          <input type="time" value={form.end} onChange={(event) => setForm((item) => ({ ...item, end: event.target.value }))} />
        </Field>
      </div>
      <Field label="Officers">
        <select value={form.required} onChange={(event) => setForm((item) => ({ ...item, required: event.target.value }))}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
            <option key={count} value={count}>
              {count} officer{count > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Description">
        <textarea placeholder="What is the job?" rows={2} value={form.description} onChange={(event) => setForm((item) => ({ ...item, description: event.target.value }))} />
      </Field>
      <Field label="Instructions">
        <textarea placeholder="Dress code, reporting point, etc." rows={2} value={form.instructions} onChange={(event) => setForm((item) => ({ ...item, instructions: event.target.value }))} />
      </Field>
    </div>
  );
}

function OfficerFormFields({ form, setForm }: { form: OfficerForm; setForm: (updater: (form: OfficerForm) => OfficerForm) => void }) {
  return (
    <div className="pn-form-grid">
      <Field label="Full name" required>
        <input placeholder="e.g. Ravi Chandran" value={form.name} onChange={(event) => setForm((item) => ({ ...item, name: event.target.value }))} />
      </Field>
      <Field label="WhatsApp number" required>
        <input className="pn-mono-input" placeholder="+65 8123 4567" value={form.phone} onChange={(event) => setForm((item) => ({ ...item, phone: event.target.value }))} />
      </Field>
      <div className="pn-form-row">
        <Field label="Default hourly rate (S$)">
          <input className="pn-mono-input" max="40" min="10" type="number" value={form.rate} onChange={(event) => setForm((item) => ({ ...item, rate: event.target.value }))} />
        </Field>
        <Field label="Account status">
          <select value={form.status} onChange={(event) => setForm((item) => ({ ...item, status: event.target.value as OfficerForm['status'] }))}>
            {['New', 'Active', 'Inactive', 'Blocked'].map((status) => (
              <option key={status} value={status}>
                {officerStatusLabel[status as OfficerForm['status']]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <label className="pn-check">
        <input checked={form.ic} onChange={(event) => setForm((item) => ({ ...item, ic: event.target.checked }))} type="checkbox" />
        <span>
          <strong>IC document verified</strong>
          <small>Tick only after the officer's IC copy has been checked.</small>
        </span>
      </label>
      <Field label="Notes">
        <textarea placeholder="Availability, certifications, etc." rows={2} value={form.notes} onChange={(event) => setForm((item) => ({ ...item, notes: event.target.value }))} />
      </Field>
    </div>
  );
}

function OfficerProfileModal({ officer, jobs, onClose, openJob }: { officer?: Officer; jobs: Job[]; onClose: () => void; openJob: (id: string) => void }) {
  if (!officer) return null;

  const history = jobs
    .map((job) => {
      const assigned = job.officers.find((item) => item.oid === officer.id);
      if (!assigned) return null;
      const scheduled = hours(job.start, job.end);
      const worked = assigned.actualStart && assigned.actualEnd ? hours(assigned.actualStart, assigned.actualEnd) : job.status === 'Completed' || assigned.actualStart ? scheduled : 0;
      return {
        job,
        worked,
        pay: worked * assigned.rate,
      };
    })
    .filter((item): item is { job: Job; worked: number; pay: number } => Boolean(item))
    .sort((a, b) => b.job.date.localeCompare(a.job.date) || b.job.id.localeCompare(a.job.id));
  const completed = history.filter((item) => item.job.status === 'Completed');
  const totalHours = completed.reduce((sum, item) => sum + item.worked, 0);
  const totalPay = completed.reduce((sum, item) => sum + item.pay, 0);
  const officerTone = officerStatusTone[officer.status];

  return (
    <Modal title={officer.name} onClose={onClose} wide hideHeader>
      <div className="pn-profile-head">
        <span className="pn-profile-avatar">{initials(officer.name)}</span>
        <div className="pn-profile-title">
          <div className="pn-profile-name-row">
            <strong>{officer.name}</strong>
            <div className="pn-profile-badges">
              <Badge tone={officerTone}>{officer.status}</Badge>
              <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? 'IC ✓' : 'No IC'}</Badge>
            </div>
          </div>
          <small>{officer.id} / {officer.phone} / {money(officer.rate)}/h</small>
        </div>
        <div className="pn-profile-actions">
          <button className="pn-icon-btn" type="button" aria-label={`Message ${officer.name}`}>
            <MessageIcon size={16} strokeWidth={2} />
          </button>
          <button className="pn-icon-btn" onClick={onClose} type="button" aria-label="Close">
            x
          </button>
        </div>
      </div>

      <div className="pn-profile-label pn-profile-details-label">Officer details</div>
      <div className="pn-profile-grid">
        <ProfileCell label="OFFICER ID" value={officer.id} mono />
        <ProfileCell label="FULL NAME" value={officer.name} />
        <ProfileCell label="WHATSAPP NUMBER" value={officer.phone} mono />
        <ProfileCell label="DEFAULT HOURLY RATE" value={`${money(officer.rate)}/h`} mono />
        <ProfileCell
          label="IC STATUS"
          value={
            <span className="pn-profile-cell-inline">
              <Badge tone={officer.ic ? 'success' : 'danger'}>{officer.ic ? <><span>IC</span><CheckIcon size={13} strokeWidth={2.4} /></> : 'No IC'}</Badge>
              {officer.ic ? 'Received' : 'Not received'}
            </span>
          }
        />
        <ProfileCell label="OFFICER STATUS" value={<Badge tone={officerTone}>{officer.status}</Badge>} />
      </div>

      <div className="pn-profile-stats">
        <ProfileCell label="JOBS WITH US" value={String(history.length)} />
        <ProfileCell label="COMPLETED" value={String(completed.length)} />
        <ProfileCell label="HOURS WORKED" value={`${totalHours.toFixed(2)}h`} mono />
        <ProfileCell label="TOTAL EARNED" value={money(totalPay)} mono />
      </div>

      <div className="pn-profile-label pn-profile-label-line">Job history</div>
      {history.length ? (
        <div className="pn-table pn-table-profile-history">
          <div className="pn-table-head">
            <span>Job</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Hours</span>
            <span>Pay</span>
            <span>Status</span>
          </div>
          {history.map(({ job, worked, pay }) => (
            <button className="pn-table-row pn-click-row" key={job.id} onClick={() => openJob(job.id)} type="button">
              <span className="pn-mono">{job.id}</span>
              <span>{job.customer}</span>
              <span>{dateLabel(job.date)}</span>
              <span>{worked ? `${worked.toFixed(2)}h` : '-'}</span>
              <span>{money(pay)}</span>
              <span>
                <Badge tone={statusTone[job.status]} dot>{job.status}</Badge>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="pn-empty">No jobs recorded for this officer yet.</div>
      )}

      <div className="pn-profile-label">Notes</div>
      <p className="pn-profile-notes">{officer.notes || 'No notes on file.'}</p>
    </Modal>
  );
}

function ProfileCell({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="pn-profile-cell">
      <span>{label}</span>
      <strong className={mono ? 'pn-mono' : ''}>{value}</strong>
    </div>
  );
}

function JobReportModal({ job, onClose, copyText }: { job: Job; onClose: () => void; copyText: (text: string, message: string) => void }) {
  const scheduled = hours(job.start, job.end);
  const received = job.photos.filter((photo) => photo.status === 'received');
  const officerReports = job.officers.map((officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled;
    const actualHours = `${officer.actualStart || job.start} - ${officer.actualEnd || job.end}`;
    const evidencePhotos = job.photos.filter((photo) => photo.by === officer.name).length;
    return { officer, worked, actualHours, evidencePhotos, payable: worked * officer.rate };
  });
  const totalPay = officerReports.reduce((sum, report) => sum + report.payable, 0);
  const officerCopy = officerReports.length
    ? officerReports
        .map(
          ({ officer, worked, actualHours, evidencePhotos, payable }) =>
            `${officer.name}\n${officer.confirmed ? 'Confirmed' : 'Not confirmed'} - ${officer.actualStart ? 'Reported' : 'Not reported'} - IC ${officer.ic ? 'yes' : 'missing'}\nActual hours: ${actualHours}\nEvidence photos: ${evidencePhotos}\nPayable: ${money(payable)} (${worked.toFixed(2)}h x ${money(officer.rate)}/h)`,
        )
        .join('\n\n')
    : 'No participating officers recorded for this job yet.';
  const reportText = [
    'PilotNow Security Ops',
    'Job Completion & Evidence Report',
    '',
    `Job ID: ${job.id}`,
    `Generated: ${dateLabel(TODAY)}`,
    `Customer: ${job.customer}`,
    `Status: ${job.status}`,
    `Location: ${job.location}`,
    `Date: ${dateLabel(job.date)}`,
    `Time: ${job.start}-${job.end}`,
    `Officers: ${job.officers.length} of ${job.required} officers`,
    '',
    'Description',
    job.description || 'No description provided.',
    '',
    'Special instructions',
    job.instructions || 'No special instructions.',
    '',
    `Participating officers & evidence photos (${received.length} / ${job.photos.length} photos received)`,
    officerCopy,
    '',
    'TOTAL PAYABLE TO OFFICERS',
    `Billing status: ${job.billing}`,
    money(totalPay),
    '',
    `This report was generated by PilotNow - ${dateLabel(TODAY)} - Confidential`,
  ].join('\n');

  return (
    <Modal
      title="Job Completion Report"
      onClose={onClose}
      wide
      headerActions={
        <div className="pn-report-header-actions">
          <button onClick={() => window.print()} type="button">
            <PrinterIcon size={14} strokeWidth={2} />
            Print / PDF
          </button>
          <button onClick={() => copyText(reportText, 'Job completion report copied')} type="button">
            <CopyIcon size={14} strokeWidth={2} />
            Copy
          </button>
        </div>
      }
    >
      <div className="pn-report">
        <header className="pn-report-letterhead">
          <span>
            <ShieldCheckIcon size={19} stroke="#FF7A1A" strokeWidth={2.2} />
          </span>
          <div>
            <strong>PilotNow Security Ops</strong>
            <small>Job Completion & Evidence Report</small>
          </div>
          <aside>
            <strong>{job.id}</strong>
            <span>Generated {dateLabel(TODAY)}</span>
          </aside>
        </header>

        <section className="pn-report-section">
          <h3>JOB INFORMATION</h3>
          <div className="pn-report-title-row">
            <h2>{job.customer}</h2>
            <span className={`pn-report-status ${job.status === 'Completed' ? 'is-complete' : ''}`}>{job.status}</span>
          </div>
        </section>

        <section className="pn-report-grid">
          <div>
            <label>LOCATION</label>
            <strong>{job.location}</strong>
          </div>
          <div>
            <label>DATE</label>
            <strong>{dateLabel(job.date)}</strong>
          </div>
          <div>
            <label>TIME</label>
            <strong>{job.start}-{job.end}</strong>
          </div>
          <div>
            <label>OFFICERS</label>
            <strong>{job.officers.length} of {job.required} officers</strong>
          </div>
        </section>

        <section className="pn-report-notes">
          <div>
            <label>DESCRIPTION</label>
            <p>{job.description || 'No description provided.'}</p>
          </div>
          <div>
            <label>SPECIAL INSTRUCTIONS</label>
            <p>{job.instructions || 'No special instructions.'}</p>
          </div>
        </section>

        <section className="pn-report-section">
          <header>
            <h3>PARTICIPATING OFFICERS & EVIDENCE PHOTOS</h3>
            <span>{received.length} / {job.photos.length} photos received</span>
          </header>
          {officerReports.map(({ officer, worked, actualHours, evidencePhotos, payable }) => (
            <div className="pn-report-officer" key={officer.oid}>
              <div className="pn-report-officer-main">
                <span className="pn-report-avatar">{initials(officer.name)}</span>
                <div>
                  <strong>{officer.name}</strong>
                  <small>{officer.confirmed ? 'Confirmed' : 'Not confirmed'} · {officer.actualStart ? 'Reported' : 'Not reported'}</small>
                </div>
                <span className="pn-report-ic">IC {officer.ic ? '✓' : 'missing'}</span>
              </div>
              <div className="pn-report-pay">
                <strong>{money(payable)}</strong>
                <small>{worked.toFixed(2)}h x {money(officer.rate)}/h</small>
              </div>
              <div className="pn-report-officer-meta">
                <span>Actual hours: <strong>{actualHours}</strong></span>
                <span>Evidence photos: <strong>{evidencePhotos}</strong></span>
              </div>
            </div>
          ))}
          {!job.officers.length ? <p className="pn-report-empty">No participating officers recorded for this job yet.</p> : null}
        </section>

        <footer className="pn-report-footer">
          <div>
            <span>TOTAL PAYABLE TO OFFICERS</span>
            <small>Billing status: {job.billing}</small>
          </div>
          <strong>{money(totalPay)}</strong>
        </footer>
        <p className="pn-report-generated">This report was generated by PilotNow · {dateLabel(TODAY)} · Confidential</p>
      </div>
    </Modal>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function PaymentHistoryModal({ officer, payments, onClose, openJob }: { officer: string; payments: Payment[]; onClose: () => void; openJob: (id: string) => void }) {
  const rows = payments.filter((payment) => payment.officer === officer);
  return (
    <Modal title={officer} subtitle={`Payment history / ${rows.length} records`} onClose={onClose} wide footer={<Button onClick={onClose}>Close</Button>}>
      <div className="pn-table">
        {rows.map((payment) => (
          <button
            className="pn-table-row"
            key={payment.id}
            onClick={() => {
              onClose();
              openJob(payment.jobId);
            }}
            type="button"
          >
            <span>{payment.jobId}</span>
            <span>{dateLabel(payment.jobDate)}</span>
            <span>{payment.hours.toFixed(2)}h</span>
            <span>{payment.status}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
