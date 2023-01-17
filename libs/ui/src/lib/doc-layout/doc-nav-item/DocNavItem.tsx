import { Card, CardBody } from "@chakra-ui/react";
import { createContext, ReactNode, useContext } from "react";

export interface DocNavContext {
  nav: boolean;
}

const ctx = createContext<DocNavContext>({
  nav: false,
});

export function useDocNavItem() {
  return useContext(ctx);
}

export interface DocNavItemProps {
  children?: ReactNode;
}

export function DocNavItem({ children }: DocNavItemProps) {
  return (
    <ctx.Provider value={{ nav: true }}>
      <Card variant="filled" my={2}>
        <CardBody>{children}</CardBody>
      </Card>
    </ctx.Provider>
  );
}

export default DocNavItem;
