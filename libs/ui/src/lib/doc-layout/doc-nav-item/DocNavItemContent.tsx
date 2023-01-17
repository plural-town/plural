import { Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface DocNavItemContentProps {
  children?: ReactNode;
}

export function DocNavItemContent({ children }: DocNavItemContentProps) {
  return <Text fontSize="sm">{children}</Text>;
}

export default DocNavItemContent;
