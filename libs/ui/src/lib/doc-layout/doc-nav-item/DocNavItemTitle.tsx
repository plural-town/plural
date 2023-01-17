import { Heading } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface DocNavItemTitleProps {
  children?: ReactNode;
}

export function DocNavItemTitle({ children }: DocNavItemTitleProps) {
  return (
    <Heading size="xs" textTransform="uppercase" pb={1}>
      {children}
    </Heading>
  );
}

export default DocNavItemTitle;
