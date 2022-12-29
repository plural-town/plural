import { Visibility } from "@prisma/client";
import * as Yup from "yup";
import { VisibilitySchema } from "./enum/Visibility";

export interface UpdateDisplay {

  name: string;
  nameVisibility: Visibility;

  displayName: string;
  displayNameVisibility: Visibility;

  bio: string;
  bioVisibility: Visibility;

}

export const UpdateDisplaySchema = Yup.object().shape({
  name: Yup.string().min(1).required(),
  nameVisibility: VisibilitySchema.required(),
  displayName: Yup.string().optional(),
  displayNameVisibility: VisibilitySchema.required(),
  bio: Yup.string().optional(),
  bioVisibility: VisibilitySchema.required(),
});
