import { abilityForRequest, hydrateRequest } from "@plural-town/next-ability";
import { AuthHydrationProvider } from "@plural/use-auth";
import { SESSION_OPTIONS } from "../../../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import NextLink from "next/link";
import { InferGetServerSidePropsType } from "next";
import { DashboardLayout, GlossaryLink, UserCan } from "@plural/ui";
import { param } from "@plural/next-utils";
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
import { getAccountIdentities } from "@plural/db";
import { createIdentityDoc } from "@plural/schema";

export const getServerSideProps = withIronSessionSsr(async ({ req, query }) => {
  const accountId = param(query, "accountId", "");
  const [ability, prisma, rules] = await abilityForRequest(req, {
    baseRequirement: (ability) =>
      ability.can("browse", {
        kind: "Account",
        id: accountId,
      }),
    allIdentities: true,
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

  const identitySummaries = await getAccountIdentities(accountId, prisma);
  const found = await prisma.identity.findMany({
    where: {
      id: {
        in: identitySummaries.map((i) => i.id),
      },
    },
    include: {
      display: true,
    },
  });
  const identities = found.map(createIdentityDoc);

  return {
    props: {
      SITE_NAME: process.env.SITE_NAME,
      auth: hydrateRequest(req),
      rules,
      accountId,
      identities,
    },
  };
}, SESSION_OPTIONS);

export function AccountDashboardAccountIdentitiesPage({
  SITE_NAME,
  auth,
  rules,
  accountId,
  identities,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Identities</title>
      </Head>
      <AuthHydrationProvider auth={auth}>
        <DashboardLayout
          brand={SITE_NAME}
          rules={rules}
          accountId={accountId}
          section="account-identities"
        >
          <Heading as="h1" size="lg">
            Active Identities
          </Heading>
          <Box>
            You have been granted access to the following{" "}
            <GlossaryLink term="identity">identities</GlossaryLink> - either they were created using
            your account, or you have been granted access by the account who created them.
          </Box>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Identity</Th>
                  <Th>Active</Th>
                </Tr>
              </Thead>
              <Tbody>
                {identities.map((identity) => (
                  <Tr key={identity.id}>
                    <Td>
                      <UserCan I="update" this={identity}>
                        <NextLink
                          href={`/account/accounts/identities/${identity.id}/`}
                          passHref
                          legacyBehavior
                        >
                          <Link as="a">{identity.name}</Link>
                        </NextLink>
                      </UserCan>
                      <UserCan not I="update" this={identity}>
                        <Text decoration="line-through">{identity.name}</Text>
                      </UserCan>
                    </Td>
                    <Td>
                      {(auth.front ?? []).find((fronting) => fronting.id === identity.id)
                        ? "Yes"
                        : "No"}
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

export default AccountDashboardAccountIdentitiesPage;
