import { DisplaySummary } from "./DisplaySummary";

export interface IdentitySummary {
  id: string;

  role: "USER" | "MOD" | "ADMIN" | "OWNER";

  displayId: string;

  display: DisplaySummary;
}
