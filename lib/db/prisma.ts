import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Limit connection pool for serverless — prevents MySQL "too many connections"
function buildUrl() {
  const url = process.env.DATABASE_URL ?? ''
  if (!url) return url
  const sep = url.includes('?') ? '&' : '?'
  return url + sep + 'connection_limit=5&pool_timeout=10'
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: { db: { url: buildUrl() } },
  })

globalForPrisma.prisma = prisma
