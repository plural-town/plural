import { Visibility } from "@prisma/client";
import { DisplaySummary } from "./DisplaySummary";

export interface ProfileSummary {
  id: string;
  slug: string;

  /**
   * e.g. `@jay@plural.gg`
   */
  fullUsername: string;

  /**
   * e.g. `https://plural.gg/@jay/`
   */
  profileURL: string;

  parent: string | null;
  isRoot: boolean;

  displayId: string;

  display: DisplaySummary;

  visibility: Visibility;
}
