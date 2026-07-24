import { describe, expect, it } from 'vitest';
import { distanceMetres, jobDetailSignedCompletionMessage } from './JobDetailScreen';
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

describe('distanceMetres', () => {
  it('returns zero for the same point', () => {
    expect(distanceMetres(1.2644, 103.82213, 1.2644, 103.82213)).toBe(0);
  });

  it('measures a latitude difference in metres', () => {
    expect(distanceMetres(1.2644, 103.82213, 1.2654, 103.82213)).toBeCloseTo(111.2, 0);
  });
});

describe('jobDetailSignedCompletionMessage', () => {
  it('shows a completed message after site manager sign-off', () => {
    expect(jobDetailSignedCompletionMessage(job({ siteManagerSignedAt: '2026-07-21T09:00:00Z', siteManagerSignedBy: 'May Tan' }))).toBe('Job completed. Site manager sign-off captured by May Tan.');
  });

  it('does not replace sign-off actions before signature is captured', () => {
    expect(jobDetailSignedCompletionMessage(job())).toBe('');
  });
});
