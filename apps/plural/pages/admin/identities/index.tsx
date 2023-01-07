import { permittedFieldsOf } from "@casl/ability/extra";
import { abilityForRequest } from "@plural-town/next-ability";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionSsr } from "iron-session/next";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import NextLink from "next/link";
import pick from "lodash.pick";
import { AdminLayout } from "@plural/ui";
import { Heading, Link, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { intParam } from "@plural/next-utils";
import { IdentityDoc } from "@plural/schema";

const MAX_PER_PAGE = 500;
const PER_PAGE = 50;

export const getServerSideProps = withIronSessionSsr(async ({ query, req }) => {
  const [ability, prisma, rules] = await abilityForRequest(req, {
    baseRequirement: (ability) => ability.can("browse", "AdminDashboard", "identities"),
    ensurePrisma: true,
  });

  if (!ability || !prisma) {
    return {
      redirect: {
        destination: "/login/",
        permanent: false,
      },
    };
  }

  const found = await prisma.identity.findMany({
    take: Math.min(MAX_PER_PAGE, intParam(query, "perPage", PER_PAGE)),
    skip: intParam(query, "skip", 0),
    include: {
      display: true,
    },
  });

  const identities = found
    .map<IdentityDoc>((i) => ({
      kind: "Identity",
      id: i.id,
      role: i.role,
      // TODO: Add visibility field to identities
      visibility: "PUBLIC",
      name: i.display.name,
      nameVisibility: i.display.nameVisibility,
    }))
    .filter((i) => ability.can("browse", i, "id"))
    .map((i) =>
      // TODO: Switch to a wildcard version of pick, to allow automatic 'fieldsFrom'? https://casl.js.org/v6/en/guide/restricting-fields
      pick(
        i,
        permittedFieldsOf(ability, "browse", i, {
          fieldsFrom: () => ["id", "role", "visibility", "name", "nameVisibility"],
        }),
      ),
    );

  return {
    props: {
      SITE_NAME: process.env["SITE_NAME"],
      rules,
      identities,
    },
  };
}, SESSION_OPTIONS);

export function AdminIdentitiesPage({
  SITE_NAME,
  rules,
  identities,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Identities</title>
      </Head>
      <AdminLayout brand={SITE_NAME} rules={rules} section="identities">
        <Heading as="h1" size="md">
          Identities
        </Heading>
        <TableContainer>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              {identities.map((i) => (
                <Tr key={i.id}>
                  <Td>
                    <NextLink href={`/admin/identities/${i.id}/`} passHref legacyBehavior>
                      <Link as="a">{i.name}</Link>
                    </NextLink>
                  </Td>
                  <Td>{i.role}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </AdminLayout>
    </>
  );
}

export default AdminIdentitiesPage;
