import { Container, Heading, Link, Text } from "@chakra-ui/react";
import { InputField, SubmitButton } from "@plural/form";
import { Form, Formik } from "formik";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { email, code } = query;

  return {
    props: {
      email,
      code,
    },
  };
};

export function ConfirmEmailPage({
  email,
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <Container>
      <Heading as="h1">
        Confirm Email Account
      </Heading>
      <Text>
        If you have been sent an email confirmation code, enter it below.
      </Text>
      <Text>
        <NextLink href="/register/email/" passHref legacyBehavior>
          <Link as="a">
            Register a new account
          </Link>
        </NextLink> if you have not been sent a verification code!
      </Text>
      <Formik
        initialValues={{
          email,
          code,
        }}
        onSubmit={async ({ email, code }) => {
          const r = await fetch("/api/account/confirm", {
            method: "POST",
            body: JSON.stringify({ email, password: code }),
          });
          const res = await r.json();
          if(res.status === "ok") {
            router.push("/register/email/login/");
          }
        }}
      >
        <Form>
          <InputField
            name="email"
            type="email"
            label="Email Address"
          />
          <InputField
            name="code"
            label="Confirmation Code"
          />
          <SubmitButton colorScheme="blue">
            Verify Email Address
          </SubmitButton>
        </Form>
      </Formik>
    </Container>
  )
}

export default ConfirmEmailPage;
