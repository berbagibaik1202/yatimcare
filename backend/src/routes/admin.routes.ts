import { Router } from 'express';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import childrenRoutes from '../modules/children/children.routes.js';
import donorsRoutes from '../modules/donors/donors.routes.js';
import donationsRoutes from '../modules/donations/donations.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/children', childrenRoutes);
router.use('/donors', donorsRoutes);
router.use('/donations', donationsRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);

export default router;
