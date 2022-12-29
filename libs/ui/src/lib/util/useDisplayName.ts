import { DisplaySummary } from "@plural/schema";

export function getDisplayName(display: DisplaySummary) {
  if(typeof display.displayName === "string" && display.displayName.length > 0) {
    return display.displayName;
  }
  return display.name;
}

export function useDisplayName(display: DisplaySummary) {
  return getDisplayName(display);
}
