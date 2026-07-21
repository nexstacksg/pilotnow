import { describe, expect, it } from 'vitest';
import { buildOfficerHistoryRows } from './officer-history';
import type { OfficerAssignmentHistory } from './officers-api';
import type { Job, Officer, Payment } from '../types';

const officer: Officer = {
  id: 'officer-1',
  code: 'OF-19',
  name: 'Eaint',
  phone: '+9595301905',
  status: 'Active',
  ic: true,
  rate: 20,
  jobsCount: 2,
};

const payments: Payment[] = [];

const apiHistory: OfficerAssignmentHistory[] = [
  {
    id: 'assignment-1',
    jobId: 'PN-2078',
    customerName: 'ABC Construction Pte Ltd',
    siteName: 'Tuas',
    date: '2026-07-20',
    rate: 20,
    hours: 8,
    payable: 160,
    status: 'Completed',
    paymentStatus: 'Pending',
  },
];

function localJob(id: string, date: string): Job {
  return {
    id,
    customer: 'Next Job Customer',
    location: 'Jurong',
    date,
    start: '09:00',
    end: '17:00',
    required: 1,
    status: 'Assigned',
    posted: true,
    description: '',
    instructions: '',
    cancelReason: '',
    officers: [
      {
        oid: officer.id,
        name: officer.name,
        ic: officer.ic,
        rate: officer.rate,
        confirmed: false,
        onDuty: false,
        actualStart: '',
        actualEnd: '',
      },
    ],
    photos: [],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
  };
}

describe('officer history helpers', () => {
  it('keeps locally added job assignments when API history already exists', () => {
    const rows = buildOfficerHistoryRows({
      assignmentHistory: apiHistory,
      jobs: [localJob('PN-2099', '2026-07-22')],
      officer,
      payments,
    });

    expect(rows.map((row) => row.jobId)).toEqual(['PN-2099', 'PN-2078']);
  });
});
