import { AuthorType, Visibility } from "@prisma/client";
import * as Yup from "yup";
import { AuthorTypeSchema } from "./enum/AuthorType";
import { VisibilitySchema } from "./enum/Visibility";

export interface UpdateNoteDestination {
  localOnly: boolean;
  privacy: Visibility;
  noteAuthor: AuthorType;
}

export const UpdateNoteDestinationSchema = Yup.object().shape({
  localOnly: Yup.bool().optional(),
  privacy: VisibilitySchema.required(),
  noteAuthor: AuthorTypeSchema.required(),
});
