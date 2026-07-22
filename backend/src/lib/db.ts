import mysql, { type Pool, type PoolConnection } from 'mysql2/promise';
import { env } from '../config/env.js';
import { Decimal, Prisma } from '../generated/db.js';
import { ensureMysqlSchema } from './mysql-schema.js';

type AnyRecord = Record<string, any>;
type Queryable = Pool | PoolConnection;
type OrderDirection = 'asc' | 'desc';

type RelationSpec = {
  kind: 'one' | 'many';
  model: string;
  sourceKey?: string;
  foreignKey: string;
};

type ModelMeta = {
  table: string;
  primaryKey: string;
  booleanFields?: string[];
  jsonFields?: string[];
  relations?: Record<string, RelationSpec>;
};

type FindOptions = {
  where?: AnyRecord;
  orderBy?: Record<string, OrderDirection> | Array<Record<string, OrderDirection>>;
  take?: number;
  skip?: number;
  include?: AnyRecord;
  select?: AnyRecord;
};

type AggregateOptions = {
  where?: AnyRecord;
  _sum?: Record<string, boolean>;
  _count?: Record<string, boolean | { _all?: boolean }> | { _all?: boolean };
};

type GroupByOptions = {
  by: string[];
  where?: AnyRecord;
  _count?: Record<string, boolean | { _all?: boolean }> | { _all?: boolean };
  _sum?: Record<string, boolean>;
};

