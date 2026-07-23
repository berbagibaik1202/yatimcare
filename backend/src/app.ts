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

function getCorsOriginConfig() {
  const configuredOrigins = env.CORS_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!configuredOrigins || configuredOrigins.length === 0) {
    return true;
  }

  if (configuredOrigins.includes('*')) {
    return true;
  }

  if (env.NODE_ENV === 'production' && configuredOrigins.some((origin) => /localhost|127\.0\.0\.1/.test(origin))) {
    return true;
  }

  return configuredOrigins;
}

function resolveFrontendEntry(): { root: string; index: string } | null {
  const candidates = [
    process.env.FRONTEND_INDEX,
    process.env.FRONTEND_ROOT,
    path.join(process.cwd(), 'dist'),
    process.cwd(),
    path.join(process.cwd(), '..', 'dist'),
    path.join(process.cwd(), '..'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const resolvedCandidate = path.resolve(candidate);

    if (fs.existsSync(resolvedCandidate) && fs.statSync(resolvedCandidate).isFile()) {
      return {
        root: path.dirname(resolvedCandidate),
        index: resolvedCandidate
      };
    }

    const indexFile = path.join(resolvedCandidate, 'index.html');
    if (fs.existsSync(indexFile)) {
      return {
        root: resolvedCandidate,
        index: indexFile
      };
    }
  }

  return null;
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: getCorsOriginConfig(),
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

  const frontend = resolveFrontendEntry();

  if (frontend) {
    app.use(express.static(frontend.root));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }

      res.sendFile(frontend.index);
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
