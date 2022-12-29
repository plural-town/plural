import { Box, Card, CardBody, CardHeader, Flex, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react";
import { PublishedNote, PublishedNoteProfile } from "@plural/schema";
import { useMemo } from "react";
import NextLink from "next/link";
import { getDisplayName } from "../util/useDisplayName";
import NoteAvatar from "./note-avatar/NoteAvatar";

function useProfileNames(profiles: PublishedNoteProfile[]) {
  const transformed = useMemo(() => {
    const names: ({ type: "and" } | { type: "name", id: string, name: string, url: string })[] = [];
    for (let i = 0; i < profiles.length; i++) {
      const feature = profiles[i];
      names.push({
        type: "name",
        id: feature.id,
        name: getDisplayName(feature.display) ?? feature.slug,
        url: feature.profileURL,
      });
      if(i < profiles.length - 1) {
        names.push({ type: "and" });
      }
    }
    return names;
  }, [profiles]);
  return transformed;
}

/* eslint-disable-next-line */
export interface NoteCardProps extends PublishedNote {}

/**
 * Renders a published note.
 * (also used for previews)
 */
export function NoteCard({
  id,
  content,
  profile,
  profiles,
}: NoteCardProps) {
  const ft = useMemo(() => profiles.filter(p => p.author === "FEATURED"), [profiles]);
  const by = useMemo(() => profiles.filter(p => p.author === "BYLINE"), [profiles]);

  const featuredNames = useProfileNames(ft);
  const byNames = useProfileNames(by);

  return (
    <Card data-note data-note-id={id}>
      <CardHeader>
        <Flex direction="row">
          <NoteAvatar profiles={ft} />
          <Stack flex="1" mx={3}>
            <HStack>
              { featuredNames.map(f => {
                if(f.type === "and") {
                  return (<Text>and</Text>);
                }
                return (
                  <Heading size="sm">
                    <NextLink href={f.url} passHref legacyBehavior>
                      <Link as="a" data-note-ft-author={f.id}>
                        { f.name }
                      </Link>
                    </NextLink>
                  </Heading>
                );
              })}
            </HStack>
            <Box>
              {profile && ft.map(f => f.id).includes(profile.id) && (
                <Text>{ profile.fullUsername }</Text>
              )}
            </Box>
          </Stack>
        </Flex>
        { by.length > 0 && (
          <Box mt={4}>
            <HStack fontSize="sm" mx={5}>
              <Text>By</Text>
              { byNames.map(b => {
                if(b.type === "and") {
                  return (<Text>and</Text>);
                }
                return (
                  <NextLink href={b.url} passHref legacyBehavior>
                    <Link as="a" data-note-by-author={b.id}>{ b.name }</Link>
                  </NextLink>
                );
              })}
            </HStack>
          </Box>
        )}
      </CardHeader>
      <CardBody>
        <Text fontSize="xl" mx={4}>{ content }</Text>
      </CardBody>
    </Card>
  );
}

export default NoteCard;
