import { Container, Heading } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";

export const getServerSideProps = withIronSessionSsr(async ({ query, req, res }) => {
  const { users } = req.session;
  const { noteId, draftId } = query;
  const id = typeof noteId === "string" ? noteId : "";

  if(!users) {
    res.setHeader("location", "/login/");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        content: "",
        authors: [],
      },
    };
  }
  const userIds = users.map(u => u.id);

  const prisma = new PrismaClient();

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
    },
  });

  const { authors } = note;

  // TODO: filter authors by grants that are in the current user's scope
  // TODO: Find highest permission author that is in scope
  // TODO: Summarize authors vs. returing entire

  const draft = await prisma.noteDraft.findUniqueOrThrow({
    where: {
      id: (typeof draftId === "string") ? draftId : "",
    },
  });

  const { content } = draft;

  return {
    props: {
      content,
      authors,
    },
  };
}, SESSION_OPTIONS);

export function ComposeNotePage({
  content,
  authors,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Container>
      <Heading as="h1">
        Compose
      </Heading>
    </Container>
  );
}

export default ComposeNotePage;
