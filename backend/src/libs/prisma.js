const { PrismaClient } = require("@prisma/client");

// Keep engine noise low; verbose query logging can obscure real errors or stack traces
const prisma = new PrismaClient({
  log: ["error"],
  errorFormat: "minimal",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

module.exports = prisma;
