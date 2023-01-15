import { Card, CardBody, CardHeader, Container, Heading } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { getAccountIdentities } from "@plural/db";
import flatten from "lodash.flatten";
import { InferGetServerSidePropsType } from "next";
import { Form, Formik } from "formik";
import { CheckboxField, SubmitButton } from "@plural/form";
import { useRouter } from "next/router";
import { prismaClient } from "@plural/prisma";

export const getServerSideProps = withIronSessionSsr(async ({ req, res }) => {
  const { users } = req.session;

  if (!users) {
    res.setHeader("location", "/login/");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        identities: [],
      },
    };
  }

  const prisma = prismaClient();

  const allIdentities = await Promise.all(
    users.map((user) => getAccountIdentities(user.id, prisma)),
  );
  const identities = flatten(allIdentities);

  return {
    props: {
      identities,
    },
  };
}, SESSION_OPTIONS);

export function ComposeHomePage({
  identities,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <Container>
      <Heading as="h1">Compose a note</Heading>
      <Heading size="md">Authors</Heading>
      <Formik
        initialValues={{
          identities: {},
        }}
        onSubmit={async (values) => {
          const r = await fetch("/api/note/start/", {
            method: "POST",
            body: JSON.stringify(values),
          });
          const res = await r.json();
          if (res.status === "ok") {
            router.push(`/compose/${res.note}/${res.draft}`);
          }
        }}
      >
        <Form>
          {/* TODO: this should be profiles, not identities. */}
          {identities.map((identity) => (
            <Card key={identity.id}>
              <CardHeader>
                <Heading size="md">
                  {identity.display.displayName && identity.display.displayName.length > 0
                    ? identity.display.displayName
                    : identity.display.name}
                </Heading>
              </CardHeader>
              <CardBody>
                <CheckboxField
                  name={`identities.${identity.id}`}
                  label={identity.display.displayName ?? identity.display.name}
                  text="Authoring"
                />
              </CardBody>
            </Card>
          ))}
          <SubmitButton colorScheme="blue">Create Draft with Authors</SubmitButton>
        </Form>
      </Formik>
    </Container>
  );
}

export default ComposeHomePage;
