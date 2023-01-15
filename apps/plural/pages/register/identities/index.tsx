import {
  Button,
  Card,
  CardHeader,
  Container,
  Divider,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { InferGetServerSidePropsType } from "next";
import NextLink from "next/link";
import { Form, Formik } from "formik";
import { InputField, SubmitButton } from "@plural/form";
import { CreateIdentityRequest, CreateIdentityRequestSchema } from "@plural/schema";
import { useState } from "react";
import { prismaClient } from "@plural/prisma";

export const getServerSideProps = withIronSessionSsr(async ({ req, res }) => {
  const name = process.env.SITE_NAME;
  const links = {
    system: process.env.EXT_LINK_SYSTEM_INFO,
  } as const;
  const { registration } = req.session;

  if (!registration) {
    res.setHeader("location", "/register/email/login/");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        accountId: "",
        name,
        links,
        identities: [],
      },
    };
  }

  const prisma = prismaClient();

  const grants = await prisma.identityGrant.findMany({
    where: {
      accountId: registration.id,
    },
    include: {
      identity: {
        include: {
          display: true,
        },
      },
    },
  });

  const identities = grants.map((grant) => {
    const { identity, permission } = grant;
    const { id, display } = identity;
    return {
      id,
      display: {
        name: display.name,
        nameVisibility: display.nameVisibility,
        displayName: display.displayName,
        displayNameVisibility: display.displayNameVisibility,
      },
      grant: {
        permission,
      },
    };
  });

  return {
    props: {
      accountId: registration.id,
      name,
      links,
      identities,
    },
  };
}, SESSION_OPTIONS);

export function RegistrationIdentitiesPage({
  accountId,
  name,
  links,
  identities,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [identityList, setIdentityList] = useState(identities);

  const nonEmpty = (str: string) => {
    if (typeof str === "string" && str.length > 0) {
      return str;
    }
    return undefined;
  };

  return (
    <Container>
      <Heading as="h1">Identities</Heading>
      <Text my={2}>
        Unlike many social network platforms, {name} allows you to have multiple identities under a
        single account.
      </Text>
      <Text my={2}>
        These identities will not be publicly visible - instead, they are like creating multiple
        accounts in your web browser, for different browsing experiences. The next step will create
        one or more public profiles.
      </Text>
      <Text my={2}>
        If you are setting up an account for an organization or company you may wish to create one
        identity for yourself as a staff member, and one identity for the company as a whole.
      </Text>
      <Text my={2}>
        <Link href={links.system}>Systems</Link> may wish to create accounts for each alter.
      </Text>
      {identityList.map((identity) => (
        <Card
          key={identity.id}
          my={2}
          data-identity={identity.id}
          data-identity-name={identity.display.name}
        >
          <CardHeader>
            <Heading size="sm">
              {nonEmpty(identity.display.displayName) ?? identity.display.name}
            </Heading>
          </CardHeader>
        </Card>
      ))}
      <NextLink href="/register/profiles/" passHref legacyBehavior>
        <Button as="a" colorScheme="purple">
          Next Step: Profile Creation
        </Button>
      </NextLink>
      <Divider mt={6} mb={4} />
      <Heading as="h2" size="md">
        Add Identity
      </Heading>
      <Formik<CreateIdentityRequest>
        initialValues={{
          accountId,
          name: "",
          displayName: "",
        }}
        validationSchema={CreateIdentityRequestSchema}
        onSubmit={async (values) => {
          const r = await fetch("/api/identity/create/", {
            method: "POST",
            body: JSON.stringify(values),
          });
          const res = await r.json();
          if (res.status === "ok") {
            setIdentityList([...identityList, res.identity]);
          }
        }}
      >
        <Form>
          <InputField name="name" label="Name" />
          <InputField
            name="displayName"
            label="Display Name"
            helpText="Typically used for longer names, or for a more descriptive name that is not visible to everyone."
          />
          <SubmitButton colorScheme="blue">Create Identity</SubmitButton>
        </Form>
      </Formik>
    </Container>
  );
}

export default RegistrationIdentitiesPage;
