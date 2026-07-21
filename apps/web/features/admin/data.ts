import type { Job, Officer, Payment } from './types';

export const officersSeed: Officer[] = [
  { id: 'OF-01', name: 'Rajesh Kumar', phone: '+65 8123 4567', status: 'Active', ic: true, rate: 16, jobsCount: 34 },
  { id: 'OF-02', name: 'Muhammad Faizal', phone: '+65 9231 7788', status: 'Active', ic: true, rate: 15, jobsCount: 22 },
  { id: 'OF-03', name: 'Tan Wei Ming', phone: '+65 8890 2211', status: 'Active', ic: true, rate: 18, jobsCount: 41 },
  { id: 'OF-04', name: 'Arjun Nair', phone: '+65 9022 5610', status: 'New', ic: false, rate: 14, jobsCount: 0 },
  { id: 'OF-05', name: 'Lim Jun Hao', phone: '+65 8455 9832', status: 'Active', ic: true, rate: 17, jobsCount: 15 },
  { id: 'OF-06', name: 'Siti Nurhaliza', phone: '+65 9188 3345', status: 'Inactive', ic: true, rate: 16, jobsCount: 9 },
  { id: 'OF-07', name: 'Kwok Ah Seng', phone: '+65 8321 0099', status: 'Blocked', ic: true, rate: 15, jobsCount: 6 },
  { id: 'OF-08', name: 'Deepak Raj', phone: '+65 9077 4521', status: 'Active', ic: true, rate: 19, jobsCount: 28 },
];

export const jobsSeed: Job[] = [];

export const paymentsSeed: Payment[] = [
  { id: 'PY-01', officer: 'Tan Wei Ming', jobId: 'PN-2044', jobDate: '2026-07-07', hours: 12, rate: 18, status: 'Pending', paidDate: '' },
  { id: 'PY-02', officer: 'Lim Jun Hao', jobId: 'PN-2044', jobDate: '2026-07-07', hours: 12.08, rate: 17, status: 'Pending', paidDate: '' },
  { id: 'PY-03', officer: 'Rajesh Kumar', jobId: 'PN-2045', jobDate: '2026-07-06', hours: 8, rate: 16, status: 'Paid', paidDate: '2026-07-07' },
  { id: 'PY-04', officer: 'Muhammad Faizal', jobId: 'PN-2045', jobDate: '2026-07-06', hours: 8.08, rate: 15, status: 'Paid', paidDate: '2026-07-07' },
  { id: 'PY-05', officer: 'Deepak Raj', jobId: 'PN-2045', jobDate: '2026-07-06', hours: 7.83, rate: 19, status: 'Paid', paidDate: '2026-07-07' },
  { id: 'PY-06', officer: 'Tan Wei Ming', jobId: 'PN-2039', jobDate: '2026-07-02', hours: 9, rate: 18, status: 'Paid', paidDate: '2026-07-03' },
  { id: 'PY-07', officer: 'Tan Wei Ming', jobId: 'PN-2035', jobDate: '2026-06-27', hours: 8, rate: 18, status: 'Paid', paidDate: '2026-06-28' },
  { id: 'PY-08', officer: 'Tan Wei Ming', jobId: 'PN-2030', jobDate: '2026-06-20', hours: 10, rate: 17, status: 'Paid', paidDate: '2026-06-21' },
  { id: 'PY-09', officer: 'Tan Wei Ming', jobId: 'PN-2026', jobDate: '2026-06-14', hours: 12, rate: 17, status: 'Paid', paidDate: '2026-06-15' },
];
