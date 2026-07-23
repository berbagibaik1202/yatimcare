import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const releaseDir = path.join(rootDir, 'release');
const clientDistDir = path.join(rootDir, 'dist');
const backendRootDir = path.join(rootDir, 'backend');
const backendDir = path.join(releaseDir, 'backend');

function copyDirContents(sourceDir, targetDir, filter = () => true) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}`);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!filter(entry)) continue;

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function copyIfExists(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) {
    return;
  }

  const stat = fs.statSync(sourcePath);

  if (stat.isDirectory()) {
    fs.cpSync(sourcePath, targetPath, { recursive: true });
    return;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

function writeReleasePackageJson(sourcePackagePath, targetPackagePath) {
  const sourcePackage = JSON.parse(fs.readFileSync(sourcePackagePath, 'utf8'));
  const releasePackage = {
    name: sourcePackage.name,
    private: true,
    version: sourcePackage.version,
    type: sourcePackage.type,
    scripts: {
      start: 'node server.cjs'
    }
  };

  fs.writeFileSync(targetPackagePath, `${JSON.stringify(releasePackage, null, 2)}\n`);
}

function copyBackendRuntime(sourceDir, targetDir) {
  const allowedNames = new Set(['server.cjs', 'schema']);

  copyDirContents(sourceDir, targetDir, entry => {
    if (entry.name === 'package-lock.json') {
      return false;
    }

    if (entry.name === 'package.json') {
      return false;
    }

    if (entry.name.startsWith('.env')) {
      return false;
    }

    return allowedNames.has(entry.name);
  });
}

fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });

copyDirContents(clientDistDir, releaseDir, entry => entry.name !== 'server.cjs');

fs.mkdirSync(backendDir, { recursive: true });
copyBackendRuntime(backendRootDir, backendDir);

writeReleasePackageJson(path.join(rootDir, 'backend', 'package.json'), path.join(backendDir, 'package.json'));
copyIfExists(path.join(rootDir, 'backend', '.env.example'), path.join(backendDir, '.env.example'));

const backendEnvPath = path.join(rootDir, 'backend', '.env');
const rootEnvPath = path.join(rootDir, '.env');

if (fs.existsSync(backendEnvPath)) {
  copyIfExists(backendEnvPath, path.join(backendDir, '.env'));
} else {
  copyIfExists(rootEnvPath, path.join(backendDir, '.env'));
}

console.log(`Release package prepared at ${releaseDir}`);
