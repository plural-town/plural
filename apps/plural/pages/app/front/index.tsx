import { Card, CardHeader, Container, Heading, LinkBox, LinkOverlay } from "@chakra-ui/react";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import NextLink from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";

export const getServerSideProps = withIronSessionSsr(async function({ req, res }) {
  const user = req.session.user;
  const userId: number | undefined = user?.id;

  if(userId === undefined) {
    res.setHeader("location", "/register");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        personas: [],
      },
    };
  }

  const prisma = new PrismaClient();
  const found = await prisma.persona.findMany({
    where: {
      userId,
    },
  });

  const personas = found.map(persona => ({
    id: persona.id,
    name: persona.name,
  }));

  return {
    props: {
      personas,
    },
  };
}, SESSION_OPTIONS)

export function FrontPage({
  personas,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleFront = useCallback(async (id: number) => {
    setPending(true);
    const res = await fetch(`/api/front/${id}/`);
    const body = await res.json();
    if(body.status === "ok") {
      router.push("/app/");
    }
    setPending(false);
    return;
  }, []);

  return (
    <Container>
      <Heading as="h1">
        Identity Selection
      </Heading>
      {
        personas.map(p => (
          <LinkBox key={p.id}>
            <Card key={p.id}>
              <CardHeader>
                <Heading size="md">
                  <NextLink
                    href={`/api/front/${p.id}/?noscript=true`}
                    prefetch={false}
                    passHref
                    legacyBehavior
                  >
                    <LinkOverlay onClick={e => {
                      e.preventDefault();
                      e.nativeEvent.stopImmediatePropagation();
                      handleFront(p.id);
                    }}>
                      { p.name }
                    </LinkOverlay>
                  </NextLink>
                </Heading>
              </CardHeader>
            </Card>
          </LinkBox>
        ))
      }
    </Container>
  );
}

export default FrontPage;
