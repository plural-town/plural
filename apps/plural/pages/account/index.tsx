import { abilityForRequest, hydrateRequest } from "@plural-town/next-ability";
import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import NextLink from "next/link";
import { DashboardLayout, UserCan } from "@plural/ui";
import { InferGetServerSidePropsType } from "next";
import { Box, Button, Heading } from "@chakra-ui/react";
import { AuthHydrationProvider } from "@plural/use-auth";

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const [ability, prisma, rules] = await abilityForRequest(req, {
    ensureUser: true,
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
      auth: hydrateRequest(req),
      rules,
    },
  };
}, SESSION_OPTIONS);

export function AccountDashboardLandingPage({
  SITE_NAME,
  auth,
  rules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Account Dashboard</title>
      </Head>
      <AuthHydrationProvider auth={auth}>
        <DashboardLayout brand={SITE_NAME} rules={rules}>
          <Heading as="h1" size="md">
            {SITE_NAME} Account Settings
          </Heading>
          <UserCan I="browse" a="AdminDashboard">
            <Box>
              <NextLink href="/admin/" passHref legacyBehavior>
                <Button as="a" size="sm" colorScheme="brand">
                  Server Administration
                </Button>
              </NextLink>
            </Box>
          </UserCan>
        </DashboardLayout>
      </AuthHydrationProvider>
    </>
  );
}

export default AccountDashboardLandingPage;
