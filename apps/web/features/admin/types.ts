export type Screen =
  | 'dashboard'
  | 'jobs'
  | 'jobDetail'
  | 'officers'
  | 'summary'
  | 'payments'
  | 'billing'
  | 'reports'
  | 'profile';

export type JobStatus =
  | 'Draft Created'
  | 'Posted/Waiting'
  | 'Officers confirmed'
  | 'Job ongoing'
  | 'Awaiting sign-off'
  | 'Completed'
  | 'Cancelled';

export type JobListFilter = JobStatus | 'All' | 'Today' | 'Needs staffing' | 'Missing photos';
export type BillingFilter = 'All' | 'Not Billed' | 'Billed';

export type BillingStatus = 'Billed' | 'Not Billed';
export type OfficerStatus = 'New' | 'Active' | 'Inactive' | 'Blocked';
export type PaymentStatus = 'Pending' | 'Paid';
export type PhotoStatus = 'received' | 'missing' | 'upcoming';

export type JobOfficer = {
  oid: string;
  name: string;
  phone?: string;
  ic: boolean;
  rate: number;
  confirmed: boolean;
  onDuty: boolean;
  actualStart: string;
  actualEnd: string;
};

export type PhotoCheckpoint = {
  time: string;
  status: PhotoStatus;
  by: string;
  at: string;
  mediaRef?: string;
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
  cancelReason: string;
  officers: JobOfficer[];
  photos: PhotoCheckpoint[];
  billing: BillingStatus;
  invoice: string;
  billedDate: string;
};

export type Officer = {
  id: string;
  code?: string;
  name: string;
  phone: string;
  status: OfficerStatus;
  ic: boolean;
  rate: number;
  jobsCount: number;
  notes?: string;
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

export type JobForm = {
  customer: string;
  location: string;
  date: string;
  start: string;
  end: string;
  required: string;
  description: string;
  instructions: string;
};

export type OfficerForm = {
  name: string;
  phone: string;
  rate: string;
  ic: boolean;
  status: OfficerStatus;
  notes: string;
};

export type BillForm = {
  invoice: string;
  billedDate: string;
};
