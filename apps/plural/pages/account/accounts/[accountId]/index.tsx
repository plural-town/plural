import { abilityForRequest, hydrateRequest } from "@plural-town/next-ability";
import { AuthHydrationProvider } from "@plural/use-auth";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { InferGetServerSidePropsType } from "next";
import { DashboardLayout } from "@plural/ui";
import { param } from "@plural/next-utils";

export const getServerSideProps = withIronSessionSsr(async ({ req, query }) => {
  const accountId = param(query, "accountId", "");
  const [ability, prisma, rules] = await abilityForRequest(req, {
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
      SITE_NAME: process.env.SITE_NAME,
      auth: hydrateRequest(req),
      rules,
      accountId,
    },
  };
}, SESSION_OPTIONS);

export function AccountDashboardAccountLanding({
  SITE_NAME,
  auth,
  rules,
  accountId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Account Overview</title>
      </Head>
      <AuthHydrationProvider auth={auth}>
        <DashboardLayout brand={SITE_NAME} rules={rules} accountId={accountId}></DashboardLayout>
      </AuthHydrationProvider>
    </>
  );
}

export default AccountDashboardAccountLanding;
