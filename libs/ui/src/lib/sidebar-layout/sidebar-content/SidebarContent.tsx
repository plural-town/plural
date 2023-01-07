import { Box, BoxProps, Flex, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useSidebarStyles } from "../SidebarLayout";

export interface SidebarContentProps {
  display?: BoxProps["display"];
  w?: BoxProps["w"];
  borderRight?: BoxProps["borderRight"];

  /**
   * Text to display on the top of the app.
   */
  brand?: string;
  logo?: ReactNode;
  children?: ReactNode;
}

export function SidebarContent({ brand, logo, children, ...props }: SidebarContentProps) {
  const styles = useSidebarStyles();

  return (
    <Box as="nav" __css={styles.sidebar} {...props}>
      <Flex __css={styles.sidebarBrandFlex}>
        {logo}
        <Text __css={styles.brandText}>{brand}</Text>
      </Flex>
      <Flex as="nav" __css={styles.sidebarItemContainer}>
        {children}
      </Flex>
    </Box>
  );
}

export default SidebarContent;
