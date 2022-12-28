import { AuthorType, Visibility } from "@prisma/client";
import * as Yup from "yup";
import { AuthorTypeSchema } from "./enum/AuthorType";
import { VisibilitySchema } from "./enum/Visibility";

export interface AddNoteDestination {
  profileId: string;
  localOnly: boolean;
  privacy: Visibility;
  noteAuthor: AuthorType;
}

export const AddNoteDestinationSchema = Yup.object().shape({
  profileId: Yup.string().required(),
  localOnly: Yup.bool().optional(),
  privacy: VisibilitySchema.required(),
  noteAuthor: AuthorTypeSchema.required(),
});
