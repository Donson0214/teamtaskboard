# Prisma Migrations (MongoDB)

This project uses Prisma with MongoDB. Prisma Migrate does not generate SQL
migration files for MongoDB, so schema changes are applied with `prisma db push`.

Use the provided scripts:

```
cd backend
npm run db:migrate
```

If you need to allow destructive changes:

```
cd backend
npm run db:migrate:force
```
