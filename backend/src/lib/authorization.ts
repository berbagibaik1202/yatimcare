import type { Request, Response } from 'express';
import { getCurrentUserFromRequest, type AuthUserPayload } from './auth.js';

export async function requireCurrentUser(req: Request, res: Response): Promise<AuthUserPayload | null> {
  const currentUser = await getCurrentUserFromRequest(req);

  if (!currentUser) {
    res.status(401).json({ message: 'Anda harus login untuk mengakses endpoint ini.' });
    return null;
  }

  return currentUser;
}

export async function requireCurrentUserRole(
  req: Request,
  res: Response,
  allowedRoles: string[],
  message?: string
): Promise<AuthUserPayload | null> {
  const currentUser = await requireCurrentUser(req, res);

  if (!currentUser) {
    return null;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    res.status(403).json({
      message: message ?? 'Anda tidak memiliki akses ke resource ini.'
    });
    return null;
  }

  return currentUser;
}

export function hasAnyRole(currentUser: AuthUserPayload | null, allowedRoles: string[]) {
  return !!currentUser && allowedRoles.includes(currentUser.role);
}