const MODEL_META: Record<string, ModelMeta> = {
  user: {
    table: 'User',
    primaryKey: 'id',
    relations: {
      guardianProfile: { kind: 'one', model: 'guardian', sourceKey: 'id', foreignKey: 'userId' },
      donorProfile: { kind: 'one', model: 'donor', sourceKey: 'id', foreignKey: 'userId' },
      verifiedChildren: { kind: 'many', model: 'child', sourceKey: 'id', foreignKey: 'verifiedById' },
      verifiedDonations: { kind: 'many', model: 'donation', sourceKey: 'id', foreignKey: 'verifiedById' },
      submittedExpenses: { kind: 'many', model: 'expense', sourceKey: 'id', foreignKey: 'submittedById' },
      approvedExpenses: { kind: 'many', model: 'expense', sourceKey: 'id', foreignKey: 'approvedById' },
      officerSurveys: { kind: 'many', model: 'survey', sourceKey: 'id', foreignKey: 'officerId' },
      officerAid: { kind: 'many', model: 'aidDistribution', sourceKey: 'id', foreignKey: 'officerId' },
      auditLogs: { kind: 'many', model: 'auditLog', sourceKey: 'id', foreignKey: 'actorUserId' },
      notifications: { kind: 'many', model: 'notification', sourceKey: 'id', foreignKey: 'userId' },
      createdNews: { kind: 'many', model: 'newsItem', sourceKey: 'id', foreignKey: 'createdById' }
    }
  },
  guardian: {
    table: 'Guardian',
    primaryKey: 'id',
    relations: {
      user: { kind: 'one', model: 'user', sourceKey: 'userId', foreignKey: 'id' },
      children: { kind: 'many', model: 'child', sourceKey: 'id', foreignKey: 'guardianId' }
    }
  },
  child: {
    table: 'Child',
    primaryKey: 'id',
    relations: {
      guardian: { kind: 'one', model: 'guardian', sourceKey: 'guardianId', foreignKey: 'id' },
      verifiedBy: { kind: 'one', model: 'user', sourceKey: 'verifiedById', foreignKey: 'id' },
      documents: { kind: 'many', model: 'childDocument', sourceKey: 'id', foreignKey: 'childId' },
      photos: { kind: 'many', model: 'childPhoto', sourceKey: 'id', foreignKey: 'childId' },
      surveys: { kind: 'many', model: 'survey', sourceKey: 'id', foreignKey: 'childId' },
      aidDistributions: { kind: 'many', model: 'aidDistribution', sourceKey: 'id', foreignKey: 'childId' }
    }
  },
  childDocument: {
    table: 'ChildDocument',
    primaryKey: 'id',
    relations: {
      child: { kind: 'one', model: 'child', sourceKey: 'childId', foreignKey: 'id' }
    }
  },
  childPhoto: {
    table: 'ChildPhoto',
    primaryKey: 'id',
    relations: {
      child: { kind: 'one', model: 'child', sourceKey: 'childId', foreignKey: 'id' }
    }
  },
  survey: {
    table: 'Survey',
    primaryKey: 'id',
    relations: {
      child: { kind: 'one', model: 'child', sourceKey: 'childId', foreignKey: 'id' },
      officer: { kind: 'one', model: 'user', sourceKey: 'officerId', foreignKey: 'id' }
    }
  },
  donor: {
    table: 'Donor',
    primaryKey: 'id',
    relations: {
      user: { kind: 'one', model: 'user', sourceKey: 'userId', foreignKey: 'id' },
      donations: { kind: 'many', model: 'donation', sourceKey: 'id', foreignKey: 'donorId' }
    }
  },
  program: {
    table: 'Program',
    primaryKey: 'id',
    relations: {
      donations: { kind: 'many', model: 'donation', sourceKey: 'id', foreignKey: 'programId' },
      expenses: { kind: 'many', model: 'expense', sourceKey: 'id', foreignKey: 'programId' },
      aidDistributions: { kind: 'many', model: 'aidDistribution', sourceKey: 'id', foreignKey: 'programId' }
    }
  },
  donation: {
    table: 'Donation',
    primaryKey: 'id',
    relations: {
      donor: { kind: 'one', model: 'donor', sourceKey: 'donorId', foreignKey: 'id' },
      program: { kind: 'one', model: 'program', sourceKey: 'programId', foreignKey: 'id' },
      verifiedBy: { kind: 'one', model: 'user', sourceKey: 'verifiedById', foreignKey: 'id' }
    }
  },
  expense: {
    table: 'Expense',
    primaryKey: 'id',
    relations: {
      program: { kind: 'one', model: 'program', sourceKey: 'programId', foreignKey: 'id' },
      submittedBy: { kind: 'one', model: 'user', sourceKey: 'submittedById', foreignKey: 'id' },
      approvedBy: { kind: 'one', model: 'user', sourceKey: 'approvedById', foreignKey: 'id' }
    }
  },
  aidDistribution: {
    table: 'AidDistribution',
    primaryKey: 'id',
    relations: {
      child: { kind: 'one', model: 'child', sourceKey: 'childId', foreignKey: 'id' },
      program: { kind: 'one', model: 'program', sourceKey: 'programId', foreignKey: 'id' },
      officer: { kind: 'one', model: 'user', sourceKey: 'officerId', foreignKey: 'id' }
    }
  },
  bankAccount: {
    table: 'BankAccount',
    primaryKey: 'id'
  },
  auditLog: {
    table: 'AuditLog',
    primaryKey: 'id',
    jsonFields: ['metadata'],
    relations: {
      actorUser: { kind: 'one', model: 'user', sourceKey: 'actorUserId', foreignKey: 'id' }
    }
  },
  notification: {
    table: 'Notification',
    primaryKey: 'id'
  },
  systemSetting: {
    table: 'SystemSetting',
    primaryKey: 'key',
    jsonFields: ['value']
  },
  newsItem: {
    table: 'NewsItem',
    primaryKey: 'id',
    relations: {
      createdBy: { kind: 'one', model: 'user', sourceKey: 'createdById', foreignKey: 'id' }
    }
  },
  galleryItem: {
    table: 'GalleryItem',
    primaryKey: 'id'
  }
};

type ModelName = keyof typeof MODEL_META;

