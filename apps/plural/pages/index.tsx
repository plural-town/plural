import NextLink from "next/link";
import { Box, Button, Container, Flex, Heading, Image, Stack } from "@chakra-ui/react";

function CTAButtons() {
  return (
    <Stack
      spacing={{ base: 4, sm: 6 }}
      direction={{ base: "column", sm: "row" }}
    >
      <NextLink href="/register/email/" passHref legacyBehavior>
        <Button
          as="a"
          rounded="full"
          size="lg"
          fontWeight="normal"
          px={6}
          colorScheme="red"
          bg="red.400"
          _hover={{ bg: "red.500" }}
        >
          Create Account
        </Button>
      </NextLink>
      <NextLink href="/login/" passHref legacyBehavior>
        <Button
          as="a"
          rounded="full"
          size="lg"
          fontWeight="normal"
          px={6}
        >
          Login
        </Button>
      </NextLink>
    </Stack>
  );
}

export function Index() {
  return (
    <Container maxW="7xl">
      <Stack
        align="center"
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
        direction={{ base: "column", md: "row" }}
      >
        <Stack flex={1} spacing={{ base: 5, md: 10 }}>
          <Heading as="h1">
            Pural Social
          </Heading>
          <CTAButtons />
        </Stack>
        <Flex
          flex="1"
          justify="center"
          align="center"
          position="relative"
          w="full"
        >
          <Box
            position="relative"
            height="300px"
            rounded="2xl"
            boxShadow="2xl"
            width="full"
            overflow="hidden"
          >
            <Image
              alt="Hero Image"
              fit="cover"
              align="center"
              w="100%"
              h="100%"
              src="https://placekitten.com/800/600"
            />
          </Box>
        </Flex>
      </Stack>
    </Container>
  );
}

export default Index;
