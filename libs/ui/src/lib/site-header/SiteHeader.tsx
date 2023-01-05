import {
  Box,
  Button,
  chakra,
  Flex,
  HStack,
  IconButton,
  Link,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaSearchPlus } from "react-icons/fa";
import NextLink from "next/link";
import SiteHeaderSearchBar from "./search-bar/SiteHeaderSearchBar";

export interface SiteHeaderProps {
  siteName: string;
  /**
   * Disable the site searchbar.
   * May be useful on some static pages.
   */
  "no-search"?: boolean;
}

export function SiteHeader({ siteName, ...props }: SiteHeaderProps) {
  const searchEnabled = props["no-search"] !== true;
  const ref = useRef<null | HTMLElement>(null);
  const height = ref.current ? ref.current.getBoundingClientRect() : 0;
  const [y, setY] = useState(0);
  const { scrollY } = useScroll();
  const bg = useColorModeValue("accent.200", "accent.800");

  const search = useDisclosure();

  useEffect(() => {
    return scrollY.onChange(() => setY(scrollY.get()));
  }, [scrollY]);

  return (
    <Box position="relative">
      <chakra.header
        ref={ref}
        shadow={y > height ? "sm" : undefined}
        transition="box-shadow 0.2s"
        bg={bg}
        borderTop="6px solid"
        borderTopColor="brand.800"
        w="full"
        overflowY="hidden"
      >
        <chakra.div h="4.5rem" mx="auto" maxW="1200px">
          <Flex w="full" h="full" px="6" align="center" justify="space-between">
            <Flex align="center">
              <HStack display={{ base: search.isOpen ? "none" : "flex", sm: "flex" }}>
                <NextLink href="/" passHref legacyBehavior>
                  {/* TODO: Add logo */}
                  <Link as="a">{siteName}</Link>
                </NextLink>
              </HStack>
              <HStack display={{ base: "none", sm: "flex", md: "none" }}>
                <IconButton
                  onClick={search.onToggle}
                  aria-label="Site Search"
                  variant="ghost"
                  colorScheme="brand"
                  icon={<FaSearchPlus />}
                />
              </HStack>
            </Flex>

            {searchEnabled && (
              <Flex
                w={{
                  base: "full",
                  sm: "75%",
                  md: "60%",
                  lg: "50%",
                }}
                display={{
                  base: search.isOpen ? "flex" : "none",
                  md: "flex",
                }}
                maxW="824px"
                justify="flex-end"
              >
                <SiteHeaderSearchBar />
              </Flex>
            )}

            <Flex justify="flex-end" align="center" color="gray.400">
              <HStack display={{ base: "flex", sm: "none" }}>
                <IconButton
                  onClick={search.onToggle}
                  aria-label="Site Search"
                  variant="ghost"
                  colorScheme="brand"
                  icon={<FaSearchPlus />}
                />
              </HStack>
              <HStack
                spacing="5"
                display={{ base: "none", sm: search.isOpen ? "none" : "flex", md: "flex" }}
              >
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
              </HStack>
            </Flex>
          </Flex>
        </chakra.div>
      </chakra.header>
    </Box>
  );
}

export default SiteHeader;
