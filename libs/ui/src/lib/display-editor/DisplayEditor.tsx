import { Card, CardBody, CardHeader, Heading, Text, useToast } from "@chakra-ui/react";
import { InputField, SubmitButton } from "@plural/form";
import { SerializableDisplayName, UpdateDisplay, UpdateDisplaySchema } from "@plural/schema";
import { Form, Formik } from "formik";
import VisibilityFieldWrapper from "../visibility-field-wrapper/VisibilityFieldWrapper";

export interface DisplayEditorProps {
  id: string;
  display: SerializableDisplayName;
}

export function DisplayEditor({
  id,
  display,
}: DisplayEditorProps) {
  const toast = useToast();
  return (
    <Formik<UpdateDisplay>
      initialValues={{
        name: display.name,
        nameVisibility: display.nameVisibility,
        displayName: display.displayName,
        displayNameVisibility: display.displayNameVisibility,
        bio: display.bio,
        bioVisibility: display.bioVisibility,
      }}
      validationSchema={UpdateDisplaySchema}
      onSubmit={async (values) => {
        const r = await fetch(`/api/display/${id}/update/`, {
          method: "POST",
          body: JSON.stringify(values),
        });
        const res = await r.json();
        if(res.status === "ok") {
          toast({
            title: "Profile Updated",
            description: "Successfully updated profile.",
            status: "success",
            position: "top-right",
            isClosable: true,
          });
        }
      }}
    >
      <Form>
        <Card variant="outline">
          <CardHeader>
            <Heading size="sm">
              Edit Display
            </Heading>
            <Text fontSize="xs">
              Display ID {id}
            </Text>
          </CardHeader>
          <CardBody>
            <VisibilityFieldWrapper
              name="nameVisibility"
            >
              <InputField
                name="name"
                label="Name"
                my={{ md: 0 }}
              />
            </VisibilityFieldWrapper>
            <VisibilityFieldWrapper
              name="displayNameVisibility"
            >
              <InputField
                name="displayName"
                label="Display Name"
                my={{ md: 0 }}
              />
            </VisibilityFieldWrapper>
            <VisibilityFieldWrapper
              name="bioVisibility"
            >
              <InputField
                name="bio"
                label="Description/Bio"
                my={{ md: 0 }}
                textarea
              />
            </VisibilityFieldWrapper>
            <SubmitButton colorScheme="blue">
              Save Display
            </SubmitButton>
            {/* TODO: Also list other uses of the display */}
          </CardBody>
        </Card>
      </Form>
    </Formik>
  );
}

export default DisplayEditor;
