import { Collapse, Flex, FlexProps, Icon, useDisclosure } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useSidebarStyles } from "../SidebarLayout";

export interface SidebarItemProps {
  text: string;

  disabled?: boolean;

  pl?: FlexProps["pl"];

  py?: FlexProps["py"];

  icon?: Parameters<typeof Icon>[0]["as"];

  /**
   * Providing children will make this sidebar item a collapsible section
   * with sub-items.
   */
  children?: ReactNode;
}

export function SidebarItem({ text, icon, disabled, children, ...props }: SidebarItemProps) {
  const { isOpen, onToggle } = useDisclosure();
  const styles = useSidebarStyles();

  const noop = () => {
    return;
  };

  const handleClick = children ? onToggle : noop;

  return (
    <>
      <Flex
        onClick={handleClick}
        role="group"
        __css={disabled ? styles.itemDisabled : styles.item}
        {...props}
      >
        {icon && <Icon __css={styles.itemIcon} as={icon} />}
        {text}
      </Flex>
      {children && <Collapse in={isOpen}>{children}</Collapse>}
    </>
  );
}

export default SidebarItem;
