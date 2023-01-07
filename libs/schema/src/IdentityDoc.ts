import type { DisplayName, Identity, Role, Visibility } from "@prisma/client";
import * as Yup from "yup";
import { RoleSchema } from "./enum/Role";
import { VisibilitySchema } from "./enum/Visibility";

/**
 * A moderately flattened representation of an {@link Identity},
 * intended for rendering and ACL.
 */
export interface IdentityDoc {
  kind: "Identity";

  id: string;

  role?: Role;

  /**
   * The default visibility for this entire identity.
   */
  visibility?: Visibility;

  /**
   * The base name for this identity.
   */
  name?: string;

  /**
   * The visibility for the {@link name} field.
   */
  nameVisibility?: Visibility;
}

export const IdentityDocSchema = Yup.object().shape({
  id: Yup.string().required(),
  role: RoleSchema.optional(),
  visibility: VisibilitySchema.optional(),
  name: Yup.string().optional(),
  nameVisibility: VisibilitySchema.optional(),
});

export function createIdentityDoc(i: Identity & { display?: DisplayName }): IdentityDoc {
  return {
    kind: "Identity",
    id: i.id,
    role: i.role,
    // TODO: Add visibility field to identities
    visibility: "PUBLIC",
    name: i.display?.name,
    nameVisibility: i.display?.nameVisibility,
  };
}

const IDENTITY_PROFILE_FIELDS = ["id", "name"] as const;

/**
 * An version of {@link IdentityDoc} intended for public-facing renders.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IdentityProfile
  extends Pick<IdentityDoc, typeof IDENTITY_PROFILE_FIELDS[number]> {}

export const IdentityProfileSchema = IdentityDocSchema.pick(IDENTITY_PROFILE_FIELDS.map((i) => i));

export const UpdateIdentityDocSchema = Yup.object().shape({
  role: RoleSchema.optional(),
});