const BOOLEAN_FIELDS: Record<string, string[]> = {
  childPhoto: ['isPublic'],
  survey: ['documentMatch'],
  donor: ['isAnonymousDefault', 'isRecurringDonor'],
  program: ['isFeatured'],
  donation: ['isAnonymous'],
  bankAccount: ['isActive'],
  notification: ['isRead'],
  newsItem: ['isPublished'],
  galleryItem: ['isPublic']
};

function createId() {
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`.slice(0, 25);
}

function isPlainObject(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Decimal);
}

function isEmptyObject(value: unknown) {
  return isPlainObject(value) && Object.keys(value).length === 0;
}

function cloneRow(row: AnyRecord) {
  return { ...row };
}

function normalizeComparable(value: any) {
  if (value instanceof Decimal) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return value;
}

function valuesEqual(left: any, right: any) {
  if (left instanceof Date || right instanceof Date) {
    const leftTime = left instanceof Date ? left.getTime() : new Date(left).getTime();
    const rightTime = right instanceof Date ? right.getTime() : new Date(right).getTime();
    return leftTime === rightTime;
  }

  return normalizeComparable(left) === normalizeComparable(right);
}

function matchesWhere(row: AnyRecord, where?: AnyRecord): boolean {
  if (!where || isEmptyObject(where)) {
    return true;
  }

  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(value)) {
      if (!value.some((part) => matchesWhere(row, part))) {
        return false;
      }
      continue;
    }

    if (key === 'AND' && Array.isArray(value)) {
      if (!value.every((part) => matchesWhere(row, part))) {
        return false;
      }
      continue;
    }

    if (key === 'NOT') {
      if (matchesWhere(row, value as AnyRecord)) {
        return false;
      }
      continue;
    }

    const actual = row[key];

    if (isPlainObject(value)) {
      if (Array.isArray(value.in) && !value.in.some((item: any) => valuesEqual(actual, item))) {
        return false;
      }

      if (value.not !== undefined && valuesEqual(actual, value.not)) {
        return false;
      }

      if (value.equals !== undefined && !valuesEqual(actual, value.equals)) {
        return false;
      }

      continue;
    }

    if (!valuesEqual(actual, value)) {
      return false;
    }
  }

  return true;
}

function sortRows(rows: AnyRecord[], orderBy?: Record<string, OrderDirection> | Array<Record<string, OrderDirection>>) {
  if (!orderBy) {
    return rows;
  }

  const orderParts = Array.isArray(orderBy) ? orderBy : [orderBy];

  return [...rows].sort((left, right) => {
    for (const part of orderParts) {
      const [field, direction] = Object.entries(part)[0] ?? [];
      if (!field) {
        continue;
      }

      const leftValue = normalizeComparable(left[field]);
      const rightValue = normalizeComparable(right[field]);

      if (leftValue === rightValue) {
        continue;
      }

      if (leftValue === undefined || leftValue === null) {
        return direction === 'desc' ? 1 : -1;
      }

      if (rightValue === undefined || rightValue === null) {
        return direction === 'desc' ? -1 : 1;
      }

      if (leftValue < rightValue) {
        return direction === 'desc' ? 1 : -1;
      }

      if (leftValue > rightValue) {
        return direction === 'desc' ? -1 : 1;
      }
    }

    return 0;
  });
}

function applySelect(row: AnyRecord, select?: AnyRecord) {
  if (!select || isEmptyObject(select)) {
    return row;
  }

  const projected: AnyRecord = {};
  for (const [key, value] of Object.entries(select)) {
    if (value) {
      projected[key] = row[key];
    }
  }

  return projected;
}

function mergeWhere(baseWhere?: AnyRecord, extraWhere?: AnyRecord) {
  if (!baseWhere) {
    return extraWhere;
  }

  if (!extraWhere) {
    return baseWhere;
  }

  return {
    AND: [baseWhere, extraWhere]
  };
}

function normalizeJsonValue(value: unknown) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Decimal) {
    return value.toString();
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    return JSON.stringify(value);
  }

  return value;
}

function parseJsonValue(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeWriteData(model: ModelName, data: AnyRecord) {
  const meta = MODEL_META[model];
  const booleanFields = new Set(BOOLEAN_FIELDS[model] ?? []);
  const jsonFields = new Set(meta.jsonFields ?? []);
  const normalized: AnyRecord = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    if (booleanFields.has(key)) {
      normalized[key] = Boolean(value);
      continue;
    }

    if (jsonFields.has(key)) {
      normalized[key] = normalizeJsonValue(value);
      continue;
    }

    if (value instanceof Decimal) {
      normalized[key] = value.toString();
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

function normalizeRow(model: ModelName, row: AnyRecord) {
  const normalized = cloneRow(row);
  const booleanFields = BOOLEAN_FIELDS[model] ?? [];
  const jsonFields = MODEL_META[model].jsonFields ?? [];

  for (const field of booleanFields) {
    if (field in normalized && normalized[field] !== null && normalized[field] !== undefined) {
      normalized[field] = Boolean(Number(normalized[field]));
    }
  }

  for (const field of jsonFields) {
    if (field in normalized) {
      normalized[field] = parseJsonValue(normalized[field]);
    }
  }

  return normalized;
}

class MysqlCompatClient {
  private readonly db: Queryable;

  constructor(db: Queryable) {
    this.db = db;
    for (const modelName of Object.keys(MODEL_META) as ModelName[]) {
      (this as AnyRecord)[modelName] = new ModelDelegate(this, modelName);
    }
  }

  async $disconnect() {
    if ('end' in this.db) {
      await this.db.end();
    }
  }

  async $transaction<T>(callback: (tx: MysqlCompatClient) => Promise<T>): Promise<T> {
    if (!('getConnection' in this.db)) {
      return callback(this);
    }

    const connection = await (this.db as Pool).getConnection();
    try {
      await connection.beginTransaction();
      const tx = new MysqlCompatClient(connection);
      const result = await callback(tx);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async selectAll(model: ModelName) {
    const meta = MODEL_META[model];
    const [rows] = await this.db.query(`SELECT * FROM \`${meta.table}\``);
    return Array.isArray(rows) ? rows.map((row: AnyRecord) => normalizeRow(model, row)) : [];
  }

  async findMany(model: ModelName, options: FindOptions = {}) {
    const rows = await this.selectAll(model);
    const filtered = rows.filter((row) => matchesWhere(row, options.where));
    const ordered = sortRows(filtered, options.orderBy);
    const sliced = options.skip || options.take !== undefined ? ordered.slice(options.skip ?? 0, options.take !== undefined ? (options.skip ?? 0) + options.take : undefined) : ordered;
    const selected = sliced.map((row) => applySelect(row, options.select));
    return this.applyIncludes(model, selected, options.include);
  }

  async findFirst(model: ModelName, options: FindOptions = {}) {
    const rows = await this.findMany(model, { ...options, take: 1 });
    return rows[0] ?? null;
  }

  async findUnique(model: ModelName, options: FindOptions & { where: AnyRecord }) {
    const rows = await this.findMany(model, options);
    return rows[0] ?? null;
  }

  async count(model: ModelName, options: FindOptions = {}) {
    const rows = await this.findMany(model, options);
    return rows.length;
  }

  async aggregate(model: ModelName, options: AggregateOptions = {}) {
    const rows = await this.findMany(model, { where: options.where });
    const sum: AnyRecord = {};
    if (options._sum) {
      for (const [field, enabled] of Object.entries(options._sum)) {
        if (!enabled) {
          continue;
        }

        sum[field] = rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
      }
    }

    const count: AnyRecord = {};
    if (options._count) {
      if ('_all' in options._count) {
        count._all = rows.length;
      } else {
        for (const [field, enabled] of Object.entries(options._count)) {
          if (field === '_all') {
            continue;
          }
          if (enabled) {
            count[field] = rows.filter((row) => row[field] !== null && row[field] !== undefined).length;
          }
        }
      }
    }

    return {
      _sum: sum,
      _count: count
    };
  }

  async groupBy(model: ModelName, options: GroupByOptions) {
    const rows = await this.findMany(model, { where: options.where });
    const byFields = options.by;
    const groups = new Map<string, AnyRecord>();

    for (const row of rows) {
      const key = byFields.map((field) => JSON.stringify(row[field] ?? null)).join('|');
      let group = groups.get(key);

      if (!group) {
        group = {};
        for (const field of byFields) {
          group[field] = row[field];
        }
        group._count = {};
        group._sum = {};
        groups.set(key, group);
      }

      if (options._count) {
        if ('_all' in options._count) {
          group._count._all = (group._count._all ?? 0) + 1;
        } else {
          for (const [field, enabled] of Object.entries(options._count)) {
            if (enabled) {
              group._count[field] = (group._count[field] ?? 0) + (row[field] !== null && row[field] !== undefined ? 1 : 0);
            }
          }
        }
      }

      if (options._sum) {
        for (const [field, enabled] of Object.entries(options._sum)) {
          if (enabled) {
            group._sum[field] = Number(group._sum[field] ?? 0) + Number(row[field] ?? 0);
          }
        }
      }
    }

    return Array.from(groups.values()).map((group) => {
      const output: AnyRecord = {};
      for (const field of byFields) {
        output[field] = group[field];
      }
      if (options._count) {
        output._count = group._count;
      }
      if (options._sum) {
        output._sum = group._sum;
      }
      return output;
    });
  }

  async create(model: ModelName, options: { data: AnyRecord; include?: AnyRecord }) {
    const meta = MODEL_META[model];
    const data = normalizeWriteData(model, { ...options.data });
    if (meta.primaryKey === 'id' && data.id === undefined) {
      data.id = createId();
    }

    await this.db.query(`INSERT INTO \`${meta.table}\` SET ?`, [data]);
    const uniqueWhere = { [meta.primaryKey]: data[meta.primaryKey] };
    return this.findUnique(model, { where: uniqueWhere, include: options.include });
  }

  async createMany(model: ModelName, options: { data: AnyRecord[] }) {
    let count = 0;
    for (const item of options.data) {
      await this.create(model, { data: item });
      count += 1;
    }
    return { count };
  }

  async update(model: ModelName, options: { where: AnyRecord; data: AnyRecord; include?: AnyRecord }) {
    const meta = MODEL_META[model];
    const target = await this.findUnique(model, { where: options.where });
    if (!target) {
      throw new Error(`${meta.table} record not found`);
    }

    const data = normalizeWriteData(model, { ...options.data });
    const assignments = Object.entries(data).filter(([, value]) => value !== undefined);
    if (assignments.length > 0) {
      const setSql = assignments.map(([key]) => `\`${key}\` = ?`).join(', ');
      const params = assignments.map(([, value]) => value);
      await this.db.query(
        `UPDATE \`${meta.table}\` SET ${setSql} WHERE \`${meta.primaryKey}\` = ?`,
        [...params, target[meta.primaryKey]]
      );
    }

    return this.findUnique(model, { where: { [meta.primaryKey]: target[meta.primaryKey] }, include: options.include });
  }

  async delete(model: ModelName, options: { where: AnyRecord }) {
    const meta = MODEL_META[model];
    const target = await this.findUnique(model, { where: options.where });
    if (!target) {
      throw new Error(`${meta.table} record not found`);
    }

    await this.db.query(`DELETE FROM \`${meta.table}\` WHERE \`${meta.primaryKey}\` = ?`, [target[meta.primaryKey]]);
    return target;
  }

  async deleteMany(model: ModelName, options: { where?: AnyRecord } = {}) {
    const rows = await this.findMany(model, { where: options.where });
    for (const row of rows) {
      await this.delete(model, { where: { [MODEL_META[model].primaryKey]: row[MODEL_META[model].primaryKey] } });
    }
    return { count: rows.length };
  }

  async upsert(
    model: ModelName,
    options: {
      where: AnyRecord;
      create: AnyRecord;
      update: AnyRecord;
      include?: AnyRecord;
    }
  ) {
    const existing = await this.findUnique(model, { where: options.where });
    if (existing) {
      return this.update(model, { where: options.where, data: options.update, include: options.include });
    }

    return this.create(model, { data: { ...options.create, ...options.where }, include: options.include });
  }

  private async applyIncludes(model: ModelName, rows: AnyRecord[], include?: AnyRecord) {
    if (!include || isEmptyObject(include)) {
      return rows;
    }

    const meta = MODEL_META[model];
    const relations = meta.relations ?? {};

    const output: AnyRecord[] = [];
    for (const row of rows) {
      const nextRow = cloneRow(row);
      for (const [relationName, relationInclude] of Object.entries(include)) {
        const relation = relations[relationName];
        if (!relation) {
          continue;
        }

        const relationOptions = relationInclude && relationInclude !== true && isPlainObject(relationInclude) ? relationInclude : {};

        if (relation.kind === 'one') {
          const sourceKey = relation.sourceKey ?? meta.primaryKey;
          const value = row[sourceKey];
          if (value === undefined || value === null) {
            nextRow[relationName] = null;
            continue;
          }

          nextRow[relationName] = await this.findFirst(relation.model, {
            where: { [relation.foreignKey]: value },
            include: relationOptions.include
          });
          continue;
        }

        const sourceKey = relation.sourceKey ?? meta.primaryKey;
        const value = row[sourceKey];
        if (value === undefined || value === null) {
          nextRow[relationName] = [];
          continue;
        }

        nextRow[relationName] = await this.findMany(relation.model, {
          where: mergeWhere({ [relation.foreignKey]: value }, relationOptions.where),
          orderBy: relationOptions.orderBy,
          take: relationOptions.take,
          skip: relationOptions.skip,
          include: relationOptions.include,
          select: relationOptions.select
        });
      }
      output.push(nextRow);
    }

    return output;
  }
}

