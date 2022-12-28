import { DisplaySummary } from "@plural/schema";

export function useDisplayName(display: DisplaySummary) {
  if(typeof display.displayName === "string" && display.displayName.length > 0) {
    return display.displayName;
  }
  return display.name;
}
