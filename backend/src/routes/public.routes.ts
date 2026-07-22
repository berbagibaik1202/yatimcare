import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import bootstrapRoutes from '../modules/bootstrap/bootstrap.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/bootstrap', bootstrapRoutes);

export default router;
