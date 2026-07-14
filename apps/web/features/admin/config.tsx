import type { ReactNode } from 'react';
import {
  BillingIcon,
  DashboardIcon,
  JobsIcon,
  OfficersIcon,
  PaymentIcon,
  ReportsIcon,
  SummaryIcon,
} from './components/icons';
import type { JobForm, OfficerForm, Screen } from './types';

export const navIcons: Record<Exclude<Screen, 'profile'>, ReactNode> = {
  dashboard: <DashboardIcon />,
  jobs: <JobsIcon />,
  jobDetail: <JobsIcon />,
  officers: <OfficersIcon />,
  summary: <SummaryIcon />,
  payments: <PaymentIcon />,
  billing: <BillingIcon />,
  reports: <ReportsIcon />,
};

export const navGroups: { label: string; items: { screen: Screen; label: string }[] }[] = [
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

export const emptyJobForm: JobForm = {
  customer: '',
  location: '',
  date: '2026-07-12',
  start: '09:00',
  end: '18:00',
  required: '2',
  description: '',
  instructions: '',
};

export const emptyOfficerForm: OfficerForm = {
  name: '',
  phone: '+65 ',
  rate: '16',
  ic: false,
  status: 'New',
  notes: '',
};

export const screenTitles: Record<Screen, [string, string]> = {
  dashboard: ['Overview', 'Dashboard'],
  jobs: ['Operations', 'Jobs'],
  jobDetail: ['Operations / Jobs', ''],
  officers: ['People', 'Officer Management'],
  summary: ['Finance', 'Completed Job Summary'],
  payments: ['Finance', 'Officer Payment'],
  billing: ['Finance', 'Customer Billing'],
  reports: ['Insights', 'Reports'],
  profile: ['Account', 'Profile'],
};
