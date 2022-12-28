import { Visibility } from "@prisma/client";
import * as Yup from "yup";

export const VisibilitySchema = Yup.mixed<Visibility>().oneOf([
  "PUBLIC",
  "UNLISTED",
  "FOLLOWERS",
  "MUTUALS",
  "SYSTEM",
  "PRIVATE",
]);
