const FALLBACK_JWT_SECRET =
  process.env.FALLBACK_JWT_SECRET ?? "supersecretkey";

export const getDatabaseUrl = () =>
  process.env.DATABASE_URL ??
  process.env.NEXT_PUBLIC_DATABASE_URL ??
  process.env.VERCEL_POSTGRES_URL ??
  null;

export const getJwtSecret = () =>
  process.env.JWT_SECRET ??
  process.env.NEXT_PUBLIC_JWT_SECRET ??
  FALLBACK_JWT_SECRET;