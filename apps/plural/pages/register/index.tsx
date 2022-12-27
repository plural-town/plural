import { Container, Heading } from "@chakra-ui/react";
import { CheckboxField, InputField, SubmitButton } from "@plural/form";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";

export function RegistrationPage() {
  const router = useRouter();

  return (
    <Container>
      <Heading as="h1">
        Register for Pure Social
      </Heading>
      <Container maxW="container.md">
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            singlet: false,
          }}
          onSubmit={async (values) => {
            const fetched = await fetch("/api/register", {
              method: "POST",
              body: JSON.stringify(values),
            });
            const res = await fetched.json();
            if(res.id) {
              // registration completed - in email disabled mode
              if(values.singlet) {
                router.push("/app/");
              } else {
                router.push("/app/front/");
              }
            } else {
              router.push("/register/sent/");
            }
          }}
        >
          <Form
            method="POST"
            action="/api/register/?noscript=true"
          >
            <InputField
              name="name"
              label="Full Name"
              placeholder="Jay Doe"
            />
            <InputField
              name="email"
              type="email"
              label="Email Address"
              placeholder="jay@example.com"
            />
            <InputField
              name="password"
              type="password"
              label="Password"
            />
            <CheckboxField
              name="singlet"
              label="Singlet Mode"
              text="I am always the same identity"
              helpText="One user may have multiple identities.  Select singlet mode if you do not wish to have multiple identities to choose from each time you login."
            />
            <SubmitButton>
              Register
            </SubmitButton>
          </Form>
        </Formik>
      </Container>
    </Container>
  );
}

export default RegistrationPage;
