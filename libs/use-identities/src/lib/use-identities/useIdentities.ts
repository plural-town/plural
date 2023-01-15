import { useContext } from "react";
import { identityContext } from "../context";

export function useIdentities() {
  return useContext(identityContext);
}

export default useIdentities;
