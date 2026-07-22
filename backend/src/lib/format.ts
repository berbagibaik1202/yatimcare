import { Prisma } from '../generated/db.js';

export function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value);
}
