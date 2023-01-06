import { Container, Heading } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { abilityForRequest } from "@plural-town/next-ability";

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const [ability, prisma] = await abilityForRequest(req, {
    baseRequirement: (ability) => ability.can("browse", "AdminDashboard"),
    ensurePrisma: true,
  });
  if(!ability || !prisma) {
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
