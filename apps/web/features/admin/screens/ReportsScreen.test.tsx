import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsScreen } from './ReportsScreen';
import type { OperationsReport } from '../lib/reports-api';
import type { Job, Officer, Payment } from '../types';

const officers: Officer[] = [
  { id: 'officer-1', name: 'John Tan', phone: '+65 9000 0001', status: 'Active', ic: true, rate: 18, jobsCount: 2 },
  { id: 'officer-2', name: 'Mei Lin', phone: '+65 9000 0002', status: 'Active', ic: true, rate: 20, jobsCount: 1 },
];

const jobs: Job[] = [
  makeJob({
    id: 'PN-001',
    customer: 'Acme Pte Ltd',
    location: 'Jurong',
    date: '2026-07-08',
    officers: [makeOfficer({ oid: 'officer-1', name: 'John Tan', rate: 18, actualStart: '09:00', actualEnd: '17:00' })],
    photos: [{ time: '12:00', status: 'missing', by: 'John Tan', at: '', note: 'Lunch checkpoint missing' }],
    billing: 'Not Billed',
  }),
  makeJob({
    id: 'PN-002',
    customer: 'Beta Logistics',
    location: 'Tuas',
    date: '2026-07-09',
    officers: [makeOfficer({ oid: 'officer-2', name: 'Mei Lin', rate: 20, actualStart: '10:00', actualEnd: '14:00' })],
    billing: 'Billed',
    invoice: 'INV-002',
    billedDate: '2026-07-10',
  }),
  makeJob({
    id: 'PN-003',
    customer: 'Crest Retail',
    location: 'Woodlands',
    date: '2026-07-10',
    status: 'Job ongoing',
    officers: [makeOfficer({ oid: 'officer-1', name: 'John Tan' })],
    photos: [{ time: '15:00', status: 'missing', by: '', at: '' }],
  }),
];

const payments: Payment[] = [
  { id: 'pay-1', officer: 'John Tan', jobId: 'PN-001', jobDate: '2026-07-08', hours: 8, rate: 18, status: 'Pending', paidDate: '' },
  { id: 'pay-2', officer: 'Mei Lin', jobId: 'PN-002', jobDate: '2026-07-09', hours: 4, rate: 20, status: 'Paid', paidDate: '2026-07-10' },
];

function makeOfficer(overrides: Partial<Job['officers'][number]> = {}): Job['officers'][number] {
  return {
    oid: 'officer',
    name: 'Officer',
    ic: true,
    rate: 18,
    confirmed: true,
    onDuty: true,
    actualStart: '',
    actualEnd: '',
    ...overrides,
  };
}

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'PN-000',
    customer: 'Customer',
    location: 'Site',
    date: '2026-07-08',
    start: '09:00',
    end: '17:00',
    required: 1,
    status: 'Completed',
    posted: true,
    description: '',
    instructions: '',
    cancelReason: '',
    officers: [],
    photos: [],
    billing: 'Not Billed',
    invoice: '',
    billedDate: '',
    ...overrides,
  };
}

function renderReports(props: Partial<Parameters<typeof ReportsScreen>[0]> = {}) {
  return render(<ReportsScreen jobs={jobs} officers={officers} payments={payments} report={null} search="" {...props} />);
}

describe('ReportsScreen', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders completed job report rows and summary by default', () => {
    renderReports();

    expect(screen.getByRole('button', { name: 'Completed job report' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Completed job report' })).toBeInTheDocument();
    expect(screen.getByText('PN-001')).toBeInTheDocument();
    expect(screen.getByText('Acme Pte Ltd')).toBeInTheDocument();
    expect(screen.getByText('S$144.00')).toBeInTheDocument();
    expect(screen.getByText('2 completed job(s), Total payroll: S$224.00')).toBeInTheDocument();
  });

  it('switches between payment, missing photo, billing, and officer history reports', async () => {
    renderReports();

    await userEvent.click(screen.getByRole('button', { name: 'Officer payment report' }));
    expect(screen.getByRole('heading', { name: 'Officer payment report' })).toBeInTheDocument();
    expect(screen.getByText('Total payroll: S$224.00, 1 pending payout(s), 1 paid payout(s)')).toBeInTheDocument();
    expect(screen.getByText('8.00h')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Missing photo report' }));
    expect(screen.getByText('Lunch checkpoint missing')).toBeInTheDocument();
    expect(screen.getByText('Missing checkpoint photo')).toBeInTheDocument();
    expect(screen.getByText('2 missing checkpoint(s)')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Customer billing report' }));
    expect(screen.getByText('INV-002')).toBeInTheDocument();
    expect(screen.getByText('1 job(s) not yet billed')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Officer job history report' }));
    expect(screen.getByText('2 officers on record')).toBeInTheDocument();
    expect(screen.getAllByText('John Tan')).not.toHaveLength(0);
  });

  it('filters report rows by search text and date range', async () => {
    const { rerender } = renderReports({ search: 'beta' });

    expect(screen.getByText('PN-002')).toBeInTheDocument();
    expect(screen.queryByText('PN-001')).not.toBeInTheDocument();
    expect(screen.getByText('1 completed job(s), Total payroll: S$80.00')).toBeInTheDocument();

    rerender(<ReportsScreen jobs={jobs} officers={officers} payments={payments} report={null} search="" />);
    await userEvent.clear(screen.getByLabelText('Report start date'));
    await userEvent.type(screen.getByLabelText('Report start date'), '2026-07-09');

    await waitFor(() => expect(screen.queryByText('PN-001')).not.toBeInTheDocument());
    expect(screen.getByText('PN-002')).toBeInTheDocument();
    expect(screen.getByText('1 completed job(s), Total payroll: S$80.00')).toBeInTheDocument();
  });

  it('uses live completed report rows when there is no local match', () => {
    const report: OperationsReport = {
      metrics: { completedJobs: 1, totalPayroll: 300, missingCheckpoints: 0, officers: 2 },
      completedJobs: [
        { id: 'PN-999', customer: 'Delta Services', site: 'Changi', date: '2026-07-09', officers: 3, totalPayable: 300, billingStatus: 'NOT_BILLED' },
      ],
    };

    renderReports({ report });

    expect(screen.getByText('PN-999')).toBeInTheDocument();
    expect(screen.getByText('Delta Services')).toBeInTheDocument();
    expect(screen.getByText('S$300.00')).toBeInTheDocument();
  });

  it('exports the active report as CSV', async () => {
    let exportedBlob: Blob | undefined;
    const createObjectURL = vi.fn((blob: Blob) => {
      exportedBlob = blob;
      return 'blob:report-csv';
    });
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createdLinks: HTMLAnchorElement[] = [];

    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      const element = originalCreateElement(tagName, options);
      if (tagName === 'a') {
        createdLinks.push(element as HTMLAnchorElement);
        vi.spyOn(element as HTMLAnchorElement, 'click').mockImplementation(click);
      }
      return element;
    });

    renderReports();
    await userEvent.click(screen.getByRole('button', { name: /Export/ }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(exportedBlob).toBeInstanceOf(Blob);
    const csv = await exportedBlob!.text();
    expect(csv).toContain('"Completed job report"');
    expect(csv).toContain('"Job","Customer","Date","Officers","Total payable"');
    expect(createdLinks[0]?.download).toBe('completed-job-report.csv');
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report-csv');
  });
});
