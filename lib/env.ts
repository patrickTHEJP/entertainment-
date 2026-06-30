const FALLBACK_DATABASE_URL =
  process.env.FALLBACK_DATABASE_URL ??
  "postgresql://neondb_owner:npg_IjJK0QomXt5g@ep-small-paper-a1gc7tnr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const FALLBACK_JWT_SECRET =
  process.env.FALLBACK_JWT_SECRET ?? "Roberto_Robertoson";

export const getDatabaseUrl = () =>
  process.env.DATABASE_URL ??
  process.env.NEXT_PUBLIC_DATABASE_URL ??
  process.env.VERCEL_POSTGRES_URL ??
  FALLBACK_DATABASE_URL ??
  null;

export const getJwtSecret = () =>
  process.env.JWT_SECRET ??
  process.env.NEXT_PUBLIC_JWT_SECRET ??
  FALLBACK_JWT_SECRET ??
  null;
