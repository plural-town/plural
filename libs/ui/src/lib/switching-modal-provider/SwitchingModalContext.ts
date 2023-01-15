import { createContext } from "react";

export interface SwitchingModalContext {
  available: boolean;
  open: () => void;
}

export const switchingModalContext = createContext<SwitchingModalContext>({
  available: false,
  open: () => {
    return;
  },
});
