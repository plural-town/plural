import { Card, CardBody, CardFooter } from "@chakra-ui/react";
import { InputField, SubmitButton } from "@plural/form";
import { Form, Formik } from "formik";

/* eslint-disable-next-line */
export interface ProfileNoteComposerProps {}

export function ProfileNoteComposer(props: ProfileNoteComposerProps) {
  return (
    <Formik
      initialValues={{
        content: "",
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
              textarea
              my={0}
            />
          </CardBody>
          <CardFooter>
            <SubmitButton
              size="sm"
              colorScheme="accent"
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
