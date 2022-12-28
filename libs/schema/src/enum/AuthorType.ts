import { AuthorType } from "@prisma/client";
import * as Yup from "yup";

export const AuthorTypeSchema = Yup.mixed<AuthorType>().oneOf([
  "FEATURED",
  "BYLINE",
  "NAMED",
  "PRIVATE",
]);
