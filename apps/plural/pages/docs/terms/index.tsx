import { Heading, LinkBox, LinkOverlay } from "@chakra-ui/react";
import { DocLayout, DocNavItem, DocNavItemTitle } from "@plural/ui";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";

interface Term {
  id: string;
  name: string;
}

export const getStaticProps = (async () => {
  // TODO: Figure out best (cross-environment) way to automatically find terms.

  const terms = [
    { id: "ActivityPub", name: "ActivityPub" },
    { id: "fediverse", name: "Fediverse" },
  ] as const satisfies readonly Term[];

  return {
    props: {
      terms,
    },
  };
}) satisfies GetStaticProps;

export function GlossaryIndex({ terms }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>Glossary</title>
      </Head>
      <DocLayout>
        <Heading as="h1" size="lg">
          Glossary
        </Heading>
        { terms.map(term => (
          <LinkBox key={term.id} as="article">
            <DocNavItem>
              <DocNavItemTitle>
                <Link href={`/docs/terms/${term.id}/`} passHref legacyBehavior>
                  <LinkOverlay>
                    { term.name }
                  </LinkOverlay>
                </Link>
              </DocNavItemTitle>
            </DocNavItem>
          </LinkBox>
        ))}
      </DocLayout>
    </>
  );
}

export default GlossaryIndex;
