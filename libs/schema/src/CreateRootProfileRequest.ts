import { Visibility } from "@prisma/client";
import * as Yup from "yup";

export interface CreateRootProfileRequest {
  parent?: string;
  owner: string;
  slug: string;
  displayId?: string;

  display?: {
    name?: string;
    displayName?: string;
  }

  visibility: Visibility;
}

export const CreateRootProfileRequestSchema = Yup.object().shape({
  parent: Yup.string().optional(),
  owner: Yup.string().required(),
  slug: Yup.string().min(1).required(),

  displayId: Yup.string().optional(),

  display: Yup.object().when("displayId", {
    is: (id: string) => typeof id === "string" && id.length > 0,
    then: s => s.optional().shape({
      name: Yup.string().optional(),
      displayName: Yup.string().optional(),
    }),
    otherwise: s => s.required().shape({
      name: Yup.string().required(),
      displayName: Yup.string().optional(),
    }),
  }),

  visibility: Yup.mixed().oneOf([
    Visibility.PRIVATE,
    Visibility.SYSTEM,
    Visibility.FOLLOWERS,
    Visibility.UNLISTED,
    Visibility.PUBLIC,
  ]),
});
