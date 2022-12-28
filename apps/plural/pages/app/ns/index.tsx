import { Card, CardHeader, Container, Divider, Heading, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import NextLink from "next/link";
import { Form, Formik } from "formik";
import { InputField, SubmitButton } from "@plural/form";
import { useRouter } from "next/router";
import { useCallback } from "react";

export const getServerSideProps = withIronSessionSsr(async function({ req, res }) {
  const DEFAULT_NS_LIMIT = parseInt(process.env.USER_DEFAULT_NS_LIMIT, 10);
  const session = req.session.user;

  if(session === undefined) {
    res.setHeader("location", "/login/");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        ns: [],
        nsLimit: DEFAULT_NS_LIMIT,
      },
    };
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: session.id,
    },
  });

  const found = await prisma.namespace.findMany({
    where: {
      userId: session.id,
    },
  });

  const ns = found.map(ns => ({
    id: ns.id,
  }));

  const nsLimit = user.nsLimit ?? DEFAULT_NS_LIMIT;

  return {
    props: {
      ns,
      nsLimit,
    },
  };
}, SESSION_OPTIONS);

export function NamespacePage({
  ns,
  nsLimit,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const selectNS = useCallback(async (ns: string) => {
    // TODO: Implement selecting NS
    const fetched = await fetch(`/api/ns/select/${ns}/`);
    const res = await fetched.json();
    if(res.status === "ok") {
      router.push("/app/");
    }
  }, []);

  return (
    <Container>
      <Heading as="h1">
        Namespace Selection
      </Heading>
      {
        ns.map(namespace => (
          <LinkBox key={namespace.id}>
            <Card>
              <CardHeader>
                <Heading size="md">
                  <NextLink
                    href={`/api/ns/select/${namespace.id}/?noscript=true`}
                    prefetch={false}
                    passHref
                    legacyBehavior
                  >
                    <LinkOverlay onClick={e => {
                      e.preventDefault();
                      e.nativeEvent.stopImmediatePropagation();
                      selectNS(namespace.id);
                    }}>
                      @{ namespace.id }
                    </LinkOverlay>
                  </NextLink>
                </Heading>
              </CardHeader>
            </Card>
          </LinkBox>
        ))
      }
      <Divider my={4} />
      <Heading as="h2" size="md">
        Create Namespace
      </Heading>
      <Text>
        Your namespace will act as your handle/username.
        You cannot change the name of your account.
      </Text>
      <Formik
        initialValues={{
          id: "",
        }}
        onSubmit={async (values) => {
          const fetched = await fetch("/api/ns/create/", {
            method: "POST",
            body: JSON.stringify(values),
          });
          const res = await fetched.json();
          if(res.status === "ok") {
            router.push("/app/");
          }
        }}
      >
        <Form
          method="POST"
          action="/api/ns/create/?noscript=true"
        >
          <InputField
            name="id"
            label="Handle"
            placeholder="JayDoe"
          />
          <SubmitButton>
            Create Handle
          </SubmitButton>
        </Form>
      </Formik>
    </Container>
  )
}

export default NamespacePage;
