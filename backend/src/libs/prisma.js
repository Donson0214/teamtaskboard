const { PrismaClient } = require("@prisma/client");

const databaseUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL or MONGODB_URI for Prisma.");
}

const prisma = new PrismaClient({
  log: ["error"],
  errorFormat: "minimal",
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

module.exports = prisma;
