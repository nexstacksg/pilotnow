import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { createDb, schema } from '@pilotnow/db';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';

const uuid = z.string().uuid();
const accessQuery = z.object({
  hp: z.string().min(3),
  token: z.string().min(1),
});
const tokenPayload = z.object({
  sub: z.string().min(1),
  role: z.literal('OFFICER'),
  hp: z.string().min(3),
  job: z.string().min(1),
  assignment: z.string().uuid(),
  requirements: z.object({
    checkIn: z.boolean(),
    checkOut: z.boolean(),
    evidencePhoto: z.boolean(),
    location: z.boolean(),
  }),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});
const createTokenPayload = z.object({
  hp: z.string().min(3),
});
const OFFICER_LINK_TOKEN_TTL_SECONDS = 24 * 60 * 60;
const attendancePayload = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  location: z.string().trim().max(500).optional(),
  accuracy: z.number().nonnegative().max(100_000).optional(),
  evidencePhotoUrl: z.string().trim().max(1_500).optional(),
});
const evidencePayload = z.object({
  mediaRef: z.string().trim().min(1).max(1_500),
  proofWindow: z.string().trim().max(120).optional(),
});
const uploadPayload = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(100).default('image/jpeg'),
});

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
}

function digits(value: string) {
  return value.replace(/\D/g, '');
}

function encodeUriPart(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function base64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlJson(value: unknown) {
  return base64Url(JSON.stringify(value));
}

function tokenSecret() {
  const secret = process.env.PILOTNOW_OFFICER_LINK_SECRET || process.env.PILOTNOW_AGENT_TOKEN;
  if (!secret && process.env.NODE_ENV === 'production') throw new Error('PILOTNOW_OFFICER_LINK_SECRET is not set');
  return secret || 'dev-officer-link-secret';
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest();
}

function hmacHex(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest('hex');
}

function sha256Hex(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function spacesUploadUrl(key: string) {
  const accessKey = process.env.DO_SPACES_ACCESS_KEY;
  const secretKey = process.env.DO_SPACES_SECRET_KEY;
  const bucket = process.env.DO_SPACES_BUCKET;
  const endpoint = process.env.DO_SPACES_ENDPOINT;
  const region = process.env.DO_SPACES_REGION;
  const cdn = process.env.DO_SPACES_CDN;

  if (!accessKey || !secretKey || !bucket || !endpoint || !region || !cdn) {
    throw new Error('DigitalOcean Spaces is not configured');
  }

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
    'X-Amz-SignedHeaders': 'host;x-amz-acl',
  });
  const canonicalQuery = Array.from(query.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeUriPart(k)}=${encodeUriPart(v)}`)
    .join('&');
  const canonicalRequest = ['PUT', pathname, canonicalQuery, `host:${host}\nx-amz-acl:public-read\n`, 'host;x-amz-acl', 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, sha256Hex(canonicalRequest)].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, date), region), 's3'), 'aws4_request');
  const signature = hmacHex(signingKey, stringToSign);

  return {
    uploadUrl: `https://${host}${pathname}?${canonicalQuery}&X-Amz-Signature=${signature}`,
    mediaRef: `${cdn.replace(/\/+$/, '')}/${key.split('/').map(encodeUriPart).join('/')}`,
    headers: { 'x-amz-acl': 'public-read' },
  };
}

function jsonError(c: Context, status: 400 | 401 | 404 | 500, message: string) {
  return c.json({ error: message }, status);
}

function isImageContentType(value: string) {
  return /^image\/(jpeg|jpg|png|webp|heic|heif)$/i.test(value);
}

function isExpectedMediaRef(mediaRef: string, jobCode: string, assignmentId: string) {
  const cdn = process.env.DO_SPACES_CDN?.replace(/\/+$/, '');
  if (!cdn) return true;
  const root = process.env.DO_SPACES_ROOT_PATH?.replace(/^\/+|\/+$/g, '') || 'pilotnow';
  const prefix = `${root}/evidence/${jobCode}/${assignmentId}`.split('/').map(encodeUriPart).join('/');
  return mediaRef.startsWith(`${cdn}/${prefix}/`);
}

