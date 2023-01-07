import { Container } from "@chakra-ui/react";
import { getLogger } from "@plural/log";
import { ProfilePage } from "@plural/schema";
import { ProfileCard, SiteHeader } from "@plural/ui";
import { PrismaClient } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";

export const getServerSideProps: GetServerSideProps = async ({ query, req, res }) => {
  const log = getLogger("RemoteUserPage.getServerSideProps");
  const { server, username } = query;

  if (typeof server !== "string" || typeof username !== "string") {
    return {
      notFound: true,
    };
  }

  const prisma = new PrismaClient();
  const profile = await prisma.remoteProfile.findFirst({
    where: {
      server: server.slice(1),
      username: username.slice(1),
    },
    include: {
      entity: {
        include: {
          fields: true,
        },
      },
    },
  });

  if (!profile) {
    log.warn({ req, res, server, username }, "Profile not found");
    return {
      notFound: true,
    };
  }

  const fields = profile.entity.fields;
  const nameField = fields.find((f) => f.field === "NAME");
  const name = nameField ? nameField.value : "";

  const render: ProfilePage = {
    id: profile.id,
    displayId: "",
    display: {
      name,
      displayName: "",
      bio: "",
    },
    fullUsername: `${username}${server}`,
    profileURL: `${process.env.BASE_URL}/${username}${server}`,
    highestRole: "PUBLIC",
    isRoot: true,
    posts: [],
    slug: username.slice(1),
    parent: "",
    visibility: "PUBLIC",
  };

  return {
    props: {
      SITE_NAME: process.env.SITE_NAME,
      BASE_URL: process.env.BASE_URL,
      server,
      username,
      profile: render,
    },
  };
};

export function RemoteUserPage({
  SITE_NAME,
  BASE_URL,
  server,
  username,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{`${username}${server} - ${SITE_NAME}`}</title>
      </Head>
      <SiteHeader siteName={SITE_NAME} />
      <Container maxW="container.md">
        <ProfileCard BASE_URL={BASE_URL} profile={profile} />
        {/* TODO: build out page */}
      </Container>
    </>
  );
}

export default RemoteUserPage;
