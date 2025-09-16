const { PrismaClient } = require('../generated/prisma');

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database with Prisma:', error);
    return false;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  testConnection
};