function signOfficerToken(payload: z.infer<typeof tokenPayload>) {
  const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const body = base64UrlJson(payload);
  const signingInput = `${header}.${body}`;
  return `${signingInput}.${createHmac('sha256', tokenSecret()).update(signingInput).digest('base64url')}`;
}

function verifyOfficerToken(token: string, jobId: string, hp: string, assignmentId: string) {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) return null;

  const signingInput = `${header}.${body}`;
  const expected = createHmac('sha256', tokenSecret()).update(signingInput).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  let payload: unknown;
  let tokenHeader: unknown;
  try {
    tokenHeader = JSON.parse(Buffer.from(header, 'base64url').toString('utf8')) as unknown;
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as unknown;
  } catch {
    return null;
  }
  if (!tokenHeader || typeof tokenHeader !== 'object' || (tokenHeader as { alg?: unknown }).alg !== 'HS256') return null;
  const parsed = tokenPayload.safeParse(payload);
  if (!parsed.success) return null;
  if (
    parsed.data.role !== 'OFFICER' ||
    parsed.data.job !== jobId ||
    parsed.data.assignment !== assignmentId ||
    parsed.data.sub !== `officer:${hp}` ||
    digits(parsed.data.hp) !== hp ||
    parsed.data.exp * 1000 < Date.now()
  ) {
    return null;
  }
  return parsed.data;
}

function validateAccess(c: Context) {
  const parsed = accessQuery.safeParse(c.req.query());
  if (!parsed.success) return null;

  return { hp: digits(parsed.data.hp), token: parsed.data.token };
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

async function findAccess(c: Context) {
  const access = validateAccess(c);
  if (!access) return null;

  const id = c.req.param('id');
  if (!id) return null;

  const row = await findJob(id);
  if (!row) return null;

  const assignment = await findAssignment(row.job.id, access.hp);
  if (!assignment || !verifyOfficerToken(access.token, row.job.jobCode, access.hp, assignment.job_assignments.id)) return null;
  return assignment ? { ...row, assignment: assignment.job_assignments, officer: assignment.officers } : null;
}

async function findAssignment(jobId: string, hp: string) {
  const assignments = await getDb()
    .select()
    .from(schema.jobAssignments)
    .innerJoin(schema.officers, eq(schema.jobAssignments.officerId, schema.officers.id))
    .where(eq(schema.jobAssignments.jobId, jobId));

  return assignments.find((item) => digits(item.officers.phone) === hp) ?? null;
}

async function findOfficerByPhone(hp: string) {
  const rows = await getDb().select().from(schema.officers);
  return rows.find((officer) => digits(officer.phone) === hp) ?? null;
}

async function ensureAssignment(jobId: string, hp: string) {
  const existing = await findAssignment(jobId, hp);
  if (existing) return existing;

  const officer = await findOfficerByPhone(hp);
  if (!officer) return null;

  const [created] = await getDb()
    .insert(schema.jobAssignments)
    .values({
      jobId,
      officerId: officer.id,
      rateOffered: officer.defaultHourlyRate,
      rateAgreed: officer.defaultHourlyRate,
    })
    .returning({ id: schema.jobAssignments.id });

  return created ? findAssignment(jobId, hp) : null;
}

async function serializeAccess(c: Context) {
  const access = await findAccess(c);
  if (!access) return null;

  const photos = await getDb()
    .select()
    .from(schema.proofPhotos)
    .where(eq(schema.proofPhotos.assignmentId, access.assignment.id));

  return {
    job: {
      id: access.job.jobCode,
      customer: access.customer.name,
      site: access.site.name,
      address: access.site.address,
      startAt: access.job.startAt.toISOString(),
      endAt: access.job.endAt.toISOString(),
      instructions: access.job.instructions,
      status: access.job.status,
    },
    officer: {
      id: access.officer.officerCode,
      name: access.officer.name,
      phone: access.officer.phone,
    },
    assignment: {
      id: access.assignment.id,
      ackStatus: access.assignment.ackStatus,
      checkInAt: access.assignment.checkInAt?.toISOString() ?? null,
      checkInLocation: access.assignment.checkInLocation,
      checkInLatitude: access.assignment.checkInLatitude,
      checkInLongitude: access.assignment.checkInLongitude,
      checkOutAt: access.assignment.checkOutAt?.toISOString() ?? null,
      checkOutLocation: access.assignment.checkOutLocation,
      checkOutLatitude: access.assignment.checkOutLatitude,
      checkOutLongitude: access.assignment.checkOutLongitude,
    },
    evidencePhotos: photos.map((photo) => ({
      id: photo.id,
      mediaRef: photo.mediaRef,
      proofWindow: photo.proofWindow,
      receivedAt: photo.receivedAt.toISOString(),
    })),
  };
}

async function addEvidence(input: { jobId: string; assignmentId: string; officerId: string; mediaRef: string; proofWindow?: string }) {
  await getDb().insert(schema.proofPhotos).values({
    jobId: input.jobId,
    assignmentId: input.assignmentId,
    officerId: input.officerId,
    mediaRef: input.mediaRef,
    proofWindow: input.proofWindow,
  });
}

function evidenceKey(jobCode: string, assignmentId: string, filename: string) {
  const root = process.env.DO_SPACES_ROOT_PATH?.replace(/^\/+|\/+$/g, '') || 'pilotnow';
  const safeName = filename.replace(/[^a-z0-9._-]/gi, '_');
  return `${root}/evidence/${jobCode}/${assignmentId}/${Date.now()}-${safeName}`;
}

async function uploadFileToSpaces(jobCode: string, assignmentId: string, file: File) {
  const signed = spacesUploadUrl(evidenceKey(jobCode, assignmentId, file.name || 'evidence.jpg'));
  const uploaded = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: { ...signed.headers, 'content-type': file.type || 'image/jpeg' },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!uploaded.ok) throw new Error('Photo upload failed');
  return signed.mediaRef;
}

