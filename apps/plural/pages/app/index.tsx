import { Container, Heading, Text } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { getNamespace } from "@plural/db";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";

export const getServerSideProps = withIronSessionSsr(async function({ req, res }) {
  const session = req.session.user;

  if(!session) {
    res.setHeader("location", "/login/");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        ns: "",
      },
    };
  }

  const prisma = new PrismaClient();
  const ns = await getNamespace(session, undefined, prisma);

  return {
    props: {
      ns: ns.id,
    },
  };
}, SESSION_OPTIONS);

export function AppLanding({
  ns,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Container>
      <Heading as="h1">
        Plural Social
      </Heading>
      <Text>
        @{ ns }
      </Text>
    </Container>
  );
}

export default AppLanding;
