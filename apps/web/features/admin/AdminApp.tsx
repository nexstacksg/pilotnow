'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import {
  BillingIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  DashboardIcon,
  DownloadIcon,
  JobsIcon,
  OfficersIcon,
  PaymentIcon,
  PlusIcon,
  PrinterIcon,
  ReportsIcon,
  SearchIcon,
  ShieldCheckIcon,
  SummaryIcon,
} from './components/icons';
import { OfficerDetailModal } from './components/OfficerDetailModal';
import { Badge, Button, Field, Modal } from './components/ui';
import { AdminAccountMenu } from './components/AdminAccountMenu';
import { screenTitles } from './config';
import { jobsSeed, officersSeed, paymentsSeed } from './data';
import { fetchBillingJobs, markJobBilled } from './lib/billing-api';
import { dashboardFallback, fetchDashboard } from './lib/dashboard-api';
import type { DashboardSnapshot } from './lib/dashboard-api';
import { assignOfficerToJob, cancelJobInApi, completeJobInApi, createJobFromForm, fetchJob, fetchJobs, markJobPostedInApi, updateJobFromForm } from './lib/jobs-api';
import { createOfficerFromForm, deleteOfficer, fetchOfficers, updateOfficerFromForm } from './lib/officers-api';
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
import { ProfileScreen } from './screens/ProfileScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { routeForScreen } from './routes';
import { TODAY, dateLabel, hours, money, normalizeJobStage, officerStatusLabel, statusTone } from './lib/format';
import type { BillingFilter, BillForm, Job, JobForm, JobListFilter, JobOfficer, JobStatus, Officer, OfficerForm, Payment, Screen } from './types';

type NavigationScreen = Exclude<Screen, 'profile'>;

const navIcons: Record<NavigationScreen, ReactNode> = {
  dashboard: <DashboardIcon />,
  jobs: <JobsIcon />,
  jobDetail: <JobsIcon />,
  officers: <OfficersIcon />,
  summary: <SummaryIcon />,
  payments: <PaymentIcon />,
  billing: <BillingIcon />,
  reports: <ReportsIcon />,
};

const navGroups: { label: string; items: { screen: NavigationScreen; label: string }[] }[] = [
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
const PAYMENTS_STORAGE_KEY = 'pilotnow.admin.payments';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AdminSearchResult = {
  key: string;
  type: 'job' | 'officer';
  id: string;
  title: string;
  detail: string;
};

type Toast = {
  message: string;
  tone: 'success' | 'error';
};

type OfficerFormErrors = Partial<Record<'name' | 'phone', string>>;

const MAX_JOB_OFFICERS = 12;

function todayInputDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function emptyJobForm(): JobForm {
  return {
    customer: '',
    location: '',
    date: todayInputDate(),
    start: '09:00',
    end: '18:00',
    required: '1',
    description: '',
    instructions: '',
  };
}

const emptyOfficerForm: OfficerForm = {
  name: '',
  phone: '+65 ',
  rate: '16',
  ic: false,
  status: 'New',
  notes: '',
};

const screens: Screen[] = ['dashboard', 'jobs', 'jobDetail', 'officers', 'summary', 'payments', 'billing', 'reports'];

function initialScreenForPath(initialScreen: Screen) {
  if (typeof window === 'undefined' || window.location.pathname !== '/' || initialScreen !== 'dashboard') return initialScreen;
  const stored = window.localStorage.getItem('pilotnow:last-screen') as Screen | null;
  return stored && stored !== 'jobDetail' && screens.includes(stored) ? stored : initialScreen;
}

function pushRoute(path: string) {
  window.history.pushState(null, '', path);
}

function isApiPaymentId(id: string) {
  return UUID_PATTERN.test(id);
}

function paymentKey(payment: Payment) {
  return `${payment.jobId}::${payment.officer}`;
}

function mergePaymentRows(primary: Payment[], secondary: Payment[]) {
  const rows = [...primary];
  const existingById = new Set(rows.map((payment) => payment.id));
  const existingByJobOfficer = new Set(rows.map(paymentKey));

  secondary.forEach((payment) => {
    if (existingById.has(payment.id) || existingByJobOfficer.has(paymentKey(payment))) return;
    rows.push(payment);
  });

  return rows;
}

function mergeServerPayments(serverPayments: Payment[], localPayments: Payment[]) {
  const clientOnly = localPayments.filter((payment) => !isApiPaymentId(payment.id));
  return mergePaymentRows(serverPayments, clientOnly);
}

function validateOfficerForm(form: OfficerForm) {
  const errors: OfficerFormErrors = {};
  const phoneDigits = form.phone.replace(/[^0-9]/g, '');

  if (!form.name.trim()) errors.name = 'Full name is required.';
  if (!phoneDigits.length) {
    errors.phone = 'WhatsApp number is required.';
  } else if (phoneDigits.length < 6) {
    errors.phone = 'Enter a valid WhatsApp number.';
  }

  return errors;
}

function paymentRowsFromJobs(jobs: Job[], existingPayments: Payment[]) {
  const existingById = new Map(existingPayments.map((payment) => [payment.id, payment]));
  const existingByJobOfficer = new Map(existingPayments.map((payment) => [paymentKey(payment), payment]));
  const rows = [...existingPayments];

  jobs
    .filter((job) => job.status === 'Completed')
    .forEach((job) => {
      const scheduled = hours(job.start, job.end);
      job.officers.forEach((officer) => {
        const id = `local:${job.id}:${officer.oid}`;
        if (existingById.has(id) || existingByJobOfficer.has(`${job.id}::${officer.name}`)) return;
        const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled;
        rows.push({
          id,
          officer: officer.name,
          jobId: job.id,
          jobDate: job.date,
          hours: worked,
          rate: officer.rate,
          status: 'Pending' as const,
          paidDate: '',
        });
      });
    });

  return rows;
}

function reconcileOfficerJobCounts(officers: Officer[], jobs: Job[]) {
  const counts = new Map<string, number>();

  jobs.forEach((job) => {
    const countedKeys = new Set<string>();
    job.officers.forEach((assigned) => {
      countedKeys.add(assigned.oid);
    });
    countedKeys.forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1));
  });

  return officers.map((officer) => {
    const jobsCount = counts.get(officer.id) ?? counts.get(officer.code ?? '') ?? 0;
    return jobsCount > officer.jobsCount ? { ...officer, jobsCount } : officer;
  });
}

