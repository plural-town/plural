import { Container, Heading } from "@chakra-ui/react";
import { AppSession, UserSession } from "@plural/schema";
import { PrismaClient } from "@prisma/client";
import { Form, Formik } from "formik";
import { withIronSessionSsr } from "iron-session/next";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { SESSION_OPTIONS } from "../lib/session";

export const getServerSideProps = withIronSessionSsr(async function({ req, res }) {
  const session = (req as any).session.user as undefined | UserSession;

  if(!session) {
    res.setHeader("location", "/login/");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        personas: [],
      },
    };
  }

  const prisma = new PrismaClient();

  const foundPersonas = await prisma.persona.findMany({
    where: {
      userId: session.id,
    },
  });

  const personas = foundPersonas.map(persona => ({
    id: persona.id,
    name: persona.name,
  }));

  return {
    props: {
      personas,
    },
  };
}, SESSION_OPTIONS);

export function SessionPage({
  personas,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Formik<AppSession>
      initialValues={{
        personas: [],
      }}
      onSubmit={async (values) => {
        return;
      }}
    >
      <Form>
        <Container>
          <Heading as="h1">
            Current Session
          </Heading>
          <Heading size="md" as="h2" mt={2}>
            Identity
          </Heading>
        </Container>
      </Form>
    </Formik>
  );
}

export default SessionPage;
