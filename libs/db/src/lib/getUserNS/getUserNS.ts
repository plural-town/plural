import { PrismaClient, User } from "@prisma/client";

export async function getUserNS(
  user: User | number,
  prisma: PrismaClient = new PrismaClient(),
) {
  const userId = typeof user === "number" ? user : user.id;

  const found = await prisma.namespace.findMany({
    where: {
      userId,
    },
  });

  return found;
}
