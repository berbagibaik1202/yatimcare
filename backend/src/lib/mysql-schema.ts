import fs from 'node:fs';
import path from 'node:path';
import type { Pool } from 'mysql2/promise';

type ColumnDef = {
  name: string;
  sqlType: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  defaultSql?: string;
  onUpdateCurrentTimestamp?: boolean;
};

type TableDef = {
  name: string;
  columns: ColumnDef[];
  indexes: Array<{ name: string; columns: string[] }>;
};

const SCALAR_TYPES = new Set(['String', 'Int', 'Boolean', 'DateTime', 'Decimal', 'Json', 'Float', 'BigInt', 'Bytes']);
const ENUM_NAMES = new Set<string>();

function resolveSchemaPath() {
  const runtimeDir = process.cwd();
  const candidates = [
    path.resolve(runtimeDir, 'schema/database-schema.txt'),
    path.resolve(runtimeDir, 'backend/schema/database-schema.txt')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Database schema file not found for MySQL initialization');
}

function readSchemaSource() {
  return fs.readFileSync(resolveSchemaPath(), 'utf8');
}

function parseEnums(schema: string) {
  for (const match of schema.matchAll(/enum\s+(\w+)\s+\{[\s\S]*?\n\}/g)) {
    ENUM_NAMES.add(match[1]);
  }
}

function parseDefaultToken(raw: string | undefined, sqlType: string) {
  if (!raw) {
    return undefined;
  }

  const cleaned = raw.trim();

  if (cleaned === 'now()') {
    return 'DEFAULT CURRENT_TIMESTAMP';
  }

  if (cleaned === 'true') {
    return 'DEFAULT 1';
  }

  if (cleaned === 'false') {
    return 'DEFAULT 0';
  }

  if (/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return `DEFAULT ${cleaned}`;
  }

  if (sqlType.startsWith('VARCHAR') || sqlType.startsWith('CHAR') || sqlType.startsWith('TEXT') || sqlType === 'JSON') {
    return `DEFAULT ${JSON.stringify(cleaned.replace(/^"|"$/g, ''))}`;
  }

  return undefined;
}

function parseSqlType(typeName: string, attributes: string) {
  const decimalMatch = attributes.match(/@db\.Decimal\((\d+),\s*(\d+)\)/);
  if (decimalMatch) {
    return `DECIMAL(${decimalMatch[1]},${decimalMatch[2]})`;
  }

  const varcharMatch = attributes.match(/@db\.VarChar\((\d+)\)/i);
  if (varcharMatch) {
    return `VARCHAR(${varcharMatch[1]})`;
  }

  const charMatch = attributes.match(/@db\.Char\((\d+)\)/i);
  if (charMatch) {
    return `CHAR(${charMatch[1]})`;
  }

  if (/@db\.LongText/.test(attributes)) {
    return 'LONGTEXT';
  }

  if (/@db\.Text/.test(attributes)) {
    return 'TEXT';
  }

  if (/@db\.Date/.test(attributes)) {
    return 'DATE';
  }

  switch (typeName) {
    case 'String':
      return 'VARCHAR(255)';
    case 'Int':
      return 'INT';
    case 'Boolean':
      return 'TINYINT(1)';
    case 'DateTime':
      return 'DATETIME';
    case 'Decimal':
      return 'DECIMAL(18,2)';
    case 'Json':
      return 'JSON';
    case 'Float':
      return 'DOUBLE';
    case 'BigInt':
      return 'BIGINT';
    case 'Bytes':
      return 'BLOB';
    default:
      return ENUM_NAMES.has(typeName) ? 'VARCHAR(50)' : 'VARCHAR(255)';
  }
}

function parseField(line: string): ColumnDef | null {
  const cleaned = line.trim();
  if (!cleaned || cleaned.startsWith('//') || cleaned.startsWith('@@') || cleaned.startsWith('@')) {
    return null;
  }

  const fieldMatch = cleaned.match(/^(\w+)\s+([A-Za-z_][\w]*)(\??)\s*(.*)$/);
  if (!fieldMatch) {
    return null;
  }

  const [, name, rawType, optionalMark, attrs] = fieldMatch;
  if (!SCALAR_TYPES.has(rawType) && !ENUM_NAMES.has(rawType)) {
    return null;
  }

  const primaryKey = /@id\b/.test(attrs);
  const unique = /@unique\b/.test(attrs);
  const nullable = optionalMark === '?';
  const sqlType = parseSqlType(rawType, attrs);
  const defaultToken = attrs.match(/@default\(([^)]+)\)/)?.[1];
  const defaultSql = parseDefaultToken(defaultToken, sqlType);
  const onUpdateCurrentTimestamp = /@updatedAt\b/.test(attrs) && rawType === 'DateTime';

  return {
    name,
    sqlType,
    nullable,
    primaryKey,
    unique,
    defaultSql,
    onUpdateCurrentTimestamp
  };
}

