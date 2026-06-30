import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./env";

const databaseUrl = getDatabaseUrl();

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const createClient = () =>
  new PrismaClient({
    datasources: { db: { url: databaseUrl ?? "" } },
    log: ["query", "error", "warn"],
  });

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
