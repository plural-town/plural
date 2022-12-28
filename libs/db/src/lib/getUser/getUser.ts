import { UserSession } from "@plural/schema";
import { PrismaClient } from "@prisma/client";

export async function getUser(
  user: UserSession | number,
  prisma: PrismaClient = new PrismaClient(),
) {
  const id = typeof user === "number" ? user : user.id;
  const found = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
  return found;
}
