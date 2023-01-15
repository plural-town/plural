import { createContextualCan } from "@casl/react";
import { abilityFor, PluralTownRule, rulesFor } from "@plural-town/ability";
import { createContext, ReactNode, useContext, useMemo } from "react";

const AbilityContext = createContext(abilityFor(rulesFor([], [])));
export const AdminCan = createContextualCan(AbilityContext.Consumer);

export function useAdminAbility() {
  return useContext(AbilityContext);
}

export interface AdminProviderProps {
  rules: PluralTownRule[];
  children?: ReactNode;
}

export function AdminProvider({ rules, children }: AdminProviderProps) {
  const ability = useMemo(() => abilityFor(rules), [rules]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}

export default AdminCan;
