import type { LucideIcon } from 'lucide-react';

export type JobStatus = 'Draft' | 'Waiting for Officers' | 'Confirmed' | 'Ongoing' | 'Completed' | 'Cancelled';
export type BillingStatus = 'Billed' | 'Not Billed';
export type PaymentStatus = 'Paid' | 'Pending';

export type Officer = {
  id: string;
  name: string;
  phone: string;
  status: 'New' | 'Active' | 'Inactive' | 'Blocked';
  ic: boolean;
  rate: number;
  jobsCount: number;
};

export type JobOfficer = {
  oid: string;
  name: string;
  ic: 'Yes' | 'No';
  rate: number;
  confirmed: boolean;
  onDuty: boolean;
  actualStart: string;
  actualEnd: string;
};

export type PhotoSlot = {
  time: string;
  status: 'received' | 'missing' | 'upcoming';
  by?: string;
  at?: string;
  note?: string;
};

export type Job = {
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

export type RequestRow = {
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

export type Payment = {
  id: string;
  officer: string;
  jobId: string;
  jobDate: string;
  hours: number;
  rate: number;
  status: PaymentStatus;
  paidDate: string;
};

export type RouteKey =
  | 'dashboard'
  | 'requests'
  | 'jobs'
  | 'jobDetail'
  | 'shift'
  | 'officers'
  | 'summary'
  | 'payments'
  | 'billing'
  | 'reports';

export type NavGroup = {
  section: string;
  items: {
    key: RouteKey;
    href: string;
    label: string;
    icon: LucideIcon;
  }[];
};
