import { Container, Heading, Link, Text } from "@chakra-ui/react";
import { MDXProvider } from "@mdx-js/react";
import Head from "next/head";
import NextLink from "next/link";
import React, { ReactNode, useMemo } from "react";
import { AiFillFileText, AiOutlineMessage } from "react-icons/ai";
import { FaArrowLeft, FaLock, FaUser } from "react-icons/fa";
import { GrLaunch } from "react-icons/gr";
import { RiBookReadLine } from "react-icons/ri";
import SidebarHeader from "../sidebar-layout/sidebar-header/SidebarHeader";
import SidebarItem from "../sidebar-layout/sidebar-item/SidebarItem";
import SidebarLayoutMain from "../sidebar-layout/sidebar-layout-main/SidebarLayoutMain";
import SidebarLayoutPage from "../sidebar-layout/sidebar-layout-page/SidebarLayoutPage";
import SidebarSectionHeading from "../sidebar-layout/sidebar-section-heading/SidebarSectionHeading";
import SidebarSubItem from "../sidebar-layout/sidebar-sub-item/SidebarSubItem";
import Sidebar from "../sidebar-layout/sidebar/Sidebar";
import SidebarLayout from "../sidebar-layout/SidebarLayout";
import { useDocNavItem } from "./doc-nav-item/DocNavItem";
import DocNavItemContent from "./doc-nav-item/DocNavItemContent";
import DocNavItemTitle from "./doc-nav-item/DocNavItemTitle";

export type DocLayoutSection =
  | "start"
  | "user-account"
  | "user-identity"
  | "user-profile"
  | "user-notes";

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
      <DocNavItemTitle>
        { children }
      </DocNavItemTitle>
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
    return <DocNavItemContent>{ children }</DocNavItemContent>;
  }

  return <Text my={2}>{children}</Text>;
};

export interface DocMeta {
  title?: string;
  section?: DocLayoutSection;
}

export interface DocLayoutProps {
  children?: ReactNode;
  meta?: DocMeta;
  term?: string;
}

export function DocLayout({ meta, term, children }: DocLayoutProps) {
  const components = {
    h1: H1,
    h2: H2,
    h3: H3,
    p: P,
    a: MdLink,
  } as const;

  const title = useMemo(() => {
    if(term) {
      return `Definition: ${term}`;
    }
    return meta?.title ?? "Documentation";
  }, [meta, term]);

  return (
    <MDXProvider components={components}>
      <Head>
        <title>{title}</title>
      </Head>
      <SidebarLayout>
        <Sidebar brand="Documentation">
          <SidebarItem href="/" text="Back to Site" icon={FaArrowLeft} />
          <SidebarItem href="/docs/" text="Introduction" icon={AiFillFileText} />
          <SidebarItem text="Quickstart" icon={GrLaunch} open={meta?.section === "start"}>
            <SidebarSubItem href="/docs/start/register/" text="Register" />
            <SidebarSubItem href="/docs/start/interact/" text="Interact with Content" />
          </SidebarItem>
          <SidebarItem href="/docs/terms/" text="Glossary" icon={RiBookReadLine} />
          <SidebarSectionHeading>For Users</SidebarSectionHeading>
          <SidebarItem text="Your Account" icon={FaLock}>
            {/* <SidebarSubItem href="/docs/users/account/register/" text="Registering" /> */}
          </SidebarItem>
          <SidebarItem text="Identities" icon={FaUser}>
            {/* <SidebarSubItem href="/docs/users/identity/create/" text="Creating Identities" /> */}
            {/* <SidebarSubItem href="/docs/users/identity/manage/" text="Managing Identities" /> */}
          </SidebarItem>
          <SidebarItem text="Profiles" icon={AiFillFileText}>
            {/* <SidebarSubItem href="/docs/users/profile/create/" text="Creating a Profile" /> */}
            {/* <SidebarSubItem href="/docs/users/profile/manage/" text="Managing your Profile" /> */}
          </SidebarItem>
          <SidebarItem text="Short Messages (Toots)" icon={AiOutlineMessage}>
            {/* <SidebarSubItem href="/docs/users/notes/browse/" text="Browsing Toots" /> */}
            {/* <SidebarSubItem href="/docs/users/notes/create/" text="Posting Toots" /> */}
          </SidebarItem>
          {/* <SidebarItem text="Long-Form/Blogs" icon={RiFileEditLine}>
            <SidebarSubItem text="Read Blogs" />
            <SidebarSubItem text="Create Blog" />
            <SidebarSubItem text="Writing Posts" />
          </SidebarItem> */}
          {/* TODO: Include admin section?  only if admin? */}
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
