import { describe, expect, it } from 'vitest';
import { completedBillingMessage } from './BillingScreen';
import type { Job } from '../types';

const job = (billing: Job['billing']): Job => ({
  id: 'PN-1',
  customer: 'Acme',
  location: 'Jurong',
  date: '2026-07-21',
  start: '09:00',
  end: '18:00',
  required: 1,
  status: 'Completed',
  billing,
  posted: true,
  officers: [],
  photos: [],
  invoice: '',
  billedDate: '',
  cancelReason: '',
  description: '',
  instructions: '',
});

describe('completedBillingMessage', () => {
  it('shows a completed job ready message for one unbilled job', () => {
    expect(completedBillingMessage([job('Not Billed')])).toBe('1 completed job ready for billing.');
  });

  it('shows billed when all completed jobs are billed', () => {
    expect(completedBillingMessage([job('Billed')])).toBe('1 completed job billed.');
  });
});
