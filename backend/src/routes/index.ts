import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import childrenRoutes from '../modules/children/children.routes.js';
import donorsRoutes from '../modules/donors/donors.routes.js';
import donationsRoutes from '../modules/donations/donations.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import bootstrapRoutes from '../modules/bootstrap/bootstrap.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/children', childrenRoutes);
router.use('/donors', donorsRoutes);
router.use('/donations', donationsRoutes);
router.use('/reports', reportsRoutes);
router.use('/bootstrap', bootstrapRoutes);

export default router;
