import { Box, Container, Flex, Heading, Image, Stack } from "@chakra-ui/react";

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
