import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useSidebarStyles } from "../SidebarLayout";

export interface SidebarLayoutMainProps {
  children?: ReactNode;
}

export function SidebarLayoutMain({ children }: SidebarLayoutMainProps) {
  const styles = useSidebarStyles();
  return <Box __css={styles.main}>{children}</Box>;
}

export default SidebarLayoutMain;
