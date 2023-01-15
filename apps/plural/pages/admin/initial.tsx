import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { getLogger } from "@plural/log";
import Head from "next/head";
import { Container, Heading } from "@chakra-ui/react";
import { InferGetServerSidePropsType } from "next";
import { Form, Formik } from "formik";
import { IdentitySelectField, InputField, SubmitButton } from "@plural/form";
import { getAccountIdentities } from "@plural/db";
import flatten from "lodash.flatten";
import axios from "axios";
import { useRouter } from "next/router";
import { prismaClient } from "@plural/prisma";

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const log = getLogger("AdminPage.getServerSideProps");
  if (process.env.ADMIN_PROMOTION !== "true") {
    return {
      redirect: {
        destination: "/admin/",
        permanent: true,
      },
    };
  }

  const TOKEN = process.env.ADMIN_PROMOTE_TOKEN;
  const EMAIL = process.env.ADMIN_PROMOTE_EMAIL;
  const IDENT = process.env.ADMIN_PROMOTE_IDENTITY;

  if (
    (!TOKEN || TOKEN.length === 0) &&
    (!EMAIL || EMAIL.length === 0) &&
    (!IDENT || IDENT.length === 0)
  ) {
    log.warn("No promotion filter defined, promotion is disabled.");
    return {
      redirect: {
        destination: "/admin/",
        permanent: true,
      },
    };
  }

  const users = req.session.users;

  if (!users) {
    return {
      redirect: {
        destination: "/login/",
        permanent: false,
      },
    };
  }

  const prisma = prismaClient();

  const identities = flatten(
    await Promise.all(users.map((u) => getAccountIdentities(u.id, prisma))),
  );

  return {
    props: {
      token: TOKEN && TOKEN.length > 0,
      identities,
    },
  };
}, SESSION_OPTIONS);

export function AdminPage({
  token,
  identities,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Promote Initial Administrator</title>
      </Head>
      <Container maxW="container.md">
        <Heading as="h1">Promote Initial Administrator</Heading>
        <Formik
          initialValues={{
            token: "",
            identity: "",
          }}
          onSubmit={async (values) => {
            const res = await axios.post("/api/admin/initial/", values);
            if (res.data.status === "ok") {
              router.push("/admin/");
            }
          }}
        >
          <Form method="POST" action="/api/admin/initial/?noscript=true">
            <IdentitySelectField
              name="identity"
              required
              label="Promoted Identity"
              placeholder="Choose Identity"
              identities={identities}
              field="id"
            />
            {token && (
              <InputField
                name="token"
                required
                label="Promotion Token"
                helpText="The secret token set in .env"
              />
            )}
            <SubmitButton colorScheme="brand">Promote</SubmitButton>
          </Form>
        </Formik>
      </Container>
    </>
  );
}

export default AdminPage;
