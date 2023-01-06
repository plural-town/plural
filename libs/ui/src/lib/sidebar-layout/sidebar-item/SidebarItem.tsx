import {
  Collapse,
  Flex,
  FlexProps,
  Icon,
  LinkBox,
  LinkOverlay,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import NextLink from "next/link";
import { useSidebarStyles } from "../SidebarLayout";
import { FaShieldAlt } from "react-icons/fa";

export interface SidebarItemProps {
  text: string;

  href?: string;

  disabled?: boolean;

  readonly?: boolean;

  pl?: FlexProps["pl"];

  py?: FlexProps["py"];

  icon?: Parameters<typeof Icon>[0]["as"];

  /**
   * Providing children will make this sidebar item a collapsible section
   * with sub-items.
   */
  children?: ReactNode;
}

export function SidebarItem({
  text,
  href,
  icon,
  disabled,
  readonly,
  children,
  ...props
}: SidebarItemProps) {
  const { isOpen, onToggle } = useDisclosure();
  const styles = useSidebarStyles();

  const noop = () => {
    return;
  };

  const handleClick = children ? onToggle : noop;

  return (
    <>
      <LinkBox as="nav">
        <Flex
          onClick={handleClick}
          role="group"
          __css={disabled ? styles.itemDisabled : styles.item}
          {...props}
        >
          {icon && <Icon __css={styles.itemIcon} as={icon} />}
          {href && !disabled ? (
            <NextLink href={href} passHref legacyBehavior>
              <LinkOverlay flex="1">{text}</LinkOverlay>
            </NextLink>
          ) : (
            <Text display="inline" flex="1">
              {text}
            </Text>
          )}
          {!disabled && readonly && (
            <Tooltip label="You can view this page, but lack permission to make changes.">
              <span>
                <Icon as={FaShieldAlt} __css={styles.itemReadOnlyIcon} />
              </span>
            </Tooltip>
          )}
          {/* TODO: Add a "read-only" icon indication */}
        </Flex>
      </LinkBox>
      {children && <Collapse in={isOpen}>{children}</Collapse>}
    </>
  );
}

export default SidebarItem;
