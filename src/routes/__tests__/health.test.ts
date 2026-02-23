import { describe, expect, it } from 'vitest';
import { app } from '../../app.js';

describe('GET /health', () => {
  it('returns 200', async () => {
    const response = await app.request('/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});
