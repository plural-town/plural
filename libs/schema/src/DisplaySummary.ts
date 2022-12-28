import { ImageSummary } from "./ImageSummary";

export interface DisplaySummary {
  name: string | null;

  displayName: string | null;

  avatar?: ImageSummary;

  banner?: ImageSummary;
}
