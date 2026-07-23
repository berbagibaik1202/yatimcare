import express from 'express';
import fs from 'node:fs';
import net from 'net';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDatabaseConnectionInfo } from './backend/src/config/env.ts';
import apiRoutes from './backend/src/routes/index.ts';

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer();
    const host = process.env.HOST ?? '127.0.0.1';

    tester.once('error', () => resolve(false));
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, host);
  });
}

async function resolvePort(preferredPort: number): Promise<number> {
  for (let port = preferredPort; port < preferredPort + 10; port += 1) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  return preferredPort;
}

function parsePort(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveFrontendEntry(): { root: string; index: string } | null {
  const candidates = [
    process.env.FRONTEND_INDEX,
    process.env.FRONTEND_ROOT,
    path.join(process.cwd(), 'dist'),
    process.cwd(),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const resolvedCandidate = path.resolve(candidate);

    if (fs.existsSync(resolvedCandidate) && fs.statSync(resolvedCandidate).isFile()) {
      return {
        root: path.dirname(resolvedCandidate),
        index: resolvedCandidate,
      };
    }

    const indexFile = path.join(resolvedCandidate, 'index.html');
    if (fs.existsSync(indexFile)) {
      return {
        root: resolvedCandidate,
        index: indexFile,
      };
    }
  }

  return null;
}

async function startServer() {
  const app = express();
  const preferredPort = parsePort(process.env.PORT, 3000);
  const host = process.env.HOST ?? '127.0.0.1';
  const port = process.env.NODE_ENV === 'production' ? preferredPort : await resolvePort(preferredPort);
  const dbInfo = getDatabaseConnectionInfo();

  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
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
  }

  app.listen(port, host, () => {
    const displayHost = host === '127.0.0.1' ? 'localhost' : host;
    console.log(`[YatimCare Server] Running on http://${displayHost}:${port}`);
    console.log(
      `[YatimCare Server] Database target: host=${dbInfo.host}, port=${dbInfo.port}, user=${dbInfo.user}, database=${dbInfo.database}`
    );
  });
}

startServer().catch(err => {
  console.error('Failed to start YatimCare server:', err);
});
