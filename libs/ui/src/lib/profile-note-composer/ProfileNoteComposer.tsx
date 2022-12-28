import { Box, Card, CardBody, CardFooter } from "@chakra-ui/react";
import { IdentitySelectField, InputField, SubmitButton } from "@plural/form";
import { IdentitySummary } from "@plural/schema";
import { Form, Formik } from "formik";

export interface ProfileNoteComposerProps {
  identities: IdentitySummary[];
}

export function ProfileNoteComposer({
  identities,
}: ProfileNoteComposerProps) {
  return (
    <Formik
      initialValues={{
        content: "",
        author: "",
      }}
      onSubmit={async (values) => {
        return;
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
