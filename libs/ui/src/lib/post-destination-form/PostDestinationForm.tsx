import { Box, Card, CardBody, CardFooter, CardHeader, Heading, HStack, Link, Spacer, Stack, Text } from "@chakra-ui/react";
import { AuthorTypeSelectField, SubmitButton, SubmitButtonProps } from "@plural/form";
import { ProfileSummary, UpdateNoteDestination, UpdateNoteDestinationSchema } from "@plural/schema";
import { AuthorType, Visibility } from "@prisma/client";
import { Form, Formik } from "formik";
import { ReactNode, useState } from "react";
import NextLink from "next/link";
import { useDisplayName } from "../util/useDisplayName";

/**
 * Call the publish API.  Implemented as a form for offline support.
 */
const PostToDestinationButton: React.FC<SubmitButtonProps & {
  noteId: string;
  destinationId: string;
  profileId: string;
  onPublish?: (id: string) => void;
  children?: ReactNode;
}> = ({
  noteId,
  destinationId,
  profileId,
  onPublish,
  children,
  ...props
}) => {
  const url = `/api/note/${noteId}/destinations/${destinationId}/publish/`;

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (values) => {
        const r = await fetch(url);
        const res = await r.json();
        if(res.status === "ok") {
          onPublish && onPublish(res.id);
        }
      }}
    >
      <Form method="POST" action={url}>
        <SubmitButton {...props} data-publish-to={profileId}>
          { children }
        </SubmitButton>
      </Form>
    </Formik>
  );
}

export interface PostDestinationFormProps {
  noteId: string;

  destination: {
    id: string;
    profile: ProfileSummary;
    localOnly: boolean;
    privacy: Visibility;
    noteAuthor: AuthorType;
  };
}

export function PostDestinationForm({
  noteId,
  destination,
}: PostDestinationFormProps) {
  const [updated, setUpdated] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const name = useDisplayName(destination.profile.display);
  return (
    <Card my={2} data-destination-form-for-profile={destination.profile.id}>
      <CardHeader>
        <Heading size="sm">
          { name }
        </Heading>
        <Text fontSize="xs">
          Post #{ destination.id }
        </Text>
      </CardHeader>
      <CardBody>
        <Formik<UpdateNoteDestination>
          initialValues={{
            localOnly: destination.localOnly,
            noteAuthor: destination.noteAuthor,
            privacy: destination.privacy,
          }}
          validationSchema={UpdateNoteDestinationSchema}
          onSubmit={async (values) => {
            const r = await fetch(`/api/note/${noteId}/destinations/${destination.id}/update/`, {
              method: "POST",
              body: JSON.stringify(values),
            });
            const res = await r.json();
            if(res.status === "ok") {
              setUpdated(true);
            }
          }}
        >
          <Form>
            <AuthorTypeSelectField
              name="noteAuthor"
              label="Author Type"
              my={0}
            />
            <SubmitButton data-update-destination>
              Update Destination
            </SubmitButton>
            { updated && (
              <Box>Updated destination.</Box>
            )}
          </Form>
        </Formik>
      </CardBody>
      <CardFooter>
        <Stack width="full">
          <HStack width="full" mx={{ base: 3, md: 4, lg: 8 }}>
            <Spacer />
            {/* TODO: disable button if already published */}
            <PostToDestinationButton
              noteId={noteId}
              destinationId={destination.id}
              profileId={destination.profile.id}
              onPublish={setPublishedId}
              colorScheme="brand"
            >
              Publish
            </PostToDestinationButton>
          </HStack>
          { typeof publishedId === "string" && (
            <Box>
              <Text>Published to </Text>
              <NextLink href={`${destination.profile.profileURL}post/${publishedId}/`} passHref legacyBehavior>
                <Link as="a" data-publish-link data-published-id={publishedId}>
                  {`${destination.profile.profileURL}post/${publishedId}/`}
                </Link>
              </NextLink>
            </Box>
          )}
        </Stack>
      </CardFooter>
    </Card>
  );
}
