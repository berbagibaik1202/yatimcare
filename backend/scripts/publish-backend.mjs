import fs from 'node:fs';
import path from 'node:path';

const backendRoot = process.cwd();
const distDir = path.join(backendRoot, 'dist');

if (!fs.existsSync(distDir)) {
  throw new Error(`Backend dist directory not found: ${distDir}`);
}

function removeRuntimeOutput(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function copyDirContents(sourceDir, targetDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

[
  'app.js',
  'server.js',
  'config',
  'generated',
  'lib',
  'middleware',
  'modules',
  'routes'
].forEach(name => removeRuntimeOutput(path.join(backendRoot, name)));

copyDirContents(distDir, backendRoot);

console.log(`Backend runtime published to ${backendRoot}`);
