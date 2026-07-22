import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(currentDir, '../.env') });

async function main() {
  const [{ ensureSchema, prisma }, { createApp }, { env }] = await Promise.all([
    import('./lib/db.js'),
    import('./app.js'),
    import('./config/env.js')
  ]);
  await ensureSchema();
  let prismaClient: { $disconnect?: () => Promise<void> } | null = prisma;
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`YatimCare backend running on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prismaClient?.$disconnect?.();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(async (error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
