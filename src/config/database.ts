/**
 * Prisma Client Configuration
 * Singleton pattern for database connection
 */

import { PrismaClient } from '@prisma/client';

// Declare global type for prisma in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create singleton instance
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Prevent multiple instances in development (hot reloading)
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
