import crypto from 'crypto';

export const ADMIN_SESSION_COOKIE = 'aether_admin_session';

export function getAdminSessionValue() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  return crypto.createHmac('sha256', password).update(email).digest('hex');
}

export function isValidAdminSession(value: string | undefined) {
  const expected = getAdminSessionValue();
  if (!value || !expected || value.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
