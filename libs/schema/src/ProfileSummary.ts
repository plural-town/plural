import { Visibility } from "@prisma/client";
import { DisplaySummary } from "./DisplaySummary";

export interface ProfileSummary {
  id: string;
  slug: string;

  parent: string | null;
  isRoot: boolean;

  displayId: string;

  display: DisplaySummary;

  visibility: Visibility;
}
