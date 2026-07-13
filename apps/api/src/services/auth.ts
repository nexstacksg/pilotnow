import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { createDb, schema } from '@pilotnow/db';

export const SESSION_COOKIE = 'pilotnow_session';

const SESSION_HOURS = 12;
const REMEMBER_DAYS = 30;
const SCRYPT_KEY_LENGTH = 64;

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
