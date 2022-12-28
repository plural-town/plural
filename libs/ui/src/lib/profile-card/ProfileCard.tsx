import { Avatar, Box, Button, Card, CardBody, CardFooter, CardHeader, Flex, Heading, HStack, Image, Stack, Text } from "@chakra-ui/react";
import { ProfileSummary } from "@plural/schema";
import NextLink from "next/link";
import { ReactNode } from "react";
import { useDisplayName } from "../util/useDisplayName";

export interface ProfileCardProps {
  profile: ProfileSummary;
  children?: ReactNode;
}

export function ProfileCard({
  profile,
  children,
}: ProfileCardProps) {
  const { display, slug, profileURL } = profile;
  const { avatar, banner } = display;
  const displayName = useDisplayName(display);

  return (
    <Card variant="elevated" my={4}>
      { banner && (
        <Image
          objectFit="cover"
          w="full"
          src={banner.src}
          alt={banner.alt}
        />
      ) }
      <CardHeader>
        <Flex>
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            { avatar && (
              <Avatar
                name={displayName}
                src={avatar.src}
              />
            )}
            <Box>
              <Heading size="sm">
                { displayName }
                {/* TODO: Render any custom badges */}
              </Heading>
              {/* TODO: Add property to {@link ProfileSummary} that is the complete user ID */}
              <Text>{ slug }</Text>
            </Box>
          </Flex>
          <HStack>
            <NextLink href={`${profileURL}follow/`} passHref legacyBehavior>
              <Button as="a" colorScheme="brand" size="xs">
                Follow
              </Button>
            </NextLink>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        { children }
      </CardBody>
      <CardFooter
        justify="space-between"
        flexWrap="wrap"
        sx={{
          "& > button": {
            minW: "136px",
          },
        }}
      >
        <Stack flex="1">
          <NextLink href={`${profileURL}`} passHref legacyBehavior>
            <Button as="a" variant="ghost">
              Posts
            </Button>
          </NextLink>
        </Stack>
        <Stack flex="1">
          <NextLink href={`${profileURL}following/`} passHref legacyBehavior>
            <Button as="a" variant="ghost">
              Following
            </Button>
          </NextLink>
        </Stack>
        <Stack flex="1">
          <NextLink href={`${profileURL}followers/`} passHref legacyBehavior>
            <Button as="a" variant="ghost">
              Followers
            </Button>
          </NextLink>
        </Stack>
      </CardFooter>
    </Card>
  );
}

export default ProfileCard;
