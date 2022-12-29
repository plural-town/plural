import { Avatar, AvatarGroup, Card, CardBody, CardHeader, Container, Divider, Flex, Heading, Stack } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { AuthorType, PrismaClient, Visibility } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import { Form, Formik, useFormikContext } from "formik";
import { AuthorTypeSelectField, CheckboxField, InputField, ProfileSelectField, SubmitButton, VisibilitySelectField } from "@plural/form";
import { getAccountProfiles, summarizeProfile } from "@plural/db";
import flatten from "lodash.flatten";
import uniqBy from "lodash.uniqby";
import React, { useMemo } from "react";
import { AddNoteDestination, AddNoteDestinationSchema, ProfileSummary, PublishedNoteProfile } from "@plural/schema";
import { NoteCard, PostDestinationForm } from "@plural/ui";

export const getServerSideProps = withIronSessionSsr(async ({ query, req, res }) => {
  const name = process.env.SITE_NAME;
  const { users } = req.session;
  const { noteId, draftId } = query;
  const id = typeof noteId === "string" ? noteId : "";

  if(!users) {
    return {
      redirect: {
        destination: "/login/",
        permanent: false,
      },
    };
  }
  const userIds = users.map(u => u.id);

  const prisma = new PrismaClient();

  // TODO: Only include profiles of current authors (aka filter by fronting)
  const profiles = uniqBy(
    flatten(await Promise.all(userIds.map(id => getAccountProfiles(id, prisma)))),
    i => i.id,
  );

  // TODO: Permission check?

  const note = await prisma.note.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      authors: {
        include: {
          author: {
            include: {
              display: true,
              grants: true,
            },
          },
        },
      },
      publishes: {
        include: {
          profile: {
            include: {
              display: true,
            },
          },
          reposts: true,
        },
      },
    },
  });

  const { publishes } = note;

  // TODO: filter authors by grants that are in the current user's scope
  // TODO: Find highest permission author that is in scope
  // TODO: Summarize authors vs. returing entire

  const destinations = publishes.map(publish => {
    const { id, profile, localOnly, privacy, noteAuthor } = publish;
    return {
      id: id,
      profile: summarizeProfile(profile),
      localOnly,
      privacy,
      noteAuthor,
    };
  });

  const draft = await prisma.noteDraft.findUniqueOrThrow({
    where: {
      id: (typeof draftId === "string") ? draftId : "",
    },
  });

  const { content } = draft;

  return {
    props: {
      noteId: note.id,
      draftId: draft.id,
      name,
      profiles,
      content,
      authors: [],
      destinations,
    },
  };
}, SESSION_OPTIONS);

const NotePreview: React.FC<{
  profiles: ProfileSummary[];
  content: string;
  destinations: {
    id: string,
    profile: ProfileSummary,
    localOnly: boolean;
    privacy: Visibility;
    noteAuthor?: AuthorType;
  }[];
}> = ({ profiles, content, destinations }) => {
  const { values } = useFormikContext<AddNoteDestination>();
  const { profileId, noteAuthor } = values;

  const profile = profiles.find(p => p.id === profileId);

  const ft = destinations.filter(dest => dest.noteAuthor === "FEATURED");

  return (
    <Card>
      <CardHeader>
        <Flex direction="row">
          <AvatarGroup mr={3}>
            { ft.map(item => (
              <Avatar
                key={item.id}
                name={item.profile.display.displayName ?? item.profile.display.displayName}
                src="https://bit.ly/ryan-florence"
              />
            ))}
            { noteAuthor === "FEATURED" && profile && (
              <Avatar
                name={profile.display.displayName ?? profile.display.name}
                src="https://bit.ly/ryan-florence"
              />
            )}
          </AvatarGroup>
          <Stack>
            <Heading size="sm">
              { profile && (profile.display.displayName ?? profile.display.name) }
            </Heading>
            <Heading size="sm" fontWeight="normal">
              { profile && `@${profile.slug}`}
            </Heading>
          </Stack>
        </Flex>
      </CardHeader>
      <CardBody>
        { content }
      </CardBody>
    </Card>
  );
};

export function ComposeNotePage({
  noteId,
  draftId,
  name,
  profiles,
  content,
  authors,
  destinations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const previewProfile = useMemo<PublishedNoteProfile | null>(() => {
    if(destinations.length < 1) {
      return null;
    }
    const dest = destinations[0];
    const profile: PublishedNoteProfile = {
      ...dest.profile,
      author: dest.noteAuthor,
    };
    return profile;
  }, [destinations]);

  const previewProfiles = useMemo<PublishedNoteProfile[]>(() => {
    return destinations.map<PublishedNoteProfile>(dest => ({
      ...dest.profile,
      author: dest.noteAuthor,
    }));
  }, [destinations]);

  return (
    <Container maxW="container.lg">
      <Heading as="h1">
        Compose
      </Heading>
      <Formik
        initialValues={{
          content,
        }}
        onSubmit={async (values) => {
          const r = await fetch(`/api/note/draft/${draftId}/update/`, {
            method: "POST",
            body: JSON.stringify(values),
          });
          const res = await r.json();
          if(res.status === "ok") {
            // TODO: do something?
          }
        }}
      >
        <Form>
          <InputField
            name="content"
            label="Message"
            textarea
          />
          <SubmitButton colorScheme="purple">
            Update Draft
          </SubmitButton>
        </Form>
      </Formik>
      <Heading as="h2" size="md" my={3}>
        Preview
      </Heading>
      <Container maxW="container.sm">
        <NoteCard
          id=""
          content={content}
          profile={previewProfile}
          profiles={previewProfiles}
        />
      </Container>
      <Heading as="h2" size="md" my={3}>
        Authors
      </Heading>
      <Heading as="h2" size="md" my={3}>
        Destinations
      </Heading>
      {destinations.map(item => (
        <PostDestinationForm
          key={item.id}
          noteId={noteId}
          destination={item}
        />
      ))}
      <Divider mt={4} mb={4} />
      <Heading as="h2" size="md">
        Additional Destination
      </Heading>
      <Formik<AddNoteDestination>
        initialValues={{
          profileId: "",
          localOnly: false,
          privacy: "PUBLIC",
          noteAuthor: "FEATURED",
        }}
        validationSchema={AddNoteDestinationSchema}
        onSubmit={async (values) => {
          const r = await fetch(`/api/note/${noteId}/destinations/add/`, {
            method: "POST",
            body: JSON.stringify(values),
          });
          const res = await r.json();
          if(res.status === "ok") {
            // TODO: do something?
          }
          return;
        }}
      >
        <Form>
          <ProfileSelectField
            name="profileId"
            profiles={profiles}
            label="Profile"
            placeholder="Select Profile"
            field="id"
          />
          <CheckboxField
            name="localOnly"
            label="Local-Only Post"
            text={`Display only on ${name}`}
          />
          <VisibilitySelectField
            name="privacy"
            label="Post Privacy"
          />
          <AuthorTypeSelectField
            name="noteAuthor"
            label="Author Display"
          />
          <SubmitButton colorScheme="purple">
            Add Destination
          </SubmitButton>
          <Heading py={2} size="sm">
            Preview
          </Heading>
          <NotePreview
            destinations={destinations}
            content={content}
            profiles={profiles}
          />
        </Form>
      </Formik>
    </Container>
  );
}

export default ComposeNotePage;
