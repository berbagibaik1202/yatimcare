import { Router } from 'express';
import publicRoutes from './public.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use(publicRoutes);
router.use(adminRoutes);

export default router;
