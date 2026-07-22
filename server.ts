import express from 'express';
import net from 'net';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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

async function startServer() {
  const app = express();
  const preferredPort = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '127.0.0.1';
  const port = await resolvePort(preferredPort);

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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, host, () => {
    const displayHost = host === '127.0.0.1' ? 'localhost' : host;
    console.log(`[YatimCare Server] Running on http://${displayHost}:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start YatimCare server:', err);
});