export const officerJobs = new Hono()
  .post('/:id/token', async (c) => {
    try {
      const parsed = createTokenPayload.safeParse(await c.req.json().catch(() => undefined));
      if (!parsed.success) return jsonError(c, 400, 'Invalid token payload');

      const row = await findJob(c.req.param('id'));
      if (!row) return jsonError(c, 404, 'Job not found');

      const hp = digits(parsed.data.hp);
      const assignment = await ensureAssignment(row.job.id, hp);
      if (!assignment) return jsonError(c, 404, 'Officer phone not found in backend officer records');

      const now = Math.floor(Date.now() / 1000);
      const exp = now + OFFICER_LINK_TOKEN_TTL_SECONDS;
      return c.json({
        token: signOfficerToken({
          sub: `officer:${hp}`,
          role: 'OFFICER',
          hp,
          job: row.job.jobCode,
          assignment: assignment.job_assignments.id,
          requirements: {
            checkIn: true,
            checkOut: true,
            evidencePhoto: true,
            location: true,
          },
          iat: now,
          exp,
        }),
        expiresAt: new Date(exp * 1000).toISOString(),
      });
    } catch (error) {
      return jsonError(c, 500, error instanceof Error ? error.message : 'Could not create officer link token');
    }
  })
  .get('/:id', async (c) => {
    const item = await serializeAccess(c);
    return item ? c.json({ item }) : jsonError(c, 401, 'Invalid or expired job link');
  })
  .post('/:id/check-in', async (c) => {
    const access = await findAccess(c);
    if (!access) return jsonError(c, 401, 'Invalid or expired job link');

    const parsed = attendancePayload.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return jsonError(c, 400, 'Invalid check-in payload');

    const now = new Date();

    await getDb()
      .update(schema.jobAssignments)
      .set({
        ackStatus: 'ACKNOWLEDGED',
        reportedOnDutyAt: now,
        checkInAt: now,
        checkInLatitude: parsed.data.latitude?.toString(),
        checkInLongitude: parsed.data.longitude?.toString(),
        checkInLocation: parsed.data.location,
        checkInAccuracyMetres: parsed.data.accuracy?.toString(),
      })
      .where(eq(schema.jobAssignments.id, access.assignment.id));

    if (parsed.data.evidencePhotoUrl) {
      if (!isExpectedMediaRef(parsed.data.evidencePhotoUrl, access.job.jobCode, access.assignment.id)) return jsonError(c, 400, 'Invalid evidence photo');
      await addEvidence({
        jobId: access.job.id,
        assignmentId: access.assignment.id,
        officerId: access.officer.id,
        mediaRef: parsed.data.evidencePhotoUrl,
        proofWindow: 'check-in',
      }).catch(() => undefined);
    }

    const item = await serializeAccess(c);
    return c.json({ item });
  })
  .post('/:id/evidence', async (c) => {
    const access = await findAccess(c);
    if (!access) return jsonError(c, 401, 'Invalid or expired job link');

    const parsed = evidencePayload.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) return jsonError(c, 400, 'Invalid evidence payload');
    if (!isExpectedMediaRef(parsed.data.mediaRef, access.job.jobCode, access.assignment.id)) return jsonError(c, 400, 'Invalid evidence photo');

    await addEvidence({
      jobId: access.job.id,
      assignmentId: access.assignment.id,
      officerId: access.officer.id,
      mediaRef: parsed.data.mediaRef,
      proofWindow: parsed.data.proofWindow,
    });

    const item = await serializeAccess(c);
    return c.json({ item });
  })
  .post('/:id/evidence-upload', async (c) => {
    const access = await findAccess(c);
    if (!access) return jsonError(c, 401, 'Invalid or expired job link');

    const parsed = uploadPayload.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) return jsonError(c, 400, 'Invalid upload payload');
    if (!isImageContentType(parsed.data.contentType)) return jsonError(c, 400, 'Only image uploads are supported');

    const signed = spacesUploadUrl(evidenceKey(access.job.jobCode, access.assignment.id, parsed.data.filename));
    return c.json({ ...signed, method: 'PUT', headers: { ...signed.headers, 'content-type': parsed.data.contentType } });
  })
  .post('/:id/evidence-file', async (c) => {
    try {
      const access = await findAccess(c);
      if (!access) return jsonError(c, 401, 'Invalid or expired job link');

      const form = await c.req.formData();
      const file = form.get('photo');
      if (!(file instanceof File)) return jsonError(c, 400, 'Photo file is required');
      if (file.type && !isImageContentType(file.type)) return jsonError(c, 400, 'Only image uploads are supported');

      return c.json({ mediaRef: await uploadFileToSpaces(access.job.jobCode, access.assignment.id, file) });
    } catch (error) {
      return jsonError(c, 500, error instanceof Error ? error.message : 'Photo upload failed');
    }
  })
  .post('/:id/check-out', async (c) => {
    const access = await findAccess(c);
    if (!access) return jsonError(c, 401, 'Invalid or expired job link');

    const parsed = attendancePayload.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return jsonError(c, 400, 'Invalid check-out payload');

    await getDb()
      .update(schema.jobAssignments)
      .set({
        checkOutAt: new Date(),
        checkOutLatitude: parsed.data.latitude?.toString(),
        checkOutLongitude: parsed.data.longitude?.toString(),
        checkOutLocation: parsed.data.location,
        checkOutAccuracyMetres: parsed.data.accuracy?.toString(),
      })
      .where(eq(schema.jobAssignments.id, access.assignment.id));

    if (parsed.data.evidencePhotoUrl) {
      if (!isExpectedMediaRef(parsed.data.evidencePhotoUrl, access.job.jobCode, access.assignment.id)) return jsonError(c, 400, 'Invalid evidence photo');
      await addEvidence({
        jobId: access.job.id,
        assignmentId: access.assignment.id,
        officerId: access.officer.id,
        mediaRef: parsed.data.evidencePhotoUrl,
        proofWindow: 'check-out',
      }).catch(() => undefined);
    }

    const item = await serializeAccess(c);
    return c.json({ item });
  });
