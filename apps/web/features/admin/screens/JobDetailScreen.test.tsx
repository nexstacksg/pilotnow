import { describe, expect, it } from 'vitest';
import { jobDetailSignedCompletionMessage } from './JobDetailScreen';
import type { Job } from '../types';

const job = (overrides: Partial<Job> = {}): Job => ({
  id: 'PN-1',
  customer: 'Acme',
  location: 'Jurong',
  date: '2026-07-21',
  start: '09:00',
  end: '18:00',
  required: 1,
  status: 'Completed',
  billing: 'Not Billed',
  posted: true,
  officers: [],
  photos: [],
  invoice: '',
  billedDate: '',
  cancelReason: '',
  description: '',
  instructions: '',
  ...overrides,
});

describe('jobDetailSignedCompletionMessage', () => {
  it('shows a completed message after site manager sign-off', () => {
    expect(jobDetailSignedCompletionMessage(job({ siteManagerSignedAt: '2026-07-21T09:00:00Z', siteManagerSignedBy: 'May Tan' }))).toBe('Job completed. Site manager sign-off captured by May Tan.');
  });

  it('does not replace sign-off actions before signature is captured', () => {
    expect(jobDetailSignedCompletionMessage(job())).toBe('');
  });
});
