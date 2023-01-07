import { permittedFieldsOf } from "@casl/ability/extra";
import { abilityForRequest } from "@plural-town/next-ability";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import pick from "lodash.pick";
import { AdminLayout } from "@plural/ui";
import { Container, Heading, useToast } from "@chakra-ui/react";
import { param } from "@plural/next-utils";
import { createIdentityDoc, IdentityDoc } from "@plural/schema";
import { Form, Formik } from "formik";
import { RoleSelectField, SubmitButton } from "@plural/form";
import { abilityFor } from "@plural-town/ability";
import axios from "axios";

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
    fieldsFrom: () => ["kind", "id", "role", "visibility", "name", "nameVisibility"],
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
  const toast = useToast();
  const ability = abilityFor(rules);
  return (
    <>
      <Head>
        <title>{`${identity.name} - Identity`}</title>
      </Head>
      <AdminLayout brand={SITE_NAME} rules={rules} section="identities">
        <Container maxW="container.md" bg="white" p={5}>
          <Heading as="h1" size="md">
            {identity.name}
          </Heading>
          <Formik
            initialValues={identity}
            onSubmit={async (values) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const submit = pick(values, permittedFieldsOf(ability, "update", values as any as IdentityDoc, {
                fieldsFrom: () => ["role"],
              }));
              await axios.post(`/api/identity/${identity.id}/update/`, submit);
              toast({
                title: "Updated",
                description: "Successfully updated identity.",
                status: "success",
                position: "top-right",
                isClosable: true,
              });
            }}
          >
            <Form>
              <RoleSelectField
                name="role"
                label="Role"
                placeholder="Select role"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                disabled={ability.cannot("update", identity as any as IdentityDoc, "role")}
              />
              <SubmitButton colorScheme="brand">
                Save
              </SubmitButton>
            </Form>
          </Formik>
        </Container>
      </AdminLayout>
    </>
  );
}

export default AdminIdentityPage;
