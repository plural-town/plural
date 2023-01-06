import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useSidebarStyles } from "../SidebarLayout";

export interface SidebarLayoutPageProps {
  children?: ReactNode;
}

export function SidebarLayoutPage({ children }: SidebarLayoutPageProps) {
  const styles = useSidebarStyles();

  return (
    <Box as="main" __css={styles.page}>
      {children}
    </Box>
  );
}

export default SidebarLayoutPage;
