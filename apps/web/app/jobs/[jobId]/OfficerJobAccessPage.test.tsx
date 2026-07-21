import { describe, expect, it } from 'vitest';
import { attendanceBlocker, isValidPosition, siteLocation } from './OfficerJobAccessPage';

describe('officer attendance readiness', () => {
  it('requires a proof photo and real GPS coordinates', () => {
    expect(attendanceBlocker(0, null)).toBe('Add at least 1 proof photo to continue.');
    expect(attendanceBlocker(1, null)).toBe('Proof photo added. GPS location is still required before you can confirm.');
    expect(isValidPosition({ latitude: 0, longitude: 0 })).toBe(false);
    expect(attendanceBlocker(1, { latitude: 1.2939, longitude: 103.856 })).toBe('');
  });

  it('does not duplicate identical site and address text', () => {
    expect(siteLocation('25 Jalan Kayu Singapore 799449', '25 Jalan Kayu Singapore 799449')).toBe('25 Jalan Kayu Singapore 799449');
    expect(siteLocation('Pilot Now', '25 Jalan Kayu Singapore 799449')).toBe('Pilot Now, 25 Jalan Kayu Singapore 799449');
  });
});
