import { Container, Heading } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { getProfilePage } from "@plural/db";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";

export const getServerSideProps = withIronSessionSsr(async ({ query, req, res }) => {
  const { profileId } = query;
  if(typeof profileId !== "string" || profileId[0] !== "@") {
    throw new Error("Incorrect format for profile ID.");
  }

  const BASE_DOMAIN = process.env.BASE_DOMAIN;
  const host = req.headers.host;
  const subdomain = host.match(`^(.+).${BASE_DOMAIN}$`);

  const prisma = new PrismaClient();

  const profile = subdomain
    ? await getProfilePage([subdomain[1], profileId.slice(1)], prisma)
    : await getProfilePage([profileId.slice(1)], prisma);

  return {
    props: {
      profile,
    },
  };
}, SESSION_OPTIONS);

export function ProfilePage({
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Container>
      <Head>
        <title>@{profile.slug}</title>
      </Head>
      <Heading>
        Profile { profile.slug }
      </Heading>
    </Container>
  );
}

export default ProfilePage;
