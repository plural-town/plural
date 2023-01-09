import { Flex, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useSidebarStyles } from "../SidebarLayout";

export interface SidebarSectionHeadingProps {
  children?: ReactNode;
}

export function SidebarSectionHeading({ children }: SidebarSectionHeadingProps) {
  const styles = useSidebarStyles();

  return (
    <Flex __css={styles.sidebarHeading}>
      <Text display="inline" flex="1" fontSize="sm">
        {children}
      </Text>
    </Flex>
  );
}

export default SidebarSectionHeading;
