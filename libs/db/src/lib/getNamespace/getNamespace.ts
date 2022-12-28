import { UserSession } from "@plural/schema";
import { Namespace, PrismaClient, User } from "@prisma/client";

export async function getNamespace(
  namespaceId: UserSession | string,
  owner?: UserSession | number | User | false,
  prisma: PrismaClient = new PrismaClient(),
): Promise<Namespace> {
  const id = typeof namespaceId === "string" ? namespaceId : namespaceId.ns;
  const providedOwner = typeof namespaceId !== "string" ? namespaceId.id : false;

  if(!id) {
    throw new ReferenceError("No namespace specified.");
  }

  const namespace = await prisma.namespace.findUnique({
    where: {
      id,
    },
  });

  const checkOwner =
    owner === false
      ? false
      : typeof owner === "number"
        ? owner
        : typeof owner === "object"
          ? owner.id
          : providedOwner;

  if(!namespace || (checkOwner && namespace.userId !== checkOwner)) {
    throw new Error("Namespace not found.");
  }

  return namespace;
}
