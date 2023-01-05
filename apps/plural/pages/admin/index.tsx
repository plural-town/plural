import { Container, Heading } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { PrismaClient, Role } from "@prisma/client";
import flatten from "lodash.flatten";
import { getAccountIdentities } from "@plural/db";

const ALLOWED_ROLES: Role[] = [Role.MOD, Role.ADMIN, Role.OWNER];

export const getServerSideProps = withIronSessionSsr(async ({ query, req, res }) => {
  const { users } = req.session;

  if (!users) {
    return {
      redirect: {
        destination: "/login/",
        permanent: false,
      },
    };
  }

  const prisma = new PrismaClient();
  const identities = flatten(
    await Promise.all(users.map((u) => getAccountIdentities(u.id, prisma))),
  );
  const admin = identities.find((i) => ALLOWED_ROLES.includes(i.role));

  if (!admin) {
    return {
      redirect: {
        destination: "/login/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}, SESSION_OPTIONS);

export function AdminLandingPage() {
  return (
    <>
      <Head>
        <title>Administration</title>
      </Head>
      <Container maxW="container.lg">
        <Heading as="h1">Server Administration</Heading>
      </Container>
    </>
  );
}

export default AdminLandingPage;
