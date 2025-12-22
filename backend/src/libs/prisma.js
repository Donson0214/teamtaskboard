const { PrismaClient } = require("@prisma/client");
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
