import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../lib/asyncHandler.js';
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
  getCurrentUserFromRequest,
  issueSessionToken,
  mapUserRecord,
  verifyPassword
} from '../../lib/auth.js';
import { prisma } from '../../lib/db.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await getCurrentUserFromRequest(req);
    res.json({
      data: {
        user
      }
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: 'Email dan password harus diisi dengan benar.'
      });
      return;
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({
        message: 'Email atau password tidak valid.'
      });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({
        message: 'Akun Anda sedang nonaktif.'
      });
      return;
    }

    if (!user.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
      res.status(401).json({
        message: 'Email atau password tidak valid.'
      });
      return;
    }

    const token = issueSessionToken(user.id);

    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    res.json({
      message: 'Login berhasil.',
      data: {
        user: mapUserRecord(user)
      }
    });
  })
);

router.post(
  '/logout',
  asyncHandler(async (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());
    res.json({
      message: 'Logout berhasil.',
      data: {
        user: null
      }
    });
  })
);

router.post('/register', (_req, res) => {
  res.status(501).json({
    message: 'Registrasi akun belum diaktifkan. Gunakan akun demo seeded terlebih dahulu.'
  });
});

export default router;
