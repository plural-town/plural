import { PrismaClient, REField, RemoteEntity, RemoteField } from "@prisma/client";
import { isFieldLanguage } from "./isFieldLanguage";

function fieldsOfType(allFields: REField[], type: RemoteField) {
  return allFields.filter((f) => f.field === type);
}

function hasVerifiedField(fields: REField[]) {
  return !!fields.find((f) => f.verified);
}

async function updateField(prisma: PrismaClient, field: REField, value: string) {
  return prisma.rEField.update({
    where: {
      id: field.id,
    },
    data: {
      value,
    },
  });
}

export async function storeRemoteFields(
  prisma: PrismaClient,
  entity: RemoteEntity & { fields: REField[] },
  type: RemoteField,
  verified: boolean,
  value?: string,
  valueMap?: Record<string, string>,
) {
  const existingFields = fieldsOfType(entity.fields, type);
  if (!verified && hasVerifiedField(existingFields)) {
    // TODO: Log that we can't update any `type` due to verified data
    return;
  }
  if (value) {
    const existingDefault = existingFields.find((f) => typeof f.lang !== "string");
    if (!existingDefault) {
      await prisma.rEField.create({
        data: {
          entityId: entity.id,
          field: type,
          verified,
          value,
        },
      });
    } else if (existingDefault.value !== value) {
      await updateField(prisma, existingDefault, value);
    }
  }
  if (valueMap) {
    for (const langKey in valueMap) {
      const lang = langKey.toUpperCase();
      if (!isFieldLanguage(lang)) {
        // TODO: log field has an unknown language key
        continue;
      }
      const value = valueMap[langKey];
      const existingField = existingFields.find((f) => f.lang === lang);
      if (existingField?.value === value) {
        continue;
      }
      if (!existingField) {
        await prisma.rEField.create({
          data: {
            entityId: entity.id,
            field: type,
            lang,
            verified,
            value,
          },
        });
      } else if (existingField.value !== value) {
        await updateField(prisma, existingField, value);
        continue;
      }
    }
  }
}
