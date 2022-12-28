import { Container, Heading, Link, Text } from "@chakra-ui/react";
import { InputField, SubmitButton } from "@plural/form";
import { NewEmailRequestSchema } from "@plural/schema";
import { Form, Formik } from "formik";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      name: process.env.SITE_NAME ?? "this social network",
    },
  } as const;
};

export function EmailRegistrationStep({
  name,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  return (
    <Container>
      <Heading size="lg">
        Create An Account
      </Heading>
      <Text>
        To get started, enter your email address and a password to use for {name}.
      </Text>
      <Text>
        You can <NextLink href="/register/email/confirm/" passHref legacyBehavior>
          <Link as="a">
            confirm a code
          </Link>
        </NextLink> that you have already been sent.
      </Text>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={NewEmailRequestSchema}
        onSubmit={async (values) => {
          const r = await fetch("/api/account/create", {
            method: "POST",
            body: JSON.stringify(values),
          });
          const res = await r.json();
          if(typeof res.code === "string") {
            router.push(`/register/email/confirm/?email=${encodeURIComponent(values.email)}&code=${res.code}`);
          } else {
            router.push(`/register/email/confirm/?email=${encodeURIComponent(values.email)}`);
          }
        }}
      >
        <Form>
          <InputField
            name="email"
            label="Email Address"
          />
          <InputField
            name="password"
            type="password"
            label="Password"
          />
          <SubmitButton colorScheme="blue">
            Create Account
          </SubmitButton>
        </Form>
      </Formik>
    </Container>
  )
}

export default EmailRegistrationStep;
