import { Container } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { getProfilePage, requirePermission, summarizeIdentity } from "@plural/db";
import { getLogger } from "@plural/log";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { NoteCard, ProfileCard, ProfileNoteComposer, SiteHeader, useDisplayName } from "@plural/ui";

export const getServerSideProps = withIronSessionSsr(async ({ query, req, res }) => {
  const log = getLogger("ProfilePage.getServerSideProps");
  const { users } = req.session;
  const userIds = (users ?? []).map((u) => u.id);
  const BASE_URL = process.env.BASE_URL;
  const SITE_NAME = process.env.SITE_NAME;
  const { profileId } = query;
  if (typeof profileId !== "string" || profileId[0] !== "@") {
    log.warn({ req, res, query }, "invalid profile ID");
    return {
      notFound: true,
    };
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
  const identities = grants.map((g) => g.identity);
  const identitySummaries = identities.map(summarizeIdentity);

  // TODO: Use "fronting" system to determine current viewers, vs. all identities for the current profile

  const profile = subdomain
    ? await getProfilePage([subdomain[1], profileId.slice(1)], identities, prisma)
    : await getProfilePage([profileId.slice(1)], identities, prisma);

  return {
    props: {
      SITE_NAME,
      BASE_URL,
      identities: identitySummaries,
      profile,
    },
  };
}, SESSION_OPTIONS);

export function ProfilePage({
  SITE_NAME,
  BASE_URL,
  identities,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { display, fullUsername, highestRole } = profile;
  const displayName = useDisplayName(display);

  return (
    <>
      <Head>
        <title>{`${displayName} - ${fullUsername}`}</title>
      </Head>
      <SiteHeader siteName={SITE_NAME} />
      <Container maxW="container.md">
        <ProfileCard BASE_URL={BASE_URL} profile={profile} />
        {requirePermission(highestRole, "POST") && (
          <ProfileNoteComposer profileId={profile.id} identities={identities} />
        )}
        {profile.posts.map((post) => (
          <NoteCard key={post.id} {...post} my={4} />
        ))}
      </Container>
    </>
  );
}

export default ProfilePage;
