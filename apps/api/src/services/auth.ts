import { createHash, randomBytes, randomInt, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { and, desc, eq, gt, isNotNull, isNull } from 'drizzle-orm';
import { createDb, schema } from '@pilotnow/db';
import { sendPasswordResetCode } from './email.js';

export const SESSION_COOKIE = 'pilotnow_session';

const SESSION_HOURS = 12;
const REMEMBER_DAYS = 30;
const SCRYPT_KEY_LENGTH = 64;
const RESET_CODE_LIFETIME_MS = 10 * 60 * 1000;
const RESET_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;
const RESET_MAX_ATTEMPTS = 5;

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
}

function scrypt(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(password, salt, SCRYPT_KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt);
  return `scrypt$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, saltValue, hashValue] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !saltValue || !hashValue) return false;

  const expected = Buffer.from(hashValue, 'base64url');
  const actual = await scrypt(password, Buffer.from(saltValue, 'base64url'));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function ensureBootstrapAdmin() {
  const email = process.env.PILOTNOW_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.PILOTNOW_ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 8) throw new Error('PILOTNOW_ADMIN_PASSWORD must be at least 8 characters');

  const database = getDb();
  const existing = await database.select({ id: schema.adminUsers.id }).from(schema.adminUsers).limit(1);
  if (existing.length) return;

  await database.insert(schema.adminUsers).values({
    email,
    passwordHash: await hashPassword(password),
    name: process.env.PILOTNOW_ADMIN_NAME?.trim() || 'PilotNow Admin',
  }).onConflictDoNothing({ target: schema.adminUsers.email });
}

export async function findAdminByEmail(email: string) {
  const [admin] = await getDb()
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email.trim().toLowerCase()))
    .limit(1);
  return admin ?? null;
}

export async function findAdminById(id: string) {
  const [admin] = await getDb()
    .select({ id: schema.adminUsers.id, email: schema.adminUsers.email, name: schema.adminUsers.name, role: schema.adminUsers.role })
    .from(schema.adminUsers)
    .where(and(eq(schema.adminUsers.id, id), eq(schema.adminUsers.active, true)))
    .limit(1);
  return admin ?? null;
}

export async function createAdminSession(userId: string, remember: boolean) {
  const token = randomBytes(32).toString('base64url');
  const lifetimeMs = remember ? REMEMBER_DAYS * 24 * 60 * 60 * 1000 : SESSION_HOURS * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + lifetimeMs);

  await getDb().insert(schema.adminSessions).values({ userId, tokenHash: tokenHash(token), expiresAt });
  return { token, expiresAt, maxAge: remember ? Math.floor(lifetimeMs / 1000) : undefined };
}

export async function findAdminBySessionToken(token: string) {
  const [admin] = await getDb()
    .select({ id: schema.adminUsers.id, email: schema.adminUsers.email, name: schema.adminUsers.name, role: schema.adminUsers.role })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminSessions.userId, schema.adminUsers.id))
    .where(and(
      eq(schema.adminSessions.tokenHash, tokenHash(token)),
      gt(schema.adminSessions.expiresAt, new Date()),
      eq(schema.adminUsers.active, true),
    ))
    .limit(1);
  return admin ?? null;
}

export async function deleteAdminSession(token: string | undefined) {
  if (!token) return;
  await getDb().delete(schema.adminSessions).where(eq(schema.adminSessions.tokenHash, tokenHash(token)));
}

export async function requestPasswordReset(email: string) {
  const admin = await findAdminByEmail(email);
  if (!admin?.active) return {};

  const database = getDb();
  const now = new Date();
  const [latest] = await database
    .select({ createdAt: schema.adminPasswordResets.createdAt })
    .from(schema.adminPasswordResets)
    .where(and(
      eq(schema.adminPasswordResets.userId, admin.id),
      isNull(schema.adminPasswordResets.consumedAt),
    ))
    .orderBy(desc(schema.adminPasswordResets.createdAt))
    .limit(1);

  if (latest && now.getTime() - latest.createdAt.getTime() < RESET_REQUEST_COOLDOWN_MS) return {};

  await database
    .update(schema.adminPasswordResets)
    .set({ consumedAt: now })
    .where(and(
      eq(schema.adminPasswordResets.userId, admin.id),
      isNull(schema.adminPasswordResets.consumedAt),
    ));

  const code = String(randomInt(0, 10_000)).padStart(4, '0');
  const [created] = await database
    .insert(schema.adminPasswordResets)
    .values({
      userId: admin.id,
      codeHash: tokenHash(code),
      expiresAt: new Date(now.getTime() + RESET_CODE_LIFETIME_MS),
    })
    .returning({ id: schema.adminPasswordResets.id });

  try {
    const delivery = await sendPasswordResetCode(admin.email, code);
    return delivery === 'development' ? { developmentCode: code } : {};
  } catch (error) {
    if (created) {
      await database.delete(schema.adminPasswordResets).where(eq(schema.adminPasswordResets.id, created.id));
    }
    throw error;
  }
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const admin = await findAdminByEmail(email);
  if (!admin?.active) return null;

  const database = getDb();
  const now = new Date();
  const [reset] = await database
    .select()
    .from(schema.adminPasswordResets)
    .where(and(
      eq(schema.adminPasswordResets.userId, admin.id),
      isNull(schema.adminPasswordResets.verifiedAt),
      isNull(schema.adminPasswordResets.consumedAt),
      gt(schema.adminPasswordResets.expiresAt, now),
    ))
    .orderBy(desc(schema.adminPasswordResets.createdAt))
    .limit(1);

  if (!reset || reset.attempts >= RESET_MAX_ATTEMPTS) return null;

  if (reset.codeHash !== tokenHash(code)) {
    const attempts = reset.attempts + 1;
    await database
      .update(schema.adminPasswordResets)
      .set({ attempts, ...(attempts >= RESET_MAX_ATTEMPTS ? { consumedAt: now } : {}) })
      .where(and(
        eq(schema.adminPasswordResets.id, reset.id),
        isNull(schema.adminPasswordResets.verifiedAt),
        isNull(schema.adminPasswordResets.consumedAt),
      ));
    return null;
  }

  const resetToken = randomBytes(32).toString('base64url');
  const [verified] = await database
    .update(schema.adminPasswordResets)
    .set({
      resetTokenHash: tokenHash(resetToken),
      verifiedAt: now,
      expiresAt: new Date(now.getTime() + RESET_TOKEN_LIFETIME_MS),
    })
    .where(and(
      eq(schema.adminPasswordResets.id, reset.id),
      isNull(schema.adminPasswordResets.verifiedAt),
      isNull(schema.adminPasswordResets.consumedAt),
    ))
    .returning({ id: schema.adminPasswordResets.id });

  return verified ? resetToken : null;
}

export async function completePasswordReset(resetToken: string, password: string) {
  const database = getDb();
  const now = new Date();
  const [reset] = await database
    .select({ id: schema.adminPasswordResets.id, userId: schema.adminPasswordResets.userId })
    .from(schema.adminPasswordResets)
    .where(and(
      eq(schema.adminPasswordResets.resetTokenHash, tokenHash(resetToken)),
      isNotNull(schema.adminPasswordResets.verifiedAt),
      isNull(schema.adminPasswordResets.consumedAt),
      gt(schema.adminPasswordResets.expiresAt, now),
    ))
    .limit(1);

  if (!reset) return false;

  const passwordHash = await hashPassword(password);
  await database.transaction(async (tx) => {
    const [consumed] = await tx
      .update(schema.adminPasswordResets)
      .set({ consumedAt: now })
      .where(and(
        eq(schema.adminPasswordResets.id, reset.id),
        isNull(schema.adminPasswordResets.consumedAt),
      ))
      .returning({ id: schema.adminPasswordResets.id });

    if (!consumed) throw new Error('Password reset token was already consumed');

    await tx
      .update(schema.adminUsers)
      .set({ passwordHash, updatedAt: now })
      .where(eq(schema.adminUsers.id, reset.userId));
    await tx.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, reset.userId));
    await tx
      .update(schema.adminPasswordResets)
      .set({ consumedAt: now })
      .where(and(
        eq(schema.adminPasswordResets.userId, reset.userId),
        isNull(schema.adminPasswordResets.consumedAt),
      ));
  });

  return true;
}
