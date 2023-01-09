import { createContext } from "react";
import { IdentityContext } from "./IdentityContext";

export const identityContext = createContext<IdentityContext>({
  identities: [],
  refresh: null,
});
