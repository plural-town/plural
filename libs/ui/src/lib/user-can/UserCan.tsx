import { createContextualCan } from "@casl/react";
import { abilityFor, PluralTownRule, rulesFor } from "@plural-town/ability";
import { createContext, ReactNode, useContext, useMemo } from "react";

const AbilityContext = createContext(abilityFor(rulesFor([], [])));
export const UserCan = createContextualCan(AbilityContext.Consumer);

export function useUserAbility() {
  return useContext(AbilityContext);
}

export interface UserProviderProps {
  rules: PluralTownRule[];
  children?: ReactNode;
}

export function UserProvider({ rules, children }: UserProviderProps) {
  const ability = useMemo(() => abilityFor(rules), [rules]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}

export default UserCan;
