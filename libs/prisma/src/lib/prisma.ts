import { PrismaClient } from "@prisma/client";

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

export const prisma = global.prisma || new PrismaClient();

if (process.env["NODE_ENV"] == "development") {
  // Persist Prisma client through hot-reloads - only relevant for development
  // https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-from-creating-new-instances-of-prismaclient
  global.prisma = prisma;
}
