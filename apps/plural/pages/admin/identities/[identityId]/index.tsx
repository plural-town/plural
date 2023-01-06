import { permittedFieldsOf } from "@casl/ability/extra";
import { abilityForRequest } from "@plural-town/next-ability";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import pick from "lodash.pick";
import { AdminLayout } from "@plural/ui";
import { Heading } from "@chakra-ui/react";
import { param } from "@plural/next-utils";
import { createIdentityDoc } from "@plural/schema";

export const getServerSideProps = withIronSessionSsr(async ({ query, req }) => {
  const [ability, prisma, rules] = await abilityForRequest(req, {
    baseRequirement: (ability) => ability.can("browse", "AdminDashboard", "identities"),
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

  const found = await prisma.identity.findUnique({
    where: {
      id: param(query, "identityId", ""),
    },
    include: {
      display: true,
    },
  });

  const doc = found ? createIdentityDoc(found) : undefined;

  if(!found || !doc || ability.cannot("browse", doc)) {
    return {
      notFound: true,
    };
  }

  const identity = pick(doc, permittedFieldsOf(ability, "browse", doc, {
    fieldsFrom: () => ["id", "role", "visibility", "name", "nameVisibility"],
  }));

  return {
    props: {
      SITE_NAME: process.env["SITE_NAME"],
      rules,
      identity,
    },
  };
}, SESSION_OPTIONS);

export function AdminIdentityPage({
  SITE_NAME,
  rules,
  identity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{`${identity.name} - Identity`}</title>
      </Head>
      <AdminLayout brand={SITE_NAME} rules={rules} section="identities">
        <Heading as="h1" size="md">
          {identity.name}
        </Heading>
      </AdminLayout>
    </>
  );
}

export default AdminIdentityPage;
