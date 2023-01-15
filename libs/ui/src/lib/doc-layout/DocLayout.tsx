import { Container, Heading, Link, Text } from "@chakra-ui/react";
import { MDXProvider } from "@mdx-js/react";
import Head from "next/head";
import NextLink from "next/link";
import React, { ReactNode } from "react";
import { FaArrowLeft } from "react-icons/fa";
import SidebarHeader from "../sidebar-layout/sidebar-header/SidebarHeader";
import SidebarItem from "../sidebar-layout/sidebar-item/SidebarItem";
import SidebarLayoutMain from "../sidebar-layout/sidebar-layout-main/SidebarLayoutMain";
import SidebarLayoutPage from "../sidebar-layout/sidebar-layout-page/SidebarLayoutPage";
import Sidebar from "../sidebar-layout/sidebar/Sidebar";
import SidebarLayout from "../sidebar-layout/SidebarLayout";
import { useDocNavItem } from "./doc-nav-item/DocNavItem";

const MdLink: React.FC<{
  href?: string;
  children?: ReactNode;
}> = ({ href, children }) => {
  if (href?.includes("/terms/")) {
    return (
      <Link
        as={NextLink}
        href={href}
        color="brand.800"
        textDecoration="underline"
        textDecorationThickness="1"
        textDecorationColor="brand.500"
        textDecorationStyle="dashed"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link as={NextLink} href={href}>
      {children}
    </Link>
  );
};

const H1: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <Heading as="h1" size="lg" my={2} mb={3}>
      {children}
    </Heading>
  );
};

const H2: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <Heading as="h2" size="md" my={2}>
      {children}
    </Heading>
  );
};

const H3: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const navItem = useDocNavItem();

  if (navItem.nav) {
    return (
      <Heading size="xs" textTransform="uppercase" pb={1}>
        {children}
      </Heading>
    );
  }

  return (
    <Heading as="h3" size="sm" my={2}>
      {children}
    </Heading>
  );
};

const P: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const navItem = useDocNavItem();

  if (navItem.nav) {
    return <Text fontSize="sm">{children}</Text>;
  }

  return <Text my={2}>{children}</Text>;
};

export interface DocMeta {
  title?: string;
}

export interface DocLayoutProps {
  children?: ReactNode;
  meta?: DocMeta;
}

export function DocLayout({ meta, children }: DocLayoutProps) {
  const components = {
    h1: H1,
    h2: H2,
    h3: H3,
    p: P,
    a: MdLink,
  } as const;

  return (
    <MDXProvider components={components}>
      <Head>
        <title>{meta?.title ?? "Documentation"}</title>
      </Head>
      <SidebarLayout>
        <Sidebar brand="Documentation">
          <SidebarItem href="/" text="Back to Site" icon={FaArrowLeft} />
          <SidebarItem href="/docs/" text="Introduction" />
        </Sidebar>
        <SidebarLayoutMain>
          <SidebarHeader />
          <SidebarLayoutPage>
            <Container maxW="container.md">{children}</Container>
          </SidebarLayoutPage>
        </SidebarLayoutMain>
      </SidebarLayout>
    </MDXProvider>
  );
}

export default DocLayout;
