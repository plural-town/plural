import NextLink from "next/link";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { NoteCard, SiteHeader } from "@plural/ui";
import { PublishedNoteProfile } from "@plural/schema";
import Head from "next/head";
import React from "react";

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      name: process.env.SITE_NAME ?? "Untitled Social",
      BASE_DOMAIN: process.env.BASE_DOMAIN,
      REGISTRATION_ENABLED: process.env.REGISTRATION_ENABLED === "true",
    },
  } as const;
};

const CTAButtons: React.FC<{
  REGISTRATION_ENABLED: boolean;
}> = ({ REGISTRATION_ENABLED }) => {
  return (
    <Stack spacing={{ base: 4, sm: 6 }} direction={{ base: "column", sm: "row" }}>
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
          disabled={!REGISTRATION_ENABLED}
        >
          Create Account
        </Button>
      </NextLink>
      <NextLink href="/login/" passHref legacyBehavior>
        <Button as="a" rounded="full" size="lg" fontWeight="normal" px={6}>
          Login
        </Button>
      </NextLink>
    </Stack>
  );
};

export function Index({
  name,
  BASE_DOMAIN,
  REGISTRATION_ENABLED,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const podcast: PublishedNoteProfile = {
    id: "podcast",
    author: "FEATURED",
    display: {
      name: "RandomPod",
      displayName: "OurRandomPod",
      bio: "",
    },
    displayId: "",
    fullUsername: `@randpod@${BASE_DOMAIN}`,
    slug: "randpod",
    profileURL: `#randpod`,
    isRoot: true,
    visibility: "PUBLIC",
    parent: "",
  };

  const inventor: PublishedNoteProfile = {
    id: "inventor",
    author: "FEATURED",
    display: {
      name: "Inventor",
      displayName: "Ficticious Inventor",
      bio: "",
    },
    displayId: "",
    fullUsername: `@inventor@${BASE_DOMAIN}`,
    slug: "inventor",
    profileURL: "#inventor",
    isRoot: true,
    visibility: "PUBLIC",
    parent: "",
  };

  const system: PublishedNoteProfile = {
    id: "system",
    author: "FEATURED",
    display: {
      name: "The Example System",
      displayName: "",
      bio: "",
    },
    displayId: "",
    fullUsername: `@system@${BASE_DOMAIN}`,
    slug: "system",
    profileURL: "#system",
    isRoot: true,
    visibility: "PUBLIC",
    parent: "",
  };

  const jay: PublishedNoteProfile = {
    id: "jay",
    author: "FEATURED",
    display: {
      name: "Jay",
      displayName: "",
      bio: "",
    },
    displayId: "",
    fullUsername: `@jay@system.${BASE_DOMAIN}`,
    slug: "jay",
    profileURL: "#jay.system",
    isRoot: false,
    visibility: "PUBLIC",
    parent: "system",
  };

  const sam: PublishedNoteProfile = {
    id: "sam",
    author: "FEATURED",
    display: {
      name: "Sam Doe",
      displayName: "",
      bio: "",
    },
    displayId: "",
    fullUsername: `@sam@system.${BASE_DOMAIN}`,
    slug: "sam",
    profileURL: "#system.sam",
    isRoot: false,
    visibility: "PUBLIC",
    parent: "system",
  };

  const library: PublishedNoteProfile = {
    id: "library",
    author: "FEATURED",
    display: {
      name: "New Town Library",
      displayName: "",
      bio: "",
    },
    displayId: "",
    fullUsername: `@newtownlib@${BASE_DOMAIN}`,
    slug: "newtownlib",
    profileURL: "#newtownlib",
    isRoot: false,
    visibility: "PUBLIC",
    parent: "",
  };

  const director: PublishedNoteProfile = {
    id: "director",
    author: "BYLINE",
    display: {
      name: "Jones, Library Director",
      displayName: "",
      bio: "",
    },
    displayId: "",
    fullUsername: `@jones@newtownlib.${BASE_DOMAIN}`,
    slug: "jones",
    profileURL: "#newtownlib.jones",
    isRoot: false,
    visibility: "PUBLIC",
    parent: "",
  };

  return (
    <>
      <Head>
        <title>{name}</title>
      </Head>
      <SiteHeader siteName={name} />

      <Container maxW="container.sm" my={5}>
        <Alert status="info" variant="solid">
          <AlertIcon />
          <Box>
            <AlertTitle>Under Active Development</AlertTitle>
            <AlertDescription>
              {name} is running <Link href="https://software.plural.town/">PluralTown</Link>, which
              is under active development and only supports a very basic set of features in
              it&apos;s current state.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>

      <Container maxW="7xl">
        <Stack
          align="center"
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
          direction={{ base: "column", md: "row" }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading as="h1">{name}</Heading>
            <CTAButtons REGISTRATION_ENABLED={REGISTRATION_ENABLED} />
          </Stack>
          <Flex flex="1" justify="center" align="center" position="relative" w="full">
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
        <Center>
          <Heading as="h2" size="xl">
            One person, one profile? Not so fast.
          </Heading>
        </Center>
        <Center my={2}>
          <Text fontSize="lg">
            Software often assumes that each person needs one, and exactly one, profile. This{" "}
            <Link href="https://xeiaso.net/blog/identity-model-software-2021-01-31" isExternal>
              can be difficult for many people
            </Link>
            .
          </Text>
        </Center>
        <Center my={2}>
          <Text fontSize="xl">{name} offers several ways to fix this!</Text>
        </Center>
        <Container maxW="container.xl">
          <Heading as="h3" size="lg" mt={8}>
            Co-Posting
          </Heading>
          <Text fontSize="md" pt={1} pb={3}>
            If multiple entities authored a post, list them all!
          </Text>
          <Flex direction={{ base: "column", md: "row" }}>
            <Box flex={{ md: 1 }} mx={2}>
              <NoteCard
                id=""
                content="The Ficticious Inventor was on Our Randomly Named Postcast this week!"
                profile={podcast}
                profiles={[podcast, inventor]}
              />
            </Box>
            <Box flex={{ md: 1 }} mx={2}>
              <NoteCard
                id=""
                content="It's time for a #plural #system #introduction!  We're Jay and Sam!"
                profile={jay}
                profiles={[jay, sam]}
              />
            </Box>
          </Flex>

          <Heading as="h3" size="lg" mt={8}>
            Bylines
          </Heading>
          <Text fontSize="md" pt={1} pb={3}>
            Credit one or more authors for a post!
          </Text>
          <Flex direction={{ base: "column", md: "row" }}>
            <Box flex={{ md: 1 }} mx={2}>
              <NoteCard
                id=""
                content="Hey all, I'm Jay and I figured I'd do a #introduction!"
                profile={system}
                profiles={[
                  system,
                  {
                    ...jay,
                    display: { ...jay.display, displayName: "Jay (Example System)" },
                    author: "BYLINE",
                  },
                ]}
              />
            </Box>
            <Box flex={{ md: 1 }} mx={2}>
              <NoteCard
                id=""
                content="I'm always struck by how amazing all of our staff, volunteers, and patrons are.  It was amazing to see so many people at our holiday party!"
                profile={library}
                profiles={[library, director]}
              />
            </Box>
          </Flex>
        </Container>

        <Center mt={10}>
          <Heading as="h2" size="xl">
            Features
          </Heading>
        </Center>

        <Container maxW="container.md">
          <Heading as="h3" size="md" textDecoration="line-through">
            ActivityPub Support
          </Heading>
          <Text>
            PluralTown is{" "}
            <Text as="span" display="inline" color="orange.700">
              (partially, under development)
            </Text>{" "}
            compatible with Mastodon, Hometown, and many other ActivityPub servers on the Fediverse!
          </Text>
        </Container>
      </Container>
      <Box mb={20}></Box>
    </>
  );
}

export default Index;
