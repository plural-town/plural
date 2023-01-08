import {
  Avatar,
  AvatarGroup,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { useAuth } from "@plural/use-auth";
import NextLink from "next/link";
import { AiFillControl } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";

/* eslint-disable-next-line */
export interface SiteHeaderUserMenuProps {}

/**
 * Renders the right side of the site header, rendering different forms of authentication information
 * depending on the current authentication (and hydration) status.
 */
export function SiteHeaderUserMenu(props: SiteHeaderUserMenuProps) {
  const { clientOn, hydrated, loggedIn, front } = useAuth();

  const hasIdentities = front && Array.isArray(front) && front.length > 0;

  if (!hydrated) {
    // Authentication data is not available.  Provide a universal value that will work for any authentication state.
    // If the user has JavaScript enabled, this should be replaced on page load.
    return (
      <NextLink href="/session/" passHref legacyBehavior>
        <Button as="a" colorScheme="secondary" variant="ghost" size="sm">
          Account
        </Button>
      </NextLink>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <NextLink href="/login/" passHref legacyBehavior>
          <Button as="a" colorScheme="secondary" variant="ghost" size="sm">
            Sign In
          </Button>
        </NextLink>
        <NextLink href="/register/email/" passHref legacyBehavior>
          <Button as="a" colorScheme="secondary" variant="ghost" size="sm">
            Register
          </Button>
        </NextLink>
      </>
    );
  }

  if (!hasIdentities && !clientOn) {
    // Logged in, but no identites are fronting.  Also, the client may not have JS enabled.
    // Can be less vauge than just "Account", but can't use menus.
    return (
      <>
        {/* <NextLink href="/session/logout/" passHref legacyBehavior>
          <Button as="a" colorScheme="secondary" variant="ghost" size="sm">
            Logout
          </Button>
        </NextLink> */}
        <NextLink href="/session/" passHref legacyBehavior>
          <Avatar as="a" size="sm" />
        </NextLink>
      </>
    );
  }

  if (!hasIdentities) {
    // Logged in, but no identities are fronting.
    // Client has JS enabled, so use menus.
    return (
      <Menu placement="bottom-end">
        <MenuButton as={Avatar} size="sm" />
        <MenuList color="black">
          <MenuItem disabled color="gray.400">
            No active identities
          </MenuItem>
          <MenuItem>Update Active Identities</MenuItem>
          <MenuDivider />
          <NextLink href="/account/" passHref legacyBehavior>
            <MenuItem as="a">Account Settings</MenuItem>
          </NextLink>
          {/* TODO: Only display if able to admin */}
          <NextLink href="/admin/" passHref legacyBehavior>
            <MenuItem as="a">Server Administration</MenuItem>
          </NextLink>
          <MenuDivider />
          <NextLink href="/login/" passHref legacyBehavior>
            <MenuItem as="a">Add Account</MenuItem>
          </NextLink>
          <MenuItem>Logout</MenuItem>
        </MenuList>
      </Menu>
    );
  }

  if (!clientOn && front) {
    // User has one or more identities, but may not have JavaScript enabled.
    return (
      <>
        <AvatarGroup>
          {front.map((i) => (
            <Avatar key={i.id} size="sm" />
          ))}
        </AvatarGroup>
        <NextLink href="/session/" passHref legacyBehavior>
          <IconButton as="a" icon={<AiFillControl />} aria-label="Control Session" />
        </NextLink>
      </>
    );
  }

  if (front) {
    // User has one or more identities active.
    return (
      <>
        <AvatarGroup>
          {front.map((i) => (
            <Avatar key={i.id} size="sm" />
          ))}
        </AvatarGroup>
        <Menu placement="bottom-end">
          <MenuButton
            as={IconButton}
            size="sm"
            icon={<FaChevronDown />}
            aria-label="Session Options"
          />
          <MenuList>
            <MenuItem>Update Active Identities</MenuItem>
          </MenuList>
        </Menu>
      </>
    );
  }

  // TODO: Should never get here. Log warning.

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  );
}

export default SiteHeaderUserMenu;
