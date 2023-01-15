import { useContext } from "react";
import { switchingModalContext } from "./SwitchingModalContext";

export function useSwitchingModal() {
  return useContext(switchingModalContext);
}

export default useSwitchingModal;
