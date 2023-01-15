import { Card, CardBody, CardHeader, Container, Divider, Heading } from "@chakra-ui/react";
import { IdentitySelectField, InputField, ProfileSelectField, SubmitButton } from "@plural/form";
import { SESSION_OPTIONS } from "../../../lib/session";
import { Form, Formik } from "formik";
import { withIronSessionSsr } from "iron-session/next";
import { getAccountIdentities, getAccountProfiles } from "@plural/db";
import { InferGetServerSidePropsType } from "next";
import { CreateRootProfileRequestSchema } from "@plural/schema";
import { useState } from "react";
import { prismaClient } from "@plural/prisma";

export const getServerSideProps = withIronSessionSsr(async ({ req, res }) => {
  const { registration } = req.session;

  if (!registration) {
    res.setHeader("location", "/register/email/login/");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        identities: [],
        profiles: [],
      },
    };
  }

  const prisma = prismaClient();
  const identities = await getAccountIdentities(registration.id, prisma);
  const profiles = await getAccountProfiles(registration.id, prisma);

  return {
    props: {
      identities,
      profiles,
    },
  };
}, SESSION_OPTIONS);

export function RegisterProfilesPage({
  identities,
  profiles,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [profileList, setProfileList] = useState(profiles);

  return (
    <Container>
      <Heading as="h1">Profiles</Heading>
      {profileList
        .filter((p) => p.isRoot)
        .map((profile) => (
          <Card key={profile.id} data-profile={profile.id} data-profile-slug={profile.slug}>
            <CardHeader>
              <Heading size="sm">@{profile.slug}</Heading>
            </CardHeader>
            <CardBody>
              {profileList
                .filter((p) => p.parent === profile.id)
                .map((nested) => (
                  <Card
                    key={nested.id}
                    size="sm"
                    variant="filled"
                    data-profile={nested.id}
                    data-profile-slug={nested.slug}
                  >
                    <CardHeader>
                      <Heading size="xs">@{nested.slug}</Heading>
                    </CardHeader>
                  </Card>
                ))}
            </CardBody>
          </Card>
        ))}
      <Divider mt={6} mb={4} />
      <Heading as="h2" size="md">
        New Profile
      </Heading>
      <Formik
        initialValues={{
          parent: "",
          owner: "",
          slug: "",
          displayId: undefined,
          display: {
            name: "",
            displayName: "",
          },
          visibility: "PUBLIC",
        }}
        validationSchema={CreateRootProfileRequestSchema}
        onSubmit={async (values) => {
          const r = await fetch("/api/profile/create/", {
            method: "POST",
            body: JSON.stringify(values),
          });
          const res = await r.json();
          if (res.status === "ok") {
            setProfileList([...profileList, res.profile]);
          }
        }}
      >
        <Form>
          <ProfileSelectField
            name="parent"
            label="Parent"
            placeholder="No Parent (Root Profile)"
            profiles={profiles}
          />
          <IdentitySelectField
            name="owner"
            required
            label="Owner"
            placeholder="Select Owner"
            identities={identities}
            field="id"
            helpText="Select the first identity that will be able to manage this profile.  You can add more identities after the identity has been created."
          />
          <InputField name="slug" required label="Username/Handle" />
          <IdentitySelectField
            name="displayId"
            identities={identities}
            label="Link Display Fields to Profile"
            placeholder="No Link"
            field="displayId"
            helpText="You can link a page to an identity, so they will use the same name/display name/privacy settings, and changes will apply to both."
          />
          <InputField
            name="display.name"
            label="Profile Name"
            helpText="If you are not linking an identity, the regular/short name for this profile"
          />
          <InputField
            name="display.displayName"
            label="Profile Display Name"
            helpText="If you are not linking an identity, a longer name for this profile."
          />
          <SubmitButton colorScheme="blue">Create Profile</SubmitButton>
        </Form>
      </Formik>
    </Container>
  );
}

export default RegisterProfilesPage;
