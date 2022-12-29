import { Container } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { getProfilePage, requirePermission, summarizeIdentity } from "@plural/db";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { ProfileCard, ProfileNoteComposer, SiteHeader, useDisplayName } from "@plural/ui";

export const getServerSideProps = withIronSessionSsr(async ({ query, req, res }) => {
  const { users } = req.session;
  const userIds = (users ?? []).map(u => u.id);
  const BASE_URL = process.env.BASE_URL;
  const { profileId } = query;
  if(typeof profileId !== "string" || profileId[0] !== "@") {
    throw new Error("Incorrect format for profile ID.");
  }

  const BASE_DOMAIN = process.env.BASE_DOMAIN;
  const host = req.headers.host;
  const subdomain = host.match(`^(.+).${BASE_DOMAIN}$`);

  const prisma = new PrismaClient();

  const grants = await prisma.identityGrant.findMany({
    where: {
      accountId: {
        in: userIds,
      },
    },
    include: {
      identity: {
        include: {
          display: true,
        },
      },
    },
  });
  const identities = grants.map(g => g.identity);
  const identitySummaries = identities.map(summarizeIdentity);

  // TODO: Use "fronting" system to determine current viewers, vs. all identities for the current profile

  const profile = subdomain
    ? await getProfilePage([subdomain[1], profileId.slice(1)], identities, prisma)
    : await getProfilePage([profileId.slice(1)], identities, prisma);

  return {
    props: {
      BASE_URL,
      identities: identitySummaries,
      profile,
    },
  };
}, SESSION_OPTIONS);

export function ProfilePage({
  BASE_URL,
  identities,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { display, fullUsername, highestRole } = profile;
  const displayName = useDisplayName(display);

  return (
    <>
      <Head>
        <title>{displayName} - {fullUsername}</title>
      </Head>
      <SiteHeader />
      <Container maxW="container.md">
        <ProfileCard BASE_URL={BASE_URL} profile={profile} />
        {requirePermission(highestRole, "POST") && (
          <ProfileNoteComposer profileId={profile.id} identities={identities} />
        )}
      </Container>
    </>
  );
}

export default ProfilePage;
