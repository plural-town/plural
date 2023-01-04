import { FieldLanguage } from "@prisma/client";

export function isFieldLanguage(lang: string): lang is FieldLanguage {
  return Object.keys(FieldLanguage).includes(lang);
}
