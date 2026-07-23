import fs from 'node:fs';
import path from 'path';
import { z } from 'zod';

const cwdRoot = process.cwd();
const cwdEnvPath = path.join(cwdRoot, '.env');
const backendEnvPath = path.join(cwdRoot, 'backend', '.env');

function parseEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const result: Record<string, string> = {};
  const contents = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (!key) {
      continue;
    }

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function loadEnvFile(filePath: string, override = false) {
  const parsed = parseEnvFile(filePath);

  for (const [key, value] of Object.entries(parsed)) {
    const normalizedKey = key.toUpperCase();

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }

    if (normalizedKey !== key && (override || process.env[normalizedKey] === undefined)) {
      process.env[normalizedKey] = value;
    }
  }
}

function normalizeRuntimeEnvKeys() {
  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined) {
      continue;
    }

    const normalizedKey = key.toUpperCase();
    if (normalizedKey !== key && process.env[normalizedKey] === undefined) {
      process.env[normalizedKey] = value;
    }
  }
}

normalizeRuntimeEnvKeys();
loadEnvFile(cwdEnvPath, false);
if (path.resolve(cwdEnvPath) !== path.resolve(backendEnvPath)) {
  loadEnvFile(backendEnvPath, false);
}

const isProduction = (process.env.NODE_ENV ?? '').toLowerCase() === 'production';
const defaultDatabaseHost = isProduction ? 'db' : 'localhost';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_HOST: z.string().min(1).default(defaultDatabaseHost),
  DATABASE_PORT: z.coerce.number().int().positive().default(3306),
  DATABASE_USER: z.string().min(1).default('root'),
  DATABASE_PASSWORD: z.string().optional().default(''),
  DATABASE_NAME: z.string().min(1).default('yatimcare'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16).default('change-me-in-production'),
  CORS_ORIGIN: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid backend environment: ${parsed.error.message}`);
}

export const env = parsed.data;

export function getDatabaseUrl() {
  const legacyUrl = env.DATABASE_URL?.trim();

  if (legacyUrl) {
    return legacyUrl;
  }

  const connection = new URL('mysql://localhost');
  connection.hostname = env.DATABASE_HOST;
  connection.port = String(env.DATABASE_PORT);
  connection.username = env.DATABASE_USER;
  connection.password = env.DATABASE_PASSWORD ?? '';
  connection.pathname = `/${env.DATABASE_NAME}`;

  return connection.toString();
}

export function getDatabaseConnectionInfo() {
  return {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    database: env.DATABASE_NAME
  };
}
