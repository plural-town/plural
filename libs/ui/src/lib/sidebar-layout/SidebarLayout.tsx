import { Box, createStylesContext, useMultiStyleConfig } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface SidebarLayoutProps {
  variant?: "brand";
  children?: ReactNode;
}

const [SidebarStylesProvider, useSidebarStylesHook] = createStylesContext("SidebarLayout");
export const useSidebarStyles = useSidebarStylesHook;

export function SidebarLayout({ variant, children }: SidebarLayoutProps) {
  const styles = useMultiStyleConfig("SidebarLayout", { variant });

  return (
    <Box __css={styles.container} as="section">
      <SidebarStylesProvider value={styles}>{children}</SidebarStylesProvider>
    </Box>
  );
}

export default SidebarLayout;
