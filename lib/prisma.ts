import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logLevels =
  process.env.PRISMA_CLIENT_LOG_LEVEL?.split(",")
    .map((level) => level.trim())
    .filter((level): level is Prisma.LogLevel => level.length > 0) ?? [];

const prismaOptions = logLevels.length > 0 ? { log: logLevels } : undefined;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
