import { Box, Button, chakra, Flex, HStack, Link, useColorModeValue } from "@chakra-ui/react";
import { useScroll } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import NextLink from "next/link";

/* eslint-disable-next-line */
export interface SiteHeaderProps {}

export function SiteHeader(props: SiteHeaderProps) {
  const ref = useRef<null | HTMLElement>(null);
  const height = ref.current ? ref.current.getBoundingClientRect() : 0;
  const [y, setY] = useState(0);
  const { scrollY } = useScroll();
  const bg = useColorModeValue("accent.200", "accent.800");

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
              <NextLink href="/" passHref legacyBehavior>
                {/* TODO: Add logo */}
                <Link as="a">Plural</Link>
              </NextLink>
            </Flex>

            <Flex justify="flex-end" w="full" maxW="824px" align="center" color="gray.400">
              <HStack spacing="5" display={{ base: "none", md: "flex" }}>
                {/* TODO: add links? */}
              </HStack>
            </Flex>

            <Flex justify="flex-end" align="center" color="gray.400">
              <HStack spacing="5" display={{ base: "none", md: "flex" }}>
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