export function AdminApp({
  initialScreen = 'dashboard',
  initialJobId = 'PN-2041',
  initialSummaryJobId = null,
  initialJobFilter = 'All',
  initialBillingFilter = 'All',
  initialBillId = null,
  initialOfficerProfileId = null,
}: {
  initialScreen?: Screen;
  initialJobId?: string;
  initialSummaryJobId?: string | null;
  initialJobFilter?: JobListFilter;
  initialBillingFilter?: BillingFilter;
  initialBillId?: string | null;
  initialOfficerProfileId?: string | null;
}) {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [jobs, setJobs] = useState<Job[]>(() => jobsSeed.map((job) => normalizeJobStage(job)));
  const [officers, setOfficers] = useState<Officer[]>(officersSeed);
  const [payments, setPayments] = useState<Payment[]>(paymentsSeed);
  const [jobId, setJobId] = useState(initialJobId);
  const [summaryJobId, setSummaryJobId] = useState<string | null>(initialSummaryJobId);
  const [jobFilter, setJobFilter] = useState<JobListFilter>('All');
  const [billingFilter, setBillingFilter] = useState<BillingFilter>(initialBillingFilter);
  const [searchByScreen, setSearchByScreen] = useState<Partial<Record<Screen, string>>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [officerOpen, setOfficerOpen] = useState(false);
  const [officerProfileId, setOfficerProfileId] = useState<string | null>(null);
  const [officerProfileMode, setOfficerProfileMode] = useState<'view' | 'edit'>('view');
  const [deleteOfficerId, setDeleteOfficerId] = useState<string | null>(null);
  const [deletingOfficer, setDeletingOfficer] = useState(false);
  const [billId, setBillId] = useState<string | null>(null);
  const [payOfficer, setPayOfficer] = useState<string | null>(null);
  const [reportJobId, setReportJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<JobForm>(() => emptyJobForm());
  const [officerForm, setOfficerForm] = useState<OfficerForm>(emptyOfficerForm);
  const [billForm, setBillForm] = useState<BillForm>({ invoice: '', billedDate: TODAY });
  const [savingJob, setSavingJob] = useState(false);
  const [savingOfficer, setSavingOfficer] = useState(false);
  const [jobsReady, setJobsReady] = useState(false);
  const [officersReady, setOfficersReady] = useState(false);
  const [paymentsReady, setPaymentsReady] = useState(false);
  const [billingReady, setBillingReady] = useState(false);
  const [reportsReady, setReportsReady] = useState(false);
  const [jobsHydrated, setJobsHydrated] = useState(false);
  const [paymentsHydrated, setPaymentsHydrated] = useState(false);
  const [operationsReport, setOperationsReport] = useState<OperationsReport | null>(null);
  const [dashboardSnapshot, setDashboardSnapshot] = useState<DashboardSnapshot | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [officerFormErrors, setOfficerFormErrors] = useState<OfficerFormErrors>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [screenPersistenceReady, setScreenPersistenceReady] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const fallbackJob = jobsSeed[0] as Job;
  const selectedJob: Job = jobs.find((job) => job.id === jobId) ?? jobs[0] ?? fallbackJob;
  const reportJob = reportJobId ? jobs.find((job) => job.id === reportJobId) ?? selectedJob : null;
  const completedJobs = jobs.filter((job) => job.status === 'Completed');
  const financePayments = useMemo(() => paymentRowsFromJobs(jobs, payments), [jobs, payments]);
  const officersWithJobCounts = useMemo(() => reconcileOfficerJobCounts(officers, jobs), [jobs, officers]);
  const search = searchByScreen[screen] ?? '';
  const searchPlaceholder =
    screen === 'officers'
      ? 'Search officers...'
      : screen === 'payments'
        ? 'Search payments...'
        : screen === 'billing'
          ? 'Search billing...'
          : screen === 'reports'
            ? 'Search reports...'
            : 'Search jobs, officers...';
  const deleteOfficerTarget = deleteOfficerId ? officersWithJobCounts.find((officer) => officer.id === deleteOfficerId) : null;
  const deleteOfficerHasHistory = Boolean(deleteOfficerTarget?.jobsCount);
  const billTarget = billId ? jobs.find((job) => job.id === billId) : null;

  useLayoutEffect(() => {
    setScreen(initialScreenForPath(initialScreen));
    setJobId(initialJobId);
    setSummaryJobId(initialSummaryJobId);
    setJobFilter(initialJobFilter);
    setBillingFilter(initialBillingFilter);
    setBillId(initialBillId);
    setOfficerProfileId(initialOfficerProfileId);
    setScreenPersistenceReady(true);
  }, [initialBillId, initialBillingFilter, initialJobFilter, initialJobId, initialOfficerProfileId, initialScreen, initialSummaryJobId]);

  useEffect(() => {
    if (!screenPersistenceReady) return;
    window.localStorage.setItem('pilotnow:last-screen', screen);
  }, [screen, screenPersistenceReady]);

  const stats = useMemo(() => {
    const pendingPayments = financePayments.filter((payment) => payment.status === 'Pending').length;
    return {
      todayJobs: jobs.filter((job) => job.date === TODAY && job.status !== 'Cancelled').length,
      openJobs: jobs.filter((job) => job.status === 'Posted/Waiting').length,
      ongoingJobs: jobs.filter((job) => job.status === 'Job ongoing').length,
      missingPhotos: jobs.flatMap((job) => job.photos).filter((photo) => photo.status === 'missing').length,
      officersNeeded: jobs.reduce((sum, job) => sum + Math.max(0, job.required - job.officers.length), 0),
      pendingPayments,
      notBilled: completedJobs.filter((job) => job.billing === 'Not Billed').length,
    };
  }, [completedJobs, jobs, payments]);
  const fallbackDashboard = useMemo(() => dashboardFallback(jobs), [jobs]);
  const searchResults = useMemo<AdminSearchResult[]>(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return [];

    const matchingJobs = jobs
      .filter((job) => [job.id, job.customer, job.location].some((value) => value.toLocaleLowerCase().includes(query)))
      .slice(0, 5)
      .map((job) => ({ key: `job-${job.id}`, type: 'job' as const, id: job.id, title: `${job.id} · ${job.customer}`, detail: `${job.location} · ${dateLabel(job.date)}` }));
    const matchingOfficers = officers
      .filter((officer) => [officer.id, officer.name, officer.phone].some((value) => value.toLocaleLowerCase().includes(query)))
      .slice(0, 5)
      .map((officer) => ({ key: `officer-${officer.id}`, type: 'officer' as const, id: officer.id, title: officer.name, detail: `${officer.id} · ${officer.phone}` }));

    return [...matchingJobs, ...matchingOfficers];
  }, [jobs, officers, searchQuery]);

  useEffect(() => {
    setActiveSearchIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    function closeSearchOnOutsidePointer(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false);
    }

    document.addEventListener('pointerdown', closeSearchOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeSearchOnOutsidePointer);
  }, []);

  function flash(message: string, tone: Toast['tone'] = 'success') {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2200);
  }

  async function copyText(text: string, message: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      flash(message || 'Copied to clipboard');
    } catch {
      flash('Could not copy message', 'error');
    }
  }

  function navigateToScreen(nextScreen: Screen) {
    setBillId(null);
    setPayOfficer(null);
    setReportJobId(null);
    setOfficerProfileId(null);
    if (nextScreen === 'jobs') setJobFilter('All');
    if (nextScreen === 'billing') setBillingFilter('All');
    setScreen(nextScreen);
    if (nextScreen === 'summary') setSummaryJobId(null);
    pushRoute(routeForScreen(nextScreen, selectedJob.id));
  }

  function openJobs(filter: JobListFilter) {
    setBillId(null);
    setPayOfficer(null);
    setReportJobId(null);
    setOfficerProfileId(null);
    setJobFilter(filter);
    setScreen('jobs');
    pushRoute(`/admin/job?view=${encodeURIComponent(filter)}`);
  }

  function openBilling(jobId?: string, filter: BillingFilter = 'Not Billed') {
    setPayOfficer(null);
    setReportJobId(null);
    setOfficerProfileId(null);
    setBillingFilter(filter);
    setBillId(jobId ?? null);
    if (jobId) setBillForm({ invoice: '', billedDate: TODAY });
    setScreen('billing');
    const jobQuery = jobId ? `&job=${encodeURIComponent(jobId)}` : '';
    pushRoute(`/billing?view=${encodeURIComponent(filter)}${jobQuery}`);
  }

  function openJob(id: string) {
    setJobId(id);
    setScreen('jobDetail');
    pushRoute(routeForScreen('jobDetail', id));
  }

  function selectSearchResult(result: AdminSearchResult) {
    setSearchQuery('');
    setSearchOpen(false);
    if (result.type === 'job') {
      openJob(result.id);
      return;
    }

    setScreen('officers');
    setOfficerProfileId(result.id);
    pushRoute(`/admin/officers?officer=${encodeURIComponent(result.id)}`);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setSearchOpen(false);
      event.currentTarget.blur();
      return;
    }
    if (!searchResults.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSearchIndex((index) => (index + 1) % searchResults.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSearchIndex((index) => (index - 1 + searchResults.length) % searchResults.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const result = searchResults[activeSearchIndex] ?? searchResults[0];
      if (result) selectSearchResult(result);
    }
  }

  function updateSearch(value: string) {
    setSearchByScreen((items) => ({ ...items, [screen]: value }));
  }

  function openSummaryJob(id: string) {
    setSummaryJobId(id);
    setScreen('summary');
    pushRoute(`/admin/summary/${encodeURIComponent(id)}`);
  }

  function closeSummaryJob() {
    setSummaryJobId(null);
    setScreen('summary');
    pushRoute('/admin/summary');
  }

  function updateJob(id: string, updater: (job: Job) => Job) {
    setJobs((items) => items.map((job) => (job.id === id ? normalizeJobStage(updater(job)) : normalizeJobStage(job))));
  }

  function openCreateJob() {
    setEditingJobId(null);
    setJobForm(emptyJobForm());
    setCreateOpen(true);
  }

  function openCreateOfficer() {
    setOfficerForm(emptyOfficerForm);
    setOfficerFormErrors({});
    setOfficerOpen(true);
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
      flash('Enter a customer and location first', 'error');
      return;
    }
    setSavingJob(true);
    try {
      const existing = editingJobId ? jobs.find((job) => job.id === editingJobId) : undefined;
      const job = editingJobId ? await updateJobFromForm(editingJobId, jobForm, existing) : await createJobFromForm(jobForm);
      setJobs((items) => (editingJobId ? items.map((item) => normalizeJobStage(item.id === job.id ? job : item)) : [normalizeJobStage(job), ...items.filter((item) => item.id !== job.id).map((item) => normalizeJobStage(item))]));
      setCreateOpen(false);
      setEditingJobId(null);
      setJobForm(emptyJobForm());
      openJob(job.id);
      flash(editingJobId ? `Job ${job.id} updated` : `Job ${job.id} created`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Check that the API and database are running.';
      flash(`Could not ${editingJobId ? 'update' : 'create'} job. ${reason}`, 'error');
    } finally {
      setSavingJob(false);
    }
  }

  async function addOfficerToJob(oid: string) {
    const officer = officers.find((item) => item.id === oid);
    if (!officer || officer.status === 'Blocked') return;
    if (selectedJob.officers.some((item) => item.oid === oid || item.oid === officer.code)) {
      flash('Officer already added to this job', 'error');
      return;
    }
    if (selectedJob.officers.length >= selectedJob.required) {
      flash(`Officer limit reached for ${selectedJob.id}`, 'error');
      return;
    }
    try {
      const updated = await assignOfficerToJob(selectedJob.id, oid, selectedJob);
      setJobs((items) => items.map((job) => normalizeJobStage(job.id === updated.id ? { ...job, ...updated } : job)));
      flash(`${officer.name} added`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Check that the API and database are running.';
      flash(`Could not add officer. ${reason}`, 'error');
    }
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

  async function markJobPosted(id: string) {
    const current = jobs.find((job) => job.id === id);
    updateJob(id, (job) => ({ ...job, posted: true }));
    try {
      const job = await markJobPostedInApi(id, current);
      setJobs((items) => items.map((item) => normalizeJobStage(item.id === id ? { ...item, ...job } : item)));
    } catch {
      flash('WhatsApp post saved locally only. API did not update.');
    }
  }

  async function cancelJob(id: string) {
    const current = jobs.find((job) => job.id === id);
    try {
      const job = await cancelJobInApi(id, current);
      setJobs((items) => items.map((item) => normalizeJobStage(item.id === id ? job : item)));
      flash('Job cancelled');
    } catch {
      flash('Could not cancel job. Check that the API is running.', 'error');
    }
  }

  async function completeJob(id: string) {
    const current = jobs.find((job) => job.id === id);
    try {
      const job = await completeJobInApi(id, current);
      setJobs((items) => {
        const existing = items.find((item) => item.id === id);
        const completed = normalizeJobStage({
          ...job,
          officers: (existing?.officers ?? job.officers).map((officer) => ({
            ...officer,
            confirmed: true,
            onDuty: true,
            actualStart: officer.actualStart || existing?.start || job.start,
            actualEnd: officer.actualEnd || existing?.end || job.end,
          })),
          photos: existing?.photos.length ? existing.photos : job.photos,
        });
        return [completed, ...items.filter((item) => item.id !== id).map((item) => normalizeJobStage(item))];
      });
      flash('Job marked as completed');
    } catch {
      flash('Could not complete job. Check that it is confirmed in the API.', 'error');
    }
  }

  function removeOfficerFromJob(oid: string) {
    const assigned = selectedJob.officers.find((officer) => officer.oid === oid);
    if (!assigned) return;
    if (assigned.confirmed || assigned.onDuty || assigned.actualStart || assigned.actualEnd) {
      flash('Cannot remove officer after confirmation, check-in, or on-duty status');
      return;
    }
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

  async function saveOfficer() {
    const errors = validateOfficerForm(officerForm);
    if (Object.keys(errors).length) {
      setOfficerFormErrors(errors);
      return;
    }
    setOfficerFormErrors({});
    setSavingOfficer(true);
    try {
      const officer = await createOfficerFromForm(officerForm);
      setOfficers((items) => [officer, ...items.filter((item) => item.id !== officer.id)]);
      setOfficerOpen(false);
      setOfficerForm(emptyOfficerForm);
      flash(`Officer ${officer.name} added`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Check that the API and database are running.';
      flash(`Could not add officer. ${reason}`, 'error');
    } finally {
      setSavingOfficer(false);
    }
  }

  async function updateOfficerProfile(id: string, form: OfficerForm) {
    if (!form.name.trim() || form.phone.replace(/[^0-9]/g, '').length < 6) {
      flash('Enter a name and valid WhatsApp number', 'error');
      return false;
    }
    try {
      const officer = await updateOfficerFromForm(id, form);
      setOfficers((items) => items.map((item) => (item.id === id ? officer : item)));
      setJobs((items) =>
        items.map((job) => ({
          ...job,
          officers: job.officers.map((assigned) =>
            assigned.oid === id
              ? {
                  ...assigned,
                  name: officer.name,
                  ic: officer.ic,
                  rate: officer.rate,
                }
              : assigned,
          ),
        })),
      );
      flash(`Officer ${officer.name} updated`);
      return true;
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Check that the API and database are running.';
      flash(`Could not update officer. ${reason}`, 'error');
      return false;
    }
  }

  async function deleteOfficerProfile(id: string) {
    const officer = officers.find((item) => item.id === id);
    if (officer?.status === 'Inactive') {
      flash('Inactive officers cannot be deleted.', 'error');
      return false;
    }

    setDeleteOfficerId(id);
    return false;
  }

  async function confirmOfficerDelete() {
    if (!deleteOfficerId) return;

    const id = deleteOfficerId;
    const officer = officers.find((item) => item.id === id);
    if (officer?.jobsCount) {
      flash('Officer has job history. Set the officer to Inactive instead.', 'error');
      return;
    }

    setDeletingOfficer(true);
    try {
      await deleteOfficer(id);
      setOfficers((items) => items.filter((item) => item.id !== id));
      setOfficerProfileId((value) => (value === id ? null : value));
      setDeleteOfficerId(null);
      flash(`Officer ${officer?.name ?? id} deleted`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Check that the API and database are running.';
      flash(`Could not delete officer. ${reason}`, 'error');
    } finally {
      setDeletingOfficer(false);
    }
  }

  async function deactivateOfficerProfile() {
    if (!deleteOfficerId || !deleteOfficerTarget) return;

    setDeletingOfficer(true);
    try {
      const officer = await updateOfficerFromForm(deleteOfficerId, {
        name: deleteOfficerTarget.name,
        phone: deleteOfficerTarget.phone,
        rate: String(deleteOfficerTarget.rate),
        ic: deleteOfficerTarget.ic,
        status: 'Inactive',
        notes: deleteOfficerTarget.notes ?? '',
      });
      setOfficers((items) => items.map((item) => (item.id === deleteOfficerId ? officer : item)));
      setJobs((items) =>
        items.map((job) => ({
          ...job,
          officers: job.officers.map((assigned) =>
            assigned.oid === deleteOfficerId
              ? {
                  ...assigned,
                  name: officer.name,
                  ic: officer.ic,
                  rate: officer.rate,
                }
              : assigned,
          ),
        })),
      );
      setDeleteOfficerId(null);
      flash(`Officer ${officer.name} set to Inactive`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Check that the API and database are running.';
      flash(`Could not update officer. ${reason}`, 'error');
    } finally {
      setDeletingOfficer(false);
    }
  }

  async function markPaid(id: string) {
    const localPayment = financePayments.find((payment) => payment.id === id);
    setPayments((items) => {
      if (items.some((payment) => payment.id === id)) {
        return items.map((payment) => (payment.id === id ? { ...payment, status: 'Paid', paidDate: TODAY } : payment));
      }
      return localPayment ? [{ ...localPayment, status: 'Paid', paidDate: TODAY }, ...items] : items;
    });

    if (id.startsWith('local:')) {
      flash('Payment marked as paid locally');
      return;
    }

    try {
      const updated = await markOfficerPaymentPaid(id);
      setPayments((items) => items.map((payment) => (payment.id === id ? updated : payment)));
      flash('Payment marked as paid');
    } catch {
      flash('Payment marked as paid locally - API unavailable', 'error');
    }
  }

  async function confirmBill() {
    if (!billTarget || !billForm.invoice.trim() || !billForm.billedDate) {
      flash('Enter invoice number and billed date', 'error');
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
      flash(`Could not mark billed. ${reason}`, 'error');
    }
  }

  const [crumb, title] = screenTitles[screen];
  const pageTitle = screen === 'jobDetail' ? selectedJob.id : title;

  const refreshDashboard = useCallback(async () => {
    try {
      setDashboardSnapshot(await fetchDashboard());
    } catch {
      // Keep the locally derived dashboard available until the next background retry.
    }
  }, []);

  useEffect(() => {
    void refreshDashboard();
    const timer = window.setInterval(() => void refreshDashboard(), 60_000);
    return () => window.clearInterval(timer);
  }, [refreshDashboard]);

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
    if (screen !== 'jobDetail' || selectedJob.siteManagerSignedAt || !selectedJob.officers.length || !selectedJob.officers.every((officer) => officer.actualEnd)) return;
    let cancelled = false;
    const refreshJob = () => {
      void fetchJob(selectedJob.id, selectedJob)
        .then((job) => {
          if (!cancelled) setJobs((items) => items.map((item) => normalizeJobStage(item.id === job.id ? { ...item, ...job } : item)));
        })
        .catch(() => {});
    };
    refreshJob();
    const timer = window.setInterval(refreshJob, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [screen, selectedJob.id, selectedJob.siteManagerSignedAt]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (stored) setPayments((items) => mergePaymentRows(JSON.parse(stored) as Payment[], items));
    } catch {
      // Keep seeded payments when local storage is unavailable or stale.
    }
    setPaymentsHydrated(true);
  }, []);

  useEffect(() => {
    if (!paymentsHydrated) return;
    try {
      window.localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
    } catch {
      // Ignore storage failures; the in-memory admin state still works.
    }
  }, [payments, paymentsHydrated]);

  useEffect(() => {
    if (!jobsHydrated) return;
    let cancelled = false;

    void fetchOfficers()
      .then((items) => {
        if (cancelled) return;
        setOfficers(items);
        setOfficersReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        // Keep seeded demo officers when the API is not running.
        setOfficersReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [jobsHydrated]);

  useEffect(() => {
    let cancelled = false;

    void fetchJobs(jobsSeed)
      .then((items) => {
        if (cancelled) return;
        setJobs((current) =>
          items.map((item) => {
            const existing = current.find((job) => job.id === item.id);
            return normalizeJobStage({
              ...item,
              officers: item.officers.length ? item.officers : existing?.officers ?? [],
              photos: item.photos.length ? item.photos : existing?.photos ?? [],
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
    if (!paymentsHydrated) return;
    let cancelled = false;

    void fetchOfficerPayments()
      .then((items) => {
        if (!cancelled) {
          setPayments((current) => mergeServerPayments(items, current));
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
  }, [paymentsHydrated]);

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
        <AdminAccountMenu />
      </aside>

      <main className="pn-main">
        <header className="pn-topbar">
          <div>
            <p>{crumb}</p>
            <h1>{pageTitle}</h1>
          </div>
          <div></div>
          {screen !== 'dashboard' && screen !== 'profile' ? (
            <div className="pn-search">
              <SearchIcon size={16} stroke="#A3A3A3" strokeWidth={2} />
              <input aria-label="Search" onChange={(event) => updateSearch(event.target.value)} placeholder={searchPlaceholder} value={search} />
            </div>
          ) : null}
          {screen === 'officers' ? (
            <Button variant="primary" onClick={openCreateOfficer}>
              <OfficersIcon size={16} strokeWidth={2.2} />
              Add officer
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={openCreateJob}
            >
              <PlusIcon size={16} strokeWidth={2.2} />
              Create Job
            </Button>
          )}
        </header>

        <div className={screen === 'profile' ? 'pn-content pn-profile-content' : 'pn-content'}>
          {screen === 'dashboard' ? (
            <DashboardScreen
              snapshot={dashboardSnapshot ?? fallbackDashboard}
              openCreateJob={openCreateJob}
              openJob={openJob}
              openJobs={openJobs}
              openBilling={openBilling}
              setScreen={navigateToScreen}
            />
          ) : null}
          {screen === 'jobs' ? <JobsScreen filter={jobFilter} jobs={jobs} openJob={openJob} queues={(dashboardSnapshot ?? fallbackDashboard).queues} search={search} setFilter={setJobFilter} /> : null}
          {screen === 'jobDetail' ? (
            <JobDetailScreen
              job={selectedJob}
              officers={officers}
              addOfficer={addOfficerToJob}
              completeJob={completeJob}
              cancelJob={cancelJob}
              copyText={copyText}
              markPhoto={markPhoto}
              markPosted={markJobPosted}
              onEdit={() => openEditJob(selectedJob)}
              openReport={() => setReportJobId(selectedJob.id)}
              removeOfficer={removeOfficerFromJob}
              setScreen={navigateToScreen}
              toggleOfficer={toggleOfficer}
            />
          ) : null}
          {screen === 'officers' ? (
            officersReady ? (
              <OfficersScreen
                officers={officersWithJobCounts}
                search={search}
                onDeleteOfficer={deleteOfficerProfile}
                openOfficerEdit={(id) => {
                  setOfficerProfileMode('edit');
                  setOfficerProfileId(id);
                }}
                openOfficerProfile={(id) => {
                  setOfficerProfileMode('view');
                  setOfficerProfileId(id);
                }}
              />
            ) : (
              <LoadingPanel />
            )
          ) : null}
          {screen === 'summary' ? (
            jobsReady ? <SummaryScreen closeSummaryJob={closeSummaryJob} detailJobId={summaryJobId} jobs={completedJobs} openSummaryJob={openSummaryJob} /> : <LoadingPanel />
          ) : null}
          {screen === 'payments' ? (paymentsReady ? <PaymentsScreen markPaid={markPaid} payments={financePayments} search={search} setPayOfficer={setPayOfficer} /> : <LoadingPanel />) : null}
          {screen === 'billing' ? (
            jobsReady && billingReady ? (
              <BillingScreen
                filter={billingFilter}
                jobs={completedJobs}
                openBill={(id) => {
                  setBillId(id);
                  setBillForm({ invoice: '', billedDate: TODAY });
                }}
                search={search}
                setFilter={setBillingFilter}
              />
            ) : (
              <LoadingPanel />
            )
          ) : null}
          {screen === 'reports' ? (jobsReady && paymentsReady && reportsReady ? <ReportsScreen jobs={jobs} officers={officers} payments={financePayments} report={operationsReport} search={search} /> : <LoadingPanel />) : null}
          {screen === 'profile' ? <ProfileScreen /> : null}
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
          onClose={() => {
            setOfficerOpen(false);
            setOfficerFormErrors({});
          }}
          footer={
            <>
              <Button
                onClick={() => {
                  setOfficerOpen(false);
                  setOfficerFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button disabled={savingOfficer} variant="primary" onClick={saveOfficer}>
                {savingOfficer ? 'Saving...' : 'Add officer'}
              </Button>
            </>
          }
        >
          <OfficerFormFields
            errors={officerFormErrors}
            form={officerForm}
            setForm={setOfficerForm}
            onFieldChange={(field) => setOfficerFormErrors((errors) => ({ ...errors, [field]: undefined }))}
          />
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

      {reportJob?.siteManagerSignedAt ? <JobReportModal job={reportJob} onClose={() => setReportJobId(null)} /> : null}
      {officerProfileId ? (
        <OfficerDetailModal
          initialMode={officerProfileMode}
          jobs={jobs}
          officer={officersWithJobCounts.find((officer) => officer.id === officerProfileId)}
          payments={financePayments}
          onClose={() => {
            setOfficerProfileId(null);
            setOfficerProfileMode('view');
          }}
          copyText={copyText}
          onDelete={deleteOfficerProfile}
          onSave={updateOfficerProfile}
          openJob={(id) => {
            setOfficerProfileId(null);
            openJob(id);
          }}
        />
      ) : null}
      {deleteOfficerId ? (
        <Modal
          title={deleteOfficerHasHistory ? 'Officer has job history' : 'Delete Officer'}
          subtitle={`${deleteOfficerTarget?.code ?? deleteOfficerId} / ${deleteOfficerTarget?.name ?? 'Officer'}`}
          onClose={() => {
            if (!deletingOfficer) setDeleteOfficerId(null);
          }}
          footer={
            <>
              <Button disabled={deletingOfficer} onClick={() => setDeleteOfficerId(null)}>
                Cancel
              </Button>
              {deleteOfficerHasHistory ? (
                <Button disabled={deletingOfficer} variant="primary" onClick={deactivateOfficerProfile}>
                  {deletingOfficer ? 'Setting inactive...' : 'Set Inactive'}
                </Button>
              ) : (
                <Button disabled={deletingOfficer} variant="danger" onClick={confirmOfficerDelete}>
                  {deletingOfficer ? 'Deleting...' : 'Delete Officer'}
                </Button>
              )}
            </>
          }
        >
          {deleteOfficerHasHistory ? (
            <>
              <p className="pn-modal-copy">
                {deleteOfficerTarget?.name ?? 'This officer'} has job history, so the record should stay available for assignments, payments, and reports.
              </p>
              <p className="pn-modal-note">
                Set the officer to Inactive to remove them from future operational use.
              </p>
            </>
          ) : (
            <p className="pn-modal-copy">
              Delete {deleteOfficerTarget?.name ?? 'this officer'}? This cannot be undone.
            </p>
          )}
        </Modal>
      ) : null}
      {payOfficer ? <PaymentHistoryModal officer={payOfficer} payments={financePayments} onClose={() => setPayOfficer(null)} openJob={openJob} /> : null}
      {toast ? (
        <div className={`pn-toast pn-toast-${toast.tone}`} role="status" aria-live="polite">
          {toast.tone === 'success' ? <CheckIcon size={17} strokeWidth={2.4} /> : null}
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

function LoadingPanel() {
  return <div className="pn-empty">Loading...</div>;
}

function JobFormFields({ form, setForm }: { form: JobForm; setForm: (updater: (form: JobForm) => JobForm) => void }) {
  const required = Math.max(1, Math.trunc(Number(form.required) || 1));

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
        <div className="pn-job-officers-row">
          <input min="1" max={MAX_JOB_OFFICERS} step="1" type="number" value={form.required} onChange={(event) => setForm((item) => ({ ...item, required: event.target.value }))} />
          <button className="pn-btn pn-btn-secondary" disabled={required >= MAX_JOB_OFFICERS} onClick={() => setForm((item) => ({ ...item, required: String(Math.min(MAX_JOB_OFFICERS, required + 1)) }))} type="button">
            <PlusIcon size={14} strokeWidth={2.4} />
            Add Officer
          </button>
        </div>
      </Field>
      <Field label="Description">
        <textarea className="pn-job-textarea" placeholder="What is the job?" rows={4} value={form.description} onChange={(event) => setForm((item) => ({ ...item, description: event.target.value }))} />
      </Field>
      <Field label="Instructions">
        <textarea className="pn-job-textarea" placeholder="Dress code, reporting point, etc." rows={4} value={form.instructions} onChange={(event) => setForm((item) => ({ ...item, instructions: event.target.value }))} />
      </Field>
    </div>
  );
}

function OfficerFormFields({
  form,
  setForm,
  errors = {},
  onFieldChange,
}: {
  form: OfficerForm;
  setForm: (updater: (form: OfficerForm) => OfficerForm) => void;
  errors?: OfficerFormErrors;
  onFieldChange?: (field: keyof OfficerFormErrors) => void;
}) {
  const nameErrorId = errors.name ? 'officer-name-error' : undefined;
  const phoneErrorId = errors.phone ? 'officer-phone-error' : undefined;

  return (
    <div className="pn-form-grid">
      <Field label="Full name" required error={errors.name} errorId={nameErrorId}>
        <input
          aria-describedby={nameErrorId}
          aria-invalid={Boolean(errors.name)}
          placeholder="e.g. Ravi Chandran"
          value={form.name}
          onChange={(event) => {
            onFieldChange?.('name');
            setForm((item) => ({ ...item, name: event.target.value }));
          }}
        />
      </Field>
      <Field label="WhatsApp number" required error={errors.phone} errorId={phoneErrorId}>
        <input
          aria-describedby={phoneErrorId}
          aria-invalid={Boolean(errors.phone)}
          className="pn-mono-input"
          placeholder="+65 8123 4567"
          value={form.phone}
          onChange={(event) => {
            onFieldChange?.('phone');
            setForm((item) => ({ ...item, phone: event.target.value }));
          }}
        />
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

function JobReportModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const scheduled = hours(job.start, job.end);
  const received = job.photos.filter((photo) => photo.status === 'received');
  const officerReports = job.officers.map((officer) => {
    const worked = officer.actualStart && officer.actualEnd ? hours(officer.actualStart, officer.actualEnd) : scheduled;
    const actualHours = `${officer.actualStart || '--:--'} - ${officer.actualEnd || '--:--'}`;
    const evidencePhotos = job.photos.filter((photo) => photo.by === officer.name).length;
    return { officer, worked, actualHours, evidencePhotos, payable: worked * officer.rate };
  });
  const totalPay = officerReports.reduce((sum, report) => sum + report.payable, 0);
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
          <button onClick={() => void downloadPdfReport(reportRef.current, job.id)} type="button">
            <DownloadIcon size={14} strokeWidth={2} />
            Download
          </button>
        </div>
      }
    >
      <div className="pn-report" ref={reportRef}>
        <header className="pn-report-letterhead">
          <span className="pn-report-logo" aria-hidden="true" />
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

async function downloadPdfReport(report: HTMLElement | null, jobId: string) {
  if (!report) return;
  const image = await reportImage(report);
  const pdf = imagePdf(image.bytes, image.width, image.height);
  const url = URL.createObjectURL(pdf);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${jobId.replace(/[^a-z0-9-]/gi, '_')}-completion-report.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

async function reportImage(report: HTMLElement) {
  const width = 794;
  const height = Math.max(Math.ceil((report.scrollHeight / report.getBoundingClientRect().width) * width), 1123);
  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');
  const printStyles = `
    .pn-pdf-export {
      width: ${width}px;
      min-height: ${height}px;
      background: #fff;
      color: #0A0A0A;
      box-sizing: border-box;
    }
    .pn-pdf-export .pn-report {
      display: block;
      position: static;
      inset: auto;
      width: 100%;
      max-width: none;
      color: #0A0A0A;
      background: #fff;
      padding: 52px 56px 0;
      box-sizing: border-box;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .pn-pdf-export .pn-report-letterhead,
    .pn-pdf-export .pn-report-title-row,
    .pn-pdf-export .pn-report-officer-main,
    .pn-pdf-export .pn-report-officer-meta {
      align-items: center;
      flex-direction: row;
    }
    .pn-pdf-export .pn-report-letterhead aside,
    .pn-pdf-export .pn-report-pay {
      text-align: right;
    }
    .pn-pdf-export .pn-report-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    .pn-pdf-export .pn-report-notes {
      grid-template-columns: 1fr 1fr;
    }
    .pn-pdf-export .pn-report-grid > div {
      border-right: 1px solid #E5E5E5;
      border-bottom: 0;
    }
    .pn-pdf-export .pn-report-grid > div:last-child {
      border-right: 0;
    }
    .pn-pdf-export .pn-report-grid,
    .pn-pdf-export .pn-report-notes,
    .pn-pdf-export .pn-report-officer,
    .pn-pdf-export .pn-report-footer,
    .pn-pdf-export .pn-report-empty {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  `;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" class="pn-pdf-export"><style>${styles}${printStyles}</style>${report.outerHTML}</div></foreignObject></svg>`;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();

  const scale = Math.min(2, 1800 / width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create PDF canvas');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const base64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1] ?? '';
  return { bytes: base64Bytes(base64), width: canvas.width, height: canvas.height };
}

function imagePdf(jpeg: Uint8Array, imageWidth: number, imageHeight: number) {
  const pageWidth = 595;
  const pageHeight = 842;
  const scale = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const content = `1 1 1 rg\n0 0 ${pageWidth} ${pageHeight} re f\nq\n${drawWidth} 0 0 ${drawHeight} ${(pageWidth - drawWidth) / 2} ${pageHeight - drawHeight} cm\n/Im1 Do\nQ`;
  const encoder = new TextEncoder();
  const objects: (string | Uint8Array)[][] = [
    ['<< /Type /Catalog /Pages 2 0 R >>'],
    ['<< /Type /Pages /Kids [3 0 R] /Count 1 >>'],
    [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>`],
    [`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, jpeg, '\nendstream'],
    [`<< /Length ${content.length} >>\nstream\n${content}\nendstream`],
  ];
  const header = encoder.encode('%PDF-1.4\n');
  const chunks: Uint8Array[] = [header];
  const offsets = [0];
  let length = header.length;

  objects.forEach((body, index) => {
    offsets.push(length);
    const objectChunks = [encoder.encode(`${index + 1} 0 obj\n`), ...body.map((part) => (typeof part === 'string' ? encoder.encode(part) : part)), encoder.encode('\nendobj\n')];
    objectChunks.forEach((chunk) => {
      chunks.push(chunk);
      length += chunk.length;
    });
  });

  const xref = length;
  const footer = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  chunks.push(encoder.encode(footer));
  return new Blob(chunks.map(blobBuffer), { type: 'application/pdf' });
}

function blobBuffer(chunk: Uint8Array) {
  const copy = new Uint8Array(chunk.byteLength);
  copy.set(chunk);
  return copy.buffer as ArrayBuffer;
}

function base64Bytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
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
  const rows = payments.filter((payment) => payment.officer === officer).sort((a, b) => b.jobDate.localeCompare(a.jobDate) || b.jobId.localeCompare(a.jobId));
  const paidTotal = rows.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.hours * payment.rate, 0);
  const pendingTotal = rows.filter((payment) => payment.status === 'Pending').reduce((sum, payment) => sum + payment.hours * payment.rate, 0);
  const lifetimeTotal = paidTotal + pendingTotal;

  return (
    <Modal title={officer} onClose={onClose} wide hideHeader>
      <div className="pn-payment-history">
        <header className="pn-payment-history-head">
          <span className="pn-payment-history-avatar">{initials(officer)}</span>
          <div>
            <h2>{officer}</h2>
            <p>Payment history / {rows.length} record{rows.length === 1 ? '' : 's'}</p>
          </div>
          <button className="pn-icon-btn" onClick={onClose} type="button" aria-label="Close">
            x
          </button>
        </header>

        <div className="pn-payment-history-body">
          <div className="pn-payment-history-stats">
            <div>
              <span>Total paid</span>
              <strong className="is-paid">{money(paidTotal)}</strong>
            </div>
            <div>
              <span>Pending</span>
              <strong className="is-pending">{money(pendingTotal)}</strong>
            </div>
            <div>
              <span>Lifetime</span>
              <strong>{money(lifetimeTotal)}</strong>
            </div>
          </div>

          {rows.length ? (
            <div className="pn-table pn-table-payment-history">
              <div className="pn-table-head">
                <span>Job</span>
                <span>Job date</span>
                <span>Hrs</span>
                <span>Rate</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              {rows.map((payment) => {
                const total = payment.hours * payment.rate;
                return (
                  <button
                    className="pn-table-row pn-click-row"
                    key={payment.id}
                    onClick={() => {
                      onClose();
                      openJob(payment.jobId);
                    }}
                    type="button"
                  >
                    <span className="pn-mono">{payment.jobId}</span>
                    <span>{dateLabel(payment.jobDate)}</span>
                    <span>{payment.hours.toFixed(2)}h</span>
                    <span className="pn-mono">{money(payment.rate)}</span>
                    <span className="pn-mono">{money(total)}</span>
                    <span>
                      <Badge tone={payment.status === 'Paid' ? 'success' : 'warning'}>{payment.status}</Badge>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="pn-empty">No payment history recorded for this officer yet.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}
