import { Card, CardBody, CardHeader, Heading, Text } from "@chakra-ui/react";
import { AuthorTypeSelectField } from "@plural/form";
import { ProfileSummary } from "@plural/schema";
import { AuthorType, Visibility } from "@prisma/client";
import { Form, Formik } from "formik";
import { useDisplayName } from "../util/useDisplayName";

export interface PostDestinationFormProps {
  noteId: string;

  destination: {
    id: string;
    profile: ProfileSummary;
    localOnly: boolean;
    privacy: Visibility;
    noteAuthor: AuthorType;
  };
}

export function PostDestinationForm({
  noteId,
  destination,
}: PostDestinationFormProps) {
  const name = useDisplayName(destination.profile.display);
  return (
    <Card my={2}>
      <CardHeader>
        <Heading size="sm">
          { name }
        </Heading>
        <Text fontSize="xs">
          Post #{ destination.id }
        </Text>
      </CardHeader>
      <CardBody>
        <Formik
          initialValues={{
            noteAuthor: destination.noteAuthor,
          }}
          onSubmit={async (values) => {
            return;
          }}
        >
          <Form>
            <AuthorTypeSelectField
              name="noteAuthor"
              label="Author Type"
              my={0}
            />
          </Form>
        </Formik>
      </CardBody>
    </Card>
  );
}
