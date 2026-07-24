import { createHmac, timingSafeEqual } from 'node:crypto';
import { createDb, schema } from '@pilotnow/db';
import { JOB_STATUS, BILLING_STATUS, RECORD_STATE } from '@pilotnow/shared';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';

const jobStatus = z.enum(JOB_STATUS);
const billingStatus = z.enum(BILLING_STATUS);
const recordState = z.enum(RECORD_STATE);
const uuid = z.string().uuid();

const jobCreate = z
  .object({
    customerId: uuid.optional(),
    customerName: z.string().trim().min(1).optional(),
    siteId: uuid.optional(),
    siteName: z.string().trim().min(1).optional(),
    siteAddress: z.string().trim().optional(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    headcountRequired: z.number().int().positive().default(1),
    instructions: z.string().trim().optional(),
    requestSource: z.string().trim().optional(),
    requestRaw: z.string().trim().optional(),
  })
  .refine((value) => value.customerId || value.customerName, 'customerId or customerName is required')
  .refine((value) => value.siteId || value.siteName, 'siteId or siteName is required');

const jobPatch = z.object({
  customerId: uuid.optional(),
  customerName: z.string().trim().min(1).optional(),
  siteId: uuid.optional(),
  siteName: z.string().trim().min(1).optional(),
  siteAddress: z.string().trim().nullable().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  headcountRequired: z.number().int().positive().optional(),
  instructions: z.string().trim().nullable().optional(),
  requestSource: z.string().trim().nullable().optional(),
  requestRaw: z.string().trim().nullable().optional(),
  status: jobStatus.optional(),
  billingStatus: billingStatus.optional(),
});

const listQuery = z.object({
  status: jobStatus.optional(),
  billingStatus: billingStatus.optional(),
  recordState: recordState.optional(),
});
const signReportQuery = z.object({ token: z.string().min(1) });
const signReportPayload = z.object({
  job: z.string().min(1),
  scope: z.literal('SIGN_REPORT'),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});
const signReportSubmit = z.object({
  token: z.string().min(1).optional(),
  signatureImage: z.string().trim().min(1).max(1_500_000),
  signedBy: z.string().trim().min(1).max(120),
  signerRole: z.string().trim().min(1).max(120),
});
const assignmentCreate = z.object({
  officerId: z.string().trim().min(1),
});
const SIGN_REPORT_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
}

function jsonError(c: Context, status: 400 | 403 | 404, message: string) {
  return c.json({ error: message }, status);
}

function encodeUriPart(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest();
}

function hmacHex(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest('hex');
}

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function tokenSecret() {
  const secret = process.env.PILOTNOW_SIGN_REPORT_SECRET || process.env.PILOTNOW_OFFICER_LINK_SECRET || process.env.PILOTNOW_AGENT_TOKEN;
  if (!secret && process.env.NODE_ENV === 'production') throw new Error('PILOTNOW_SIGN_REPORT_SECRET is not set');
  return secret || 'dev-sign-report-secret';
}

function signReportToken(jobCode: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const body = base64UrlJson({ job: jobCode, scope: 'SIGN_REPORT', iat: now, exp: now + SIGN_REPORT_TOKEN_TTL_SECONDS });
  const signingInput = `${header}.${body}`;
  return `${signingInput}.${createHmac('sha256', tokenSecret()).update(signingInput).digest('base64url')}`;
}

function verifySignReportToken(token: string, jobCode: string) {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) return false;
  const expected = createHmac('sha256', tokenSecret()).update(`${header}.${body}`).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return false;
  try {
    const parsed = signReportPayload.safeParse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8')));
    return parsed.success && parsed.data.job === jobCode && parsed.data.exp * 1000 >= Date.now();
  } catch {
    return false;
  }
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Buffer.from(hash).toString('hex');
}

