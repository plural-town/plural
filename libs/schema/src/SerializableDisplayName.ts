import { DisplayName } from "@prisma/client";

/**
 * A version of {@link DisplayName} that can be serialized.
 *
 * Contains private information - use {@link DisplaySummary} instead of {@link SerializableDisplayName}
 * anywhere that users without write-access may see it.
 */
export type SerializableDisplayName
  = Omit<DisplayName, "createdAt" | "updatedAt">
  & {
    createdAt: string,
    updatedAt: string,
  };
