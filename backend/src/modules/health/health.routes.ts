import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'YatimCare Backend API',
    timestamp: new Date().toISOString()
  });
});

router.get('/info', (_req, res) => {
  res.json({
    appName: 'YatimCare',
    stack: ['Node.js', 'Express', 'TypeScript', 'MySQL native']
  });
});

export default router;