async function spacesReadUrl(mediaRef: string) {
  const accessKey = process.env.DO_SPACES_ACCESS_KEY;
  const secretKey = process.env.DO_SPACES_SECRET_KEY;
  const bucket = process.env.DO_SPACES_BUCKET;
  const endpoint = process.env.DO_SPACES_ENDPOINT;
  const region = process.env.DO_SPACES_REGION;
  if (!accessKey || !secretKey || !bucket || !endpoint || !region) throw new Error('DigitalOcean Spaces is not configured');

  const key = decodeURIComponent(new URL(mediaRef).pathname.replace(/^\/+/, ''));
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const amzDate = `${date}T${now.toISOString().slice(11, 19).replace(/:/g, '')}Z`;
  const credentialScope = `${date}/${region}/s3/aws4_request`;
  const host = `${bucket}.${new URL(endpoint).host}`;
  const pathname = `/${key.split('/').map(encodeUriPart).join('/')}`;
  const query = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKey}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': '300',
    'X-Amz-SignedHeaders': 'host',
  });
  const canonicalQuery = Array.from(query.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeUriPart(k)}=${encodeUriPart(v)}`)
    .join('&');
  const canonicalRequest = ['GET', pathname, canonicalQuery, `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, await sha256Hex(canonicalRequest)].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, date), region), 's3'), 'aws4_request');
  const signature = hmacHex(signingKey, stringToSign);
  return `https://${host}${pathname}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

function serializeJob(row: {
  job: typeof schema.jobs.$inferSelect;
  customer: typeof schema.customers.$inferSelect;
  site: typeof schema.sites.$inferSelect;
}) {
  return {
    id: row.job.jobCode,
    customer: { id: row.customer.id, name: row.customer.name, contact: row.customer.contact },
    site: { id: row.site.id, name: row.site.name, address: row.site.address },
    startAt: row.job.startAt.toISOString(),
    endAt: row.job.endAt.toISOString(),
    headcountRequired: row.job.headcountRequired,
    instructions: row.job.instructions,
    requestSource: row.job.requestSource,
    requestRaw: row.job.requestRaw,
    status: row.job.status,
    billingStatus: row.job.billingStatus,
    invoiceNumber: row.job.invoiceNumber,
    billedAt: row.job.billedAt?.toISOString() ?? null,
    siteManagerSignedAt: row.job.siteManagerSignedAt?.toISOString() ?? null,
    siteManagerSignedBy: row.job.siteManagerSignedBy,
    recordState: row.job.recordState,
    postedToGroupAt: row.job.postedToGroupAt?.toISOString() ?? null,
    createdAt: row.job.createdAt.toISOString(),
  };
}

async function serializeJobWithAssignments(row: {
  job: typeof schema.jobs.$inferSelect;
  customer: typeof schema.customers.$inferSelect;
  site: typeof schema.sites.$inferSelect;
}) {
  const assignments = await getDb()
    .select()
    .from(schema.jobAssignments)
    .innerJoin(schema.officers, eq(schema.jobAssignments.officerId, schema.officers.id))
    .where(eq(schema.jobAssignments.jobId, row.job.id));
  const proofRows = await getDb()
    .select()
    .from(schema.proofPhotos)
    .innerJoin(schema.officers, eq(schema.proofPhotos.officerId, schema.officers.id))
    .where(eq(schema.proofPhotos.jobId, row.job.id));

  return {
    ...serializeJob(row),
    assignments: assignments.map((item) => ({
      officerId: item.officers.id,
      officerCode: item.officers.officerCode,
      officerName: item.officers.name,
      officerPhone: item.officers.phone,
      icVerified: item.officers.icVerified,
      rate: item.job_assignments.rateAgreed ?? item.job_assignments.rateOffered ?? item.officers.defaultHourlyRate,
      confirmed: item.job_assignments.ackStatus === 'ACKNOWLEDGED',
      onDuty: Boolean(item.job_assignments.reportedOnDutyAt || item.job_assignments.checkInAt),
      checkInAt: item.job_assignments.checkInAt?.toISOString() ?? null,
      checkOutAt: item.job_assignments.checkOutAt?.toISOString() ?? null,
    })),
    proofPhotos: await Promise.all(proofRows.map(async (item) => ({
      id: item.proof_photos.id,
      officerId: item.officers.id,
      officerName: item.officers.name,
      mediaRef: item.proof_photos.mediaRef,
      photoUrl: await spacesReadUrl(item.proof_photos.mediaRef).catch(() => item.proof_photos.mediaRef),
      proofWindow: item.proof_photos.proofWindow,
      receivedAt: item.proof_photos.receivedAt.toISOString(),
    }))),
  };
}

async function serializeSignReport(row: {
  job: typeof schema.jobs.$inferSelect;
  customer: typeof schema.customers.$inferSelect;
  site: typeof schema.sites.$inferSelect;
}) {
  const assignments = await getDb()
    .select()
    .from(schema.jobAssignments)
    .innerJoin(schema.officers, eq(schema.jobAssignments.officerId, schema.officers.id))
    .where(eq(schema.jobAssignments.jobId, row.job.id));
  const proofRows = await getDb()
    .select()
    .from(schema.proofPhotos)
    .innerJoin(schema.officers, eq(schema.proofPhotos.officerId, schema.officers.id))
    .where(eq(schema.proofPhotos.jobId, row.job.id));
  return {
    id: row.job.jobCode,
    status: row.job.status,
    customer: { name: row.customer.name },
    site: { name: row.site.name, address: row.site.address },
    startAt: row.job.startAt.toISOString(),
    endAt: row.job.endAt.toISOString(),
    signOff: {
      signatureImage: row.job.siteManagerSignature,
      signedBy: row.job.siteManagerSignedBy,
      signerRole: row.job.siteManagerSignerRole,
      signedAt: row.job.siteManagerSignedAt?.toISOString() ?? null,
    },
    assignments: assignments.map((item) => ({
      officerId: item.officers.id,
      officerName: item.officers.name,
      checkInAt: item.job_assignments.checkInAt?.toISOString() ?? null,
      checkOutAt: item.job_assignments.checkOutAt?.toISOString() ?? null,
    })),
    proofPhotos: await Promise.all(proofRows.map(async (item) => ({
      officerId: item.officers.id,
      officerName: item.officers.name,
      proofWindow: item.proof_photos.proofWindow,
      receivedAt: item.proof_photos.receivedAt.toISOString(),
      photoUrl: await spacesReadUrl(item.proof_photos.mediaRef),
    }))),
  };
}

async function audit(action: string, entityId: string, detail?: Record<string, unknown>, actor?: { type: 'HUMAN' | 'AGENT'; id: string }) {
  await getDb().insert(schema.auditEvents).values({
    actorType: actor?.type ?? 'HUMAN',
    actorId: actor?.id ?? 'user:unknown',
    action,
    entityType: 'job',
    entityId,
    detail,
  });
}

async function findJob(id: string) {
  const byCode = await findJobWhere(eq(schema.jobs.jobCode, id));
  if (byCode) return byCode;

  const parsed = uuid.safeParse(id);
  return parsed.success ? findJobWhere(eq(schema.jobs.id, parsed.data)) : null;
}

async function findJobWhere(where: ReturnType<typeof eq>) {
  const [row] = await getDb()
    .select()
    .from(schema.jobs)
    .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
    .where(where)
    .limit(1);

  return row ? { job: row.jobs, customer: row.customers, site: row.sites } : null;
}

async function nextJobCode() {
  const rows = await getDb().select({ jobCode: schema.jobs.jobCode }).from(schema.jobs);
  const max = rows.reduce((value, row) => {
    const match = /^PN-(\d+)$/.exec(row.jobCode);
    return match ? Math.max(value, Number(match[1])) : value;
  }, 2041);
  return `PN-${max + 1}`;
}

async function resolveCustomer(input: z.infer<typeof jobCreate>) {
  if (input.customerId) {
    return input.customerId;
  }
  if (!input.customerName) {
    throw new Error('customerId or customerName is required');
  }
  const [customer] = await getDb()
    .insert(schema.customers)
    .values({ name: input.customerName })
    .returning({ id: schema.customers.id });

  return customer?.id;
}

async function resolveSite(input: z.infer<typeof jobCreate>, customerId: string) {
  if (input.siteId) {
    return input.siteId;
  }
  if (!input.siteName) {
    throw new Error('siteId or siteName is required');
  }
  const [site] = await getDb()
    .insert(schema.sites)
    .values({ customerId, name: input.siteName, address: input.siteAddress })
    .returning({ id: schema.sites.id });

  return site?.id;
}

export const jobs = new Hono()
  .get('/', async (c) => {
    const parsed = listQuery.safeParse(c.req.query());
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid job query');
    }
    const query = parsed.data;
    const filters = [
      query.status ? eq(schema.jobs.status, query.status) : undefined,
      query.billingStatus ? eq(schema.jobs.billingStatus, query.billingStatus) : undefined,
      query.recordState ? eq(schema.jobs.recordState, query.recordState) : undefined,
    ].filter((item) => item !== undefined);

    const rows = await getDb()
      .select()
      .from(schema.jobs)
      .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
      .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(schema.jobs.startAt));

    return c.json({ items: await Promise.all(rows.map((row) => serializeJobWithAssignments({ job: row.jobs, customer: row.customers, site: row.sites }))) });
  })
  .get('/:id/proof-photos/:proofId', async (c) => {
    const row = await findJob(c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Job not found');

    const [proof] = await getDb()
      .select()
      .from(schema.proofPhotos)
      .where(and(eq(schema.proofPhotos.id, c.req.param('proofId')), eq(schema.proofPhotos.jobId, row.job.id)))
      .limit(1);
    if (!proof) return jsonError(c, 404, 'Proof photo not found');

    return c.redirect(await spacesReadUrl(proof.mediaRef));
  })
  .post('/:id/sign-token', async (c) => {
    const row = await findJob(c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Job not found');

    return c.json({ token: signReportToken(row.job.jobCode) });
  })
  .get('/:id/sign-report', async (c) => {
    const row = await findJob(c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Job not found');

    const parsed = signReportQuery.safeParse(c.req.query());
    if (!parsed.success || !verifySignReportToken(parsed.data.token, row.job.jobCode)) {
      return jsonError(c, 403, 'Invalid or expired report link');
    }

    return c.json({ item: await serializeSignReport(row) });
  })
  .post('/:id/sign-report', async (c) => {
    const row = await findJob(c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Job not found');

    const body = await c.req.json().catch(() => ({}));
    const parsed = signReportSubmit.safeParse(body);
    if (!parsed.success) return jsonError(c, 400, 'Invalid signature payload');
    const token = parsed.data.token ?? c.req.query('token');
    if (!token || !verifySignReportToken(token, row.job.jobCode)) {
      return jsonError(c, 403, 'Invalid or expired report link');
    }
    if (row.job.recordState !== 'CONFIRMED') {
      return jsonError(c, 400, 'Only confirmed jobs can be completed');
    }
    if (row.job.status === 'CANCELLED') {
      return jsonError(c, 400, 'This job cannot be completed from the sign report');
    }
    if (row.job.siteManagerSignedAt) {
      return c.json({ item: await serializeSignReport(row) });
    }

    const signedAt = new Date();
    await getDb().update(schema.jobs).set({
      status: 'COMPLETED',
      siteManagerSignature: parsed.data.signatureImage,
      siteManagerSignedBy: parsed.data.signedBy,
      siteManagerSignerRole: parsed.data.signerRole,
      siteManagerSignedAt: signedAt,
    }).where(eq(schema.jobs.id, row.job.id));
    await audit('job.sign_report', row.job.id, { status: 'COMPLETED', signedAt: signedAt.toISOString(), signedBy: parsed.data.signedBy }, { type: 'HUMAN', id: 'site-manager:sign-report' });
    const next = await findJob(row.job.jobCode);
    return c.json({ item: next ? await serializeSignReport(next) : null });
  })
  .get('/:id', async (c) => {
    const row = await findJob(c.req.param('id'));
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    return c.json({ item: await serializeJobWithAssignments(row) });
  })
  .post('/:id/post', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot post jobs to WhatsApp');
    }

    const row = await findJob(c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Job not found');

    await getDb()
      .update(schema.jobs)
      .set({ postedToGroupAt: row.job.postedToGroupAt ?? new Date(), recordState: 'CONFIRMED' })
      .where(eq(schema.jobs.id, row.job.id));

    await audit('job.post_whatsapp', row.job.id, undefined, actor);
    const next = await findJob(row.job.jobCode);
    return c.json({ item: next ? await serializeJobWithAssignments(next) : null });
  })
  .post('/', async (c) => {
    const parsed = jobCreate.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid job payload');
    }
    const input = parsed.data;
    const actor = c.get('actor');
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    if (endAt <= startAt) {
      return jsonError(c, 400, 'endAt must be after startAt');
    }

    const customerId = await resolveCustomer(input);
    if (!customerId) {
      return jsonError(c, 400, 'Could not create customer');
    }
    const siteId = await resolveSite(input, customerId);
    if (!siteId) {
      return jsonError(c, 400, 'Could not create site');
    }

    const [job] = await getDb()
      .insert(schema.jobs)
      .values({
        jobCode: await nextJobCode(),
        customerId,
        siteId,
        startAt,
        endAt,
        headcountRequired: input.headcountRequired,
        instructions: input.instructions,
        requestSource: input.requestSource,
        requestRaw: input.requestRaw,
        recordState: actor.type === 'AGENT' ? 'DRAFT' : 'CONFIRMED',
      })
      .returning({ id: schema.jobs.id });

    if (!job) {
      return jsonError(c, 400, 'Could not create job');
    }

    await audit('job.create', job.id, { recordState: actor.type === 'AGENT' ? 'DRAFT' : 'CONFIRMED' }, actor);
    const row = await findJob(job.id);
    return c.json({ item: row ? await serializeJobWithAssignments(row) : null }, 201);
  })
  .patch('/:id', async (c) => {
    const id = c.req.param('id');
    const parsed = jobPatch.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid job payload');
    }
    const input = parsed.data;
    const actor = c.get('actor');
    const row = await findJob(id);
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    if (input.status === 'COMPLETED') {
      return jsonError(c, 400, 'Use /jobs/:id/complete to complete jobs');
    }
    if (input.billingStatus === 'BILLED') {
      return jsonError(c, 400, 'Use the billing module to mark jobs billed');
    }
    if (actor.type === 'AGENT' && input.status === 'CANCELLED') {
      return jsonError(c, 403, 'Agents cannot cancel jobs');
    }

    const startAt = input.startAt ? new Date(input.startAt) : row.job.startAt;
    const endAt = input.endAt ? new Date(input.endAt) : row.job.endAt;
    if (endAt <= startAt) {
      return jsonError(c, 400, 'endAt must be after startAt');
    }

    if (input.customerName) {
      await getDb().update(schema.customers).set({ name: input.customerName }).where(eq(schema.customers.id, row.job.customerId));
    }
    if (input.siteName !== undefined || input.siteAddress !== undefined) {
      await getDb()
        .update(schema.sites)
        .set({ name: input.siteName, address: input.siteAddress })
        .where(eq(schema.sites.id, row.job.siteId));
    }

    const [updated] = await getDb()
      .update(schema.jobs)
      .set({
        customerId: input.customerId,
        siteId: input.siteId,
        startAt: input.startAt ? startAt : undefined,
        endAt: input.endAt ? endAt : undefined,
        headcountRequired: input.headcountRequired,
        instructions: input.instructions,
        requestSource: input.requestSource,
        requestRaw: input.requestRaw,
        status: input.status,
        billingStatus: input.billingStatus,
      })
      .where(eq(schema.jobs.id, row.job.id))
      .returning({ id: schema.jobs.id });

    if (!updated) {
      return jsonError(c, 404, 'Job not found');
    }

    await audit('job.update', row.job.id, input, actor);
    const next = await findJob(id);
    return c.json({ item: next ? await serializeJobWithAssignments(next) : null });
  })
  .post('/:id/confirm', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot confirm jobs');
    }

    const id = c.req.param('id');
    const row = await findJob(id);
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    const [updated] = await getDb()
      .update(schema.jobs)
      .set({ recordState: 'CONFIRMED' })
      .where(eq(schema.jobs.id, row.job.id))
      .returning({ id: schema.jobs.id });

    if (!updated) {
      return jsonError(c, 404, 'Job not found');
    }

    await audit('job.confirm', row.job.id, undefined, actor);
    const next = await findJob(row.job.jobCode);
    return c.json({ item: next ? await serializeJobWithAssignments(next) : null });
  })
  .post('/:id/complete', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot complete jobs');
    }

    const id = c.req.param('id');
    const row = await findJob(id);
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    if (row.job.recordState !== 'CONFIRMED') {
      return jsonError(c, 400, 'Only confirmed jobs can be completed');
    }
    if (row.job.status === 'CANCELLED' || row.job.status === 'COMPLETED') {
      return jsonError(c, 400, 'This job cannot be completed');
    }

    await getDb().update(schema.jobs).set({ status: 'COMPLETED' }).where(eq(schema.jobs.id, row.job.id));
    await audit('job.complete', row.job.id, undefined, actor);
    const next = await findJob(id);
    return c.json({ item: next ? await serializeJobWithAssignments(next) : null });
  })
  .post('/:id/assignments', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') return jsonError(c, 403, 'Agents cannot assign officers');

    const row = await findJob(c.req.param('id'));
    if (!row) return jsonError(c, 404, 'Job not found');

    const parsed = assignmentCreate.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) return jsonError(c, 400, 'Invalid assignment payload');

    const officerId = parsed.data.officerId;
    const [officer] = await getDb()
      .select()
      .from(schema.officers)
      .where(uuid.safeParse(officerId).success ? eq(schema.officers.id, officerId) : eq(schema.officers.officerCode, officerId))
      .limit(1);
    if (!officer) return jsonError(c, 404, 'Officer not found');

    const [existing] = await getDb()
      .select({ id: schema.jobAssignments.id })
      .from(schema.jobAssignments)
      .where(and(eq(schema.jobAssignments.jobId, row.job.id), eq(schema.jobAssignments.officerId, officer.id)))
      .limit(1);
    if (!existing) {
      await getDb().insert(schema.jobAssignments).values({
        jobId: row.job.id,
        officerId: officer.id,
        rateOffered: officer.defaultHourlyRate,
        rateAgreed: officer.defaultHourlyRate,
      });
      await audit('job.assignment.create', row.job.id, { officerId: officer.id }, actor);
    }

    const next = await findJob(row.job.jobCode);
    return c.json({ item: next ? await serializeJobWithAssignments(next) : null });
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    const row = await findJob(id);
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    const [updated] = await getDb()
      .update(schema.jobs)
      .set({ status: 'CANCELLED' })
      .where(eq(schema.jobs.id, row.job.id))
      .returning({ id: schema.jobs.id });

    if (!updated) {
      return jsonError(c, 404, 'Job not found');
    }

    await audit('job.cancel', row.job.id, undefined, c.get('actor'));
    const next = await findJob(row.job.jobCode);
    return c.json({ item: next ? await serializeJobWithAssignments(next) : null });
  });