function parseModels(schema: string) {
  const models: TableDef[] = [];
  const modelPattern = /model\s+(\w+)\s+\{([\s\S]*?)\n\}/g;

  for (const match of schema.matchAll(modelPattern)) {
    const [, name, body] = match;
    const lines = body.split(/\r?\n/);
    const columns: ColumnDef[] = [];
    const indexes: Array<{ name: string; columns: string[] }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      if (trimmed.startsWith('@@index(')) {
        const indexMatch = trimmed.match(/@@index\(\[([^\]]+)\]\)/);
        if (indexMatch) {
          const columnsList = indexMatch[1].split(',').map(part => part.trim()).filter(Boolean);
          indexes.push({
            name: `${name.toLowerCase()}_${columnsList.join('_')}_idx`,
            columns: columnsList
          });
        }
        continue;
      }

      const column = parseField(trimmed);
      if (column) {
        columns.push(column);
      }
    }

    models.push({ name, columns, indexes });
  }

  return models;
}

function buildCreateTableStatement(table: TableDef) {
  const columnStatements = table.columns.map(column => {
    const parts = [`\`${column.name}\` ${column.sqlType}`];

    if (column.nullable) {
      parts.push('NULL');
    } else {
      parts.push('NOT NULL');
    }

    if (column.defaultSql) {
      parts.push(column.defaultSql);
    }

    if (column.onUpdateCurrentTimestamp) {
      parts.push('ON UPDATE CURRENT_TIMESTAMP');
    }

    return parts.join(' ');
  });

  const primaryColumns = table.columns.filter(column => column.primaryKey).map(column => `\`${column.name}\``);
  const uniqueColumns = table.columns.filter(column => column.unique && !column.primaryKey);
  const uniqueStatements = uniqueColumns.map(column => `UNIQUE KEY \`${table.name.toLowerCase()}_${column.name}_unique\` (\`${column.name}\`)`);
  const indexStatements = table.indexes.map(index => `KEY \`${index.name}\` (${index.columns.map(column => `\`${column}\``).join(', ')})`);

  const constraints = [
    ...columnStatements,
    ...(primaryColumns.length ? [`PRIMARY KEY (${primaryColumns.join(', ')})`] : []),
    ...uniqueStatements,
    ...indexStatements
  ];

  return `CREATE TABLE IF NOT EXISTS \`${table.name}\` (\n  ${constraints.join(',\n  ')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
}

export async function ensureMysqlSchema(pool: Pool) {
  const schema = readSchemaSource();
  parseEnums(schema);
  const tables = parseModels(schema);

  const [rows] = await pool.query(
    'SELECT COUNT(*) AS countValue FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
    ['User']
  );

  const row = Array.isArray(rows) ? rows[0] as { countValue?: number } | undefined : undefined;
  if ((row?.countValue ?? 0) > 0) {
    return;
  }

  for (const table of tables) {
    const sql = buildCreateTableStatement(table);
    await pool.query(sql);
  }
}
