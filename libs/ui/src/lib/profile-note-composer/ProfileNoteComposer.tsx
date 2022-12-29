import { Box, Card, CardBody, CardFooter } from "@chakra-ui/react";
import { IdentitySelectField, InputField, SubmitButton } from "@plural/form";
import { CreateNoteRequest, IdentitySummary } from "@plural/schema";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";

export interface ProfileNoteComposerProps {
  profileId: string;
  identities: IdentitySummary[];
}

/**
 * A form (in a card) for composing notes inside a profile's timeline.
 */
export function ProfileNoteComposer({
  profileId,
  identities,
}: ProfileNoteComposerProps) {
  const router = useRouter();

  return (
    <Formik
      initialValues={{
        content: "",
        author: "",
      }}
      onSubmit={async (values) => {
        const draft: CreateNoteRequest = {
          identities: {
            [values.author]: true,
          },
          content: values.content,
          profiles: {
            [profileId]: true,
          },
        };
        const r = await fetch("/api/note/start/", {
          method: "POST",
          body: JSON.stringify(draft),
        });
        const res = await r.json();
        if(res.status === "ok") {
          router.push(`/compose/${res.note}/${res.draft}`);
        }
      }}
    >
      <Form>
        <Card variant="outline" size="sm">
          <CardBody>
            <InputField
              name="content"
              label="New Toot"
              placeholder="I'm tooting"
              textarea
              my={0}
            />
          </CardBody>
          <CardFooter
            justify="space-between"
            alignItems="end"
            flexWrap="wrap"
          >
            <Box flex="1" mr={2}>
              <IdentitySelectField
                required
                name="author"
                label="Author"
                placeholder="Select Author"
                size="sm"
                my={0}
                identities={identities}
              />
            </Box>
            <SubmitButton
              size="md"
              colorScheme="accent"
              ml={2}
              my={0}
            >
              Start Draft
            </SubmitButton>
          </CardFooter>
        </Card>
      </Form>
    </Formik>
  );
}

export default ProfileNoteComposer;
