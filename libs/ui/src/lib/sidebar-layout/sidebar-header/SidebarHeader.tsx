import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useSidebarStyles } from "../SidebarLayout";

export interface SidebarHeaderProps {
  children?: ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  const styles = useSidebarStyles();

  return (
    <Flex as="header" __css={styles.header}>
      {children}
    </Flex>
  );
}

export default SidebarHeader;
