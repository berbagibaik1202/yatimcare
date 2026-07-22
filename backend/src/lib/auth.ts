import crypto from 'crypto';
import type { CookieOptions, Request } from 'express';
import { prisma } from './prisma.js';
import { env } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'yatimcare_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
};

export type AuthUserPayload = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  status: 'active' | 'suspended';
  createdAt: string;
};

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function timingSafeEqualStrings(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('base64url');
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, encodedKey] = storedHash.split('$');

  if (scheme !== 'scrypt' || !salt || !encodedKey) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, 64).toString('base64url');
  return timingSafeEqualStrings(derivedKey, encodedKey);
}

export function issueSessionToken(userId: string) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  } satisfies SessionPayload));

  const signature = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function parseCookies(cookieHeader?: string | string[]) {
  if (!cookieHeader) {
    return {};
  }

  const rawHeader = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;

  return rawHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [name, ...valueParts] = part.trim().split('=');
    if (!name) {
      return acc;
    }

    acc[name] = decodeURIComponent(valueParts.join('=') ?? '');
    return acc;
  }, {});
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (!timingSafeEqualStrings(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as SessionPayload;
    if (typeof parsed.sub !== 'string' || typeof parsed.exp !== 'number') {
      return null;
    }

    if (parsed.exp * 1000 < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000
  };
}

export function getClearAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/'
  };
}

export function mapUserRecord(user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  status: 'active' | 'suspended';
  createdAt: Date;
}): AuthUserPayload {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar ?? undefined,
    status: user.status,
    createdAt: user.createdAt.toISOString()
  };
}

export async function getCurrentUserFromRequest(req: Request): Promise<AuthUserPayload | null> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[AUTH_COOKIE_NAME];

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub }
  });

  if (!user || user.status !== 'active') {
    return null;
  }

  return mapUserRecord(user);
}
