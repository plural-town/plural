import { Container, Heading, Text } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { Permission, PrismaClient } from "@prisma/client";
import { getAccountIdentities, permissionAbove, requirePermission, summarizeProfile } from "@plural/db";
import flatten from "lodash.flatten";
import { InferGetServerSidePropsType } from "next";

export const getServerSideProps = withIronSessionSsr(async ({ query, req, res }) => {
  const { users } = req.session;

  if(!users) {
    return {
      redirect: {
        statusCode: 302,
        destination: "/login/",
        permanent: false,
      },
    };
  }

  const { profileId } = query;

  if(typeof profileId !== "string") {
    throw new Error("Incorrect profileId format.");
  }

  const prisma = new PrismaClient();

  // TODO: Use "fronting" to determine identities, vs. all identities of the accounts
  const identities = flatten(await Promise.all(users.map(({ id }) => getAccountIdentities(id, prisma))));
  const viewerIds = identities.map(i => i.id);

  const profile = await prisma.profile.findUnique({
    where: {
      id: profileId,
    },
    include: {
      display: true,
      parent: true,
      access: {
        where: {
          identityId: {
            in: viewerIds,
          },
        },
      },
    },
  });

  let permissionLevel: (Permission | "PUBLIC") = "PUBLIC";
  for(const grant of (profile?.access ?? [])) {
    const { permission } = grant;
    if(permissionAbove(permission, permissionLevel)) {
      permissionLevel = permission;
    }
    if(permissionLevel === "OWNER") {
      break;
    }
  }

  if(!profile || !requirePermission(permissionLevel, "EDIT")) {
    return {
      notFound: true,
    };
  }

  const summary = summarizeProfile(profile);

  return {
    props: {
      summary,
    },
  };
}, SESSION_OPTIONS);

export function ProfileEditorPage({
  summary,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{ `Edit ${summary.fullUsername}` }</title>
      </Head>
      <Container>
        <Heading as="h1" size="md">
          Edit Profile
        </Heading>
        <Text my={2}>
          {summary.fullUsername}
        </Text>
      </Container>
    </>
  );
}

export default ProfileEditorPage;
