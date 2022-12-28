import { ImageSummary } from "./ImageSummary";

export interface DisplaySummary {
  name?: string;

  displayName?: string;

  avatar?: ImageSummary;

  banner?: ImageSummary;
}
