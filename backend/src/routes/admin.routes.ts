import { Router } from 'express';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import childrenRoutes from '../modules/children/children.routes.js';
import donorsRoutes from '../modules/donors/donors.routes.js';
import donationsRoutes from '../modules/donations/donations.routes.js';
import backupRoutes from '../modules/backup/backup.routes.js';
import bankAccountsRoutes from '../modules/bank-accounts/bank-accounts.routes.js';
import newsRoutes from '../modules/news/news.routes.js';
import programsRoutes from '../modules/programs/programs.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';
import usersRoutes from '../modules/users/users.routes.js';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/children', childrenRoutes);
router.use('/donors', donorsRoutes);
router.use('/donations', donationsRoutes);
router.use('/backup', backupRoutes);
router.use('/bank-accounts', bankAccountsRoutes);
router.use('/news', newsRoutes);
router.use('/programs', programsRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/users', usersRoutes);

export default router;
