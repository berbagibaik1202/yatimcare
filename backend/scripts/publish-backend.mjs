import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const backendRoot = process.cwd();
const distDir = path.join(backendRoot, 'dist');
const runtimeOutputs = ['app.js', 'server.js', 'server.cjs', 'config', 'generated', 'lib', 'middleware', 'modules', 'routes'];

if (!fs.existsSync(distDir)) {
  throw new Error(`Backend dist directory not found: ${distDir}`);
}

for (const outputName of runtimeOutputs) {
  fs.rmSync(path.join(backendRoot, outputName), { recursive: true, force: true });
}

await build({
  entryPoints: [path.join(distDir, 'server.js')],
  outfile: path.join(backendRoot, 'server.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  logLevel: 'info'
});

fs.writeFileSync(
  path.join(backendRoot, 'server.js'),
  [
    "import { createRequire } from 'node:module';",
    "const require = createRequire(import.meta.url);",
    "console.log('[YatimCare Backend] Booting production wrapper');",
    'try {',
    "  require('./server.cjs');",
    '} catch (error) {',
    "  console.error('Failed to start backend', error);",
    '  process.exit(1);',
    '}',
    ''
  ].join('\n')
);

console.log(`Backend runtime published to ${backendRoot}`);
