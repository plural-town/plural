import { abilityForRequest, hydrateRequest } from "@plural-town/next-ability";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import NextLink from "next/link";
import { DashboardLayout, GlossaryLink } from "@plural/ui";
import { InferGetServerSidePropsType } from "next";
import {
  Box,
  Heading,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
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

export function AccountDashboardAccountsPage({
  SITE_NAME,
  auth,
  rules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Accounts</title>
      </Head>
      <AuthHydrationProvider auth={auth}>
        <DashboardLayout brand={SITE_NAME} rules={rules}>
          <Heading as="h1" size="lg">
            {SITE_NAME} Accounts
          </Heading>
          <Box fontSize="lg">
            You are currently logged in to the <GlossaryLink term="account">accounts</GlossaryLink>{" "}
            listed below.
          </Box>
          <Box fontSize="lg">
            You may{" "}
            <NextLink href="/login/" passHref legacyBehavior>
              <Link as="a">login</Link>
            </NextLink>{" "}
            to additional accounts if you wish.
          </Box>

          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Account</Th>
                  {/* TODO: add logout button */}
                </Tr>
              </Thead>
              <Tbody>
                {auth.users.map((u) => (
                  <Tr key={u.id}>
                    <Td>
                      <NextLink href={`/account/accounts/${u.id}/`}>{u.id}</NextLink>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </DashboardLayout>
      </AuthHydrationProvider>
    </>
  );
}

export default AccountDashboardAccountsPage;
