import type { Job, Officer, Payment } from './types';

export const officersSeed: Officer[] = [
  { id: 'OF-01', name: 'Rajesh Kumar', phone: '+65 8123 4567', status: 'Active', ic: true, rate: 16, jobsCount: 34 },
  { id: 'OF-02', name: 'Muhammad Faizal', phone: '+65 9231 7788', status: 'Active', ic: true, rate: 15, jobsCount: 22 },
  { id: 'OF-03', name: 'Tan Wei Ming', phone: '+65 8890 2211', status: 'Active', ic: true, rate: 18, jobsCount: 41 },
  { id: 'OF-04', name: 'Arjun Nair', phone: '+65 9022 5610', status: 'New', ic: false, rate: 14, jobsCount: 0 },
  { id: 'OF-05', name: 'Lim Jun Hao', phone: '+65 8455 9832', status: 'Active', ic: true, rate: 17, jobsCount: 15 },
  { id: 'OF-06', name: 'Siti Nurhaliza', phone: '+65 9188 3345', status: 'Inactive', ic: true, rate: 16, jobsCount: 9 },
  { id: 'OF-07', name: 'Kwok Ah Seng', phone: '+65 8321 0099', status: 'Blocked', ic: true, rate: 15, jobsCount: 6 },
];

export const jobsSeed: Job[] = [];

export const paymentsSeed: Payment[] = [];
