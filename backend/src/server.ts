async function main() {
  const { env, getDatabaseConnectionInfo } = await import('./config/env.js');
  const { createApp } = await import('./app.js');
  const { prisma: dbClient } = await import('./lib/db.js');
  const dbInfo = getDatabaseConnectionInfo();

  console.log(
    `[YatimCare Backend] Database target: host=${dbInfo.host}, port=${dbInfo.port}, user=${dbInfo.user}, database=${dbInfo.database}`
  );

  if (process.env.AUTO_SCHEMA_BOOTSTRAP === 'true') {
    const { ensureSchema } = await import('./lib/db.js');
    await ensureSchema();
  } else {
    console.log('[YatimCare Backend] Skipping schema initialization on startup');
  }

  let activeDbClient: { $disconnect?: () => Promise<void> } | null = dbClient;
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`YatimCare backend running on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await activeDbClient?.$disconnect?.();
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
