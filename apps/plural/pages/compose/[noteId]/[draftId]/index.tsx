import { Box, Container, Divider, Heading } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { InferGetServerSidePropsType } from "next";
import { Form, Formik } from "formik";
import {
  AuthorTypeSelectField,
  CheckboxField,
  InputField,
  ProfileSelectField,
  SubmitButton,
  VisibilitySelectField,
} from "@plural/form";
import { getAccountProfiles, summarizeProfile } from "@plural/db";
import flatten from "lodash.flatten";
import uniqBy from "lodash.uniqby";
import React, { useMemo, useState } from "react";
import { AddNoteDestination, AddNoteDestinationSchema, PublishedNoteProfile } from "@plural/schema";
import { NoteCard, PostDestinationForm } from "@plural/ui";
import { prisma } from "@plural/prisma";

export const getServerSideProps = withIronSessionSsr(async ({ query, req, res }) => {
  const name = process.env.SITE_NAME;
  const { users } = req.session;
  const { noteId, draftId } = query;
  const id = typeof noteId === "string" ? noteId : "";

  if (!users) {
    return {
      redirect: {
        destination: "/login/",
        permanent: false,
      },
    };
  }
  const userIds = users.map((u) => u.id);

  // TODO: Only include profiles of current authors (aka filter by fronting)
  const profiles = uniqBy(
    flatten(await Promise.all(userIds.map((id) => getAccountProfiles(id, prisma)))),
    (i) => i.id,
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

  const destinations = publishes.map((publish) => {
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
      id: typeof draftId === "string" ? draftId : "",
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

export function ComposeNotePage({
  noteId,
  draftId,
  name,
  profiles,
  content,
  authors,
  destinations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [isStableDraft, setIsStableDraft] = useState(false);
  const previewProfile = useMemo<PublishedNoteProfile | null>(() => {
    if (destinations.length < 1) {
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
    return destinations.map<PublishedNoteProfile>((dest) => ({
      ...dest.profile,
      author: dest.noteAuthor,
    }));
  }, [destinations]);

  return (
    <Container maxW="container.lg">
      <Heading as="h1">Compose</Heading>
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
          if (res.status === "ok") {
            // TODO: do something?
          }
        }}
      >
        <Form>
          <InputField name="content" label="Message" textarea />
          <SubmitButton colorScheme="purple">Update Draft</SubmitButton>
        </Form>
      </Formik>
      <Formik
        initialValues={{}}
        onSubmit={async (values) => {
          const r = await fetch(`/api/note/draft/${draftId}/publish/`);
          const res = await r.json();
          if (res.status === "ok") {
            setIsStableDraft(true);
          }
        }}
      >
        <Form method="GET" action={`/api/note/draft/${draftId}/publish/`}>
          <SubmitButton color="blue">Set as latest draft</SubmitButton>
        </Form>
      </Formik>
      {isStableDraft && <Box>This note has been published as the latest stable draft.</Box>}
      <Heading as="h2" size="md" my={3}>
        Preview
      </Heading>
      <Container maxW="container.sm">
        <NoteCard id="" content={content} profile={previewProfile} profiles={previewProfiles} />
      </Container>
      <Heading as="h2" size="md" my={3}>
        Authors
      </Heading>
      <Heading as="h2" size="md" my={3}>
        Destinations
      </Heading>
      {destinations.map((item) => (
        <PostDestinationForm key={item.id} noteId={noteId} destination={item} />
      ))}
      <Divider mt={4} mb={4} />
      <Heading as="h2" size="md">
        Additional Destination
      </Heading>
      <Box data-test-id="additional-destination">
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
            if (res.status === "ok") {
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
            <VisibilitySelectField name="privacy" label="Post Privacy" />
            <AuthorTypeSelectField name="noteAuthor" label="Author Display" />
            <SubmitButton colorScheme="purple">Add Destination</SubmitButton>
          </Form>
        </Formik>
      </Box>
    </Container>
  );
}

export default ComposeNotePage;
