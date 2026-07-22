import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN ?? true,
      credentials: true
    })
  );
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/api', (_req, res) => {
    res.json({
      service: 'YatimCare Backend API',
      version: '0.1.0'
    });
  });

  app.use('/api', apiRoutes);

  if (env.NODE_ENV === 'production') {
    const frontendRoot = path.resolve(process.env.FRONTEND_ROOT ?? path.join(process.cwd(), '..'));
    const frontendIndex = path.join(frontendRoot, 'index.html');

    if (fs.existsSync(frontendIndex)) {
      app.use(express.static(frontendRoot));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          next();
          return;
        }

        res.sendFile(frontendIndex);
      });
    }
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
