import { PrismaClient } from "@prisma/client";

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

let cache: PrismaClient;

export function prismaClient() {
  if (process.env["CACHE_DB"] !== "true") {
    // Cypress E2E tests hit cache issues if the client is not re-created after the database is reset.
    return new PrismaClient();
  }

  if (!cache && process.env["CACHE_DB_HOT_RELOAD"] === "true" && global.prisma) {
    cache = global.prisma;
  }

  const client = cache ?? new PrismaClient();

  if (process.env["CACHE_DB_HOT_RELOAD"] === "true") {
    // Persist Prisma client through hot-reloads - only relevant for development
    // https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-from-creating-new-instances-of-prismaclient
    global.prisma = client;
  }

  return client;
}