class ModelDelegate {
  private readonly model: ModelName;
  private readonly client: MysqlCompatClient;

  constructor(client: MysqlCompatClient, model: ModelName) {
    this.client = client;
    this.model = model;
  }

  findMany(options?: FindOptions) {
    return this.client.findMany(this.model, options ?? {});
  }

  findFirst(options?: FindOptions) {
    return this.client.findFirst(this.model, options ?? {});
  }

  findUnique(options: FindOptions & { where: AnyRecord }) {
    return this.client.findUnique(this.model, options);
  }

  count(options?: FindOptions) {
    return this.client.count(this.model, options ?? {});
  }

  aggregate(options?: AggregateOptions) {
    return this.client.aggregate(this.model, options ?? {});
  }

  groupBy(options: GroupByOptions) {
    return this.client.groupBy(this.model, options);
  }

  create(options: { data: AnyRecord; include?: AnyRecord }) {
    return this.client.create(this.model, options);
  }

  createMany(options: { data: AnyRecord[] }) {
    return this.client.createMany(this.model, options);
  }

  update(options: { where: AnyRecord; data: AnyRecord; include?: AnyRecord }) {
    return this.client.update(this.model, options);
  }

  delete(options: { where: AnyRecord }) {
    return this.client.delete(this.model, options);
  }

  deleteMany(options?: { where?: AnyRecord }) {
    return this.client.deleteMany(this.model, options ?? {});
  }

  upsert(options: { where: AnyRecord; create: AnyRecord; update: AnyRecord; include?: AnyRecord }) {
    return this.client.upsert(this.model, options);
  }
}

const pool = mysql.createPool(env.DATABASE_URL);
const prismaClient = new MysqlCompatClient(pool);

export const prisma = prismaClient as AnyRecord;
export { Prisma, Decimal };

export async function ensureSchema() {
  await ensureMysqlSchema(pool);
}
