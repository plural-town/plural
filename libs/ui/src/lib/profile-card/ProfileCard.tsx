import { Avatar, Box, Button, Card, CardBody, CardFooter, CardHeader, Flex, Heading, HStack, IconButton, Image, Stack, Text } from "@chakra-ui/react";
import { ProfilePage } from "@plural/schema";
import NextLink from "next/link";
import { ReactNode } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useDisplayName } from "../util/useDisplayName";

export interface ProfileCardProps {
  profile: ProfilePage;
  children?: ReactNode;
}

export function ProfileCard({
  profile,
  children,
}: ProfileCardProps) {
  const {
    display,
    fullUsername,
    profileURL,
    postCount,
    followingCount,
    followerCount,
  } = profile;
  const { avatar, banner } = display;
  const displayName = useDisplayName(display);

  return (
    <Card variant="filled" my={4}>
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
              <Text>{ fullUsername }</Text>
            </Box>
          </Flex>
          <HStack>
            {/* TODO: Implement follow popup */}
            {/* TODO: Render 'unfollow' if user already follows */}
            <NextLink href={`${profileURL}follow/`} passHref legacyBehavior>
              <Button as="a" colorScheme="brand" size="sm">
                Follow
              </Button>
            </NextLink>
            <IconButton
              variant="ghost"
              colorScheme="gray"
              aria-label="Menu"
              icon={<BsThreeDotsVertical />}
            />
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
            <Button
              as="a"
              variant="ghost"
              disabled={typeof postCount !== "number"}
            >
              { typeof postCount === "number" ? `${postCount} ` : "" }
              Posts
            </Button>
          </NextLink>
        </Stack>
        <Stack flex="1">
          <NextLink href={`${profileURL}following/`} passHref legacyBehavior>
            <Button
              as="a"
              variant="ghost"
              disabled={typeof followingCount !== "number"}
            >
              { typeof followingCount === "number" ? `${followingCount} ` : "" }
              Following
            </Button>
          </NextLink>
        </Stack>
        <Stack flex="1">
          <NextLink href={`${profileURL}followers/`} passHref legacyBehavior>
            <Button
              as="a"
              variant="ghost"
              disabled={typeof followerCount !== "number"}
            >
              { typeof followerCount === "number" ? `${followerCount} ` : "" }
              Followers
            </Button>
          </NextLink>
        </Stack>
      </CardFooter>
    </Card>
  );
}

export default ProfileCard;
