import { Heading } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { abilityForRequest } from "@plural-town/next-ability";
import { AdminLayout } from "@plural/ui";
import { InferGetServerSidePropsType } from "next";

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const [ability, prisma, rules] = await abilityForRequest(req, {
    baseRequirement: (ability) => ability.can("browse", "AdminDashboard"),
    ensurePrisma: true,
  });
  if (!ability || !prisma) {
    return {
      redirect: {
        destination: "/login/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      SITE_NAME: process.env["SITE_NAME"],
      rules,
    },
  };
}, SESSION_OPTIONS);

export function AdminLandingPage({
  SITE_NAME,
  rules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Administration</title>
      </Head>
      <AdminLayout brand={SITE_NAME} rules={rules}>
        <Heading as="h1">Server Administration</Heading>
      </AdminLayout>
    </>
  );
}

export default AdminLandingPage;
