import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { CheckboxField, IdentitySelectField, SubmitButton } from "@plural/form";
import {
  ActivateIdentityRequest,
  ActivateIdentityRequestSchema,
  IdentitySummary,
} from "@plural/schema";
import { useAuth } from "@plural/use-auth";
import { useIdentities } from "@plural/use-identities";
import axios from "axios";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { useMemo, useState } from "react";

export interface IdentitySwitcherProps {
  /**
   * Set the {@link modal} flag if rendering inside a modal. Content sizing will be adjusted for a narrower environment.
   */
  modal?: boolean;

  /**
   * A list of all identities available.
   *
   * This is intended only* for the noscript session manager (`/session/`) -
   * other instances of the identity switcher should be able to find a list of identities in context
   * (cached in local storage and/or fetched in the background).
   *
   * Note*: {@link identities} can be safely supplied outside the session manager, although
   * it's likely an ineficient use of resources to pass around in other requests.
   */
  identities?: IdentitySummary[];
}

/**
 * A basic form for switching identities.
 * Can be included in a modal or directly on the session page.
 */
export function IdentitySwitcher({ modal, ...props }: IdentitySwitcherProps) {
  const [refreshing, setRefreshing] = useState(false);
  const identityContext = useIdentities();

  const identities = useMemo(() => {
    if (identityContext.identities.length > 0) {
      return identityContext.identities;
    }

    return props.identities;
  }, [identityContext.identities, props.identities]);

  const FULL_COLUMNS = {
    base: 2,
    sm: 3,
    md: 4,
    lg: 5,
  };

  const MODAL_COLUMNS = {
    base: 2,
    md: 3,
  };

  const columns = modal ? MODAL_COLUMNS : FULL_COLUMNS;

  // TODO: allow pages to inject context setting their best guess at window width based on client headers,
  // use that instead of defaulting to "sm" (Chakra suggests NPM package 'is-mobile')
  const cols = useBreakpointValue(columns, { fallback: "sm" });
  const activeGrid = useDisclosure();

  const { clientOn, loggedIn, front, refresh } = useAuth();

  if (!loggedIn) {
    return (
      <Box py={10}>
        <Center>
          <Heading size="lg" my={4}>
            No Active Session
          </Heading>
        </Center>
        <Center>
          <Text>You are not logged in to any accounts.</Text>
        </Center>
        <Center my={4}>
          <NextLink href="/login/" passHref legacyBehavior>
            <Button as="a" colorScheme="primary">
              Login
            </Button>
          </NextLink>
        </Center>
      </Box>
    );
  }

  return (
    <Box>
      <Center>
        <Heading size="md" my={1}>
          Active Identities
        </Heading>
      </Center>
      {(!front || !Array.isArray(front) || front.length === 0) && (
        <Box>
          <Center>
            <Text my={5}>No identities are active.</Text>
          </Center>
        </Box>
      )}
      {!!front && Array.isArray(front) && front.length && (
        <Box>
          <SimpleGrid columns={columns}>
            {front.slice(0, activeGrid.isOpen ? undefined : cols).map((f) => (
              // TODO: Use 'group' to highlight controls when you hover on a profile?
              <Box key={f.id} role="group">
                <Center>
                  {/* TODO: Render user avatar */}
                  <Avatar name={f.name} />
                </Center>
                <Center>
                  <Heading size="sm">
                    {/* TODO: Render identity name */}
                    {f.id}
                  </Heading>
                </Center>
                <Center>
                  <ButtonGroup size="sm">
                    <NextLink href={`/account/identities/${f.id}/`} passHref legacyBehavior>
                      <Button as="a" colorScheme="secondary">
                        Edit
                      </Button>
                    </NextLink>
                    {clientOn ? (
                      <Button>Deactivate</Button>
                    ) : (
                      // TODO: Add a property so identity switcher can define a "back" parameter
                      <NextLink
                        href={`/api/session/identities/${f.id}/deactivate/`}
                        passHref
                        legacyBehavior
                      >
                        <Button as="a">Deactivate</Button>
                      </NextLink>
                    )}
                  </ButtonGroup>
                </Center>
                {/* TODO: Render controls */}
              </Box>
            ))}
          </SimpleGrid>
          <Center display={front.length > (cols ?? 0) ? undefined : "none"}>
            <Button onClick={activeGrid.onToggle} color="primary" size="sm">
              {activeGrid.isOpen ? "Show Less" : "Show More"}
            </Button>
          </Center>
        </Box>
      )}

      <Center>
        <Heading size="md" my={1}>
          Activate Identity
        </Heading>
      </Center>
      {/* TODO: Add quick actions for "flagged" and/or recent identities */}
      <Formik<ActivateIdentityRequest>
        initialValues={{
          replace: false,
          identity: "",
        }}
        validationSchema={ActivateIdentityRequestSchema}
        onSubmit={async (values) => {
          const res = await axios.post("/api/session/identity/add/", values);
          if (res.data.status === "ok") {
            refresh();
          }
          return;
        }}
      >
        {/* TODO: Add "back" property */}
        <Form action="/api/session/identity/add/" method="POST">
          <CheckboxField
            name="replace"
            label="Replace"
            text="Replace all active identities with the selected identity"
          />
          <Flex align="center">
            <Box flex="1" mr={1}>
              <IdentitySelectField
                name="identity"
                identities={identities ?? []}
                label="Identity"
                placeholder="Select an identity"
                required
                field="id"
              />
            </Box>
            <Box>
              <Button
                size="sm"
                disabled={identityContext.refresh === null}
                isLoading={refreshing}
                onClick={async () => {
                  if (identityContext.refresh) {
                    setRefreshing(true);
                    try {
                      await identityContext.refresh();
                      setRefreshing(false);
                    } catch (e) {
                      setRefreshing(false);
                    }
                  }
                }}
              >
                Refresh List
              </Button>
            </Box>
          </Flex>
          <SubmitButton>Select Identity</SubmitButton>
        </Form>
      </Formik>
    </Box>
  );
}

export default IdentitySwitcher;
