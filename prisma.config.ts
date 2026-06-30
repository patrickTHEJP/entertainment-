import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.NEXT_PUBLIC_DATABASE_URL ??
  process.env.VERCEL_POSTGRES_URL ??
  process.env.FALLBACK_DATABASE_URL ??
  "postgresql://neondb_owner:npg_IjJK0QomXt5g@ep-small-paper-a1gc7tnr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

export default defineConfig({
  schema: "./prisma/schema.prisma", // path to your Prisma schema
  migrations: {
    path: "./prisma/migrations", // where migration files will be stored
  },
  datasource: {
    url: databaseUrl, // your PostgreSQL connection string
  },
});
