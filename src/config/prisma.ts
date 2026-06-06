import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * A single shared PrismaClient instance.
 *
 * In development, `tsx watch` reloads modules on every change; without caching
 * the instance on `globalThis` we would open a new connection pool on each
 * reload and eventually exhaust the database connections. Caching avoids that.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
