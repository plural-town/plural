import { Container, Heading } from "@chakra-ui/react";
import { InputField, SubmitButton } from "@plural/form";
import { NewEmailRequestSchema } from "@plural/schema";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";

export function RegisterEmailLoginPage() {
  const router = useRouter();

  return (
    <Container>
      <Heading>
        Account Login
      </Heading>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={NewEmailRequestSchema}
        onSubmit={async (values) => {
          const r = await fetch("/api/login?registration=true", {
            method: "POST",
            body: JSON.stringify(values),
          });
          const res = await r.json();
          if(res.status === "ok") {
            router.push("/register/identities/");
          }
        }}
      >
        <Form>
          <InputField
            name="email"
            type="email"
            label="Email Address"
          />
          <InputField
            name="password"
            type="password"
            label="Password"
          />
          <SubmitButton>
            Login
          </SubmitButton>
        </Form>
      </Formik>
    </Container>
  );
}

export default RegisterEmailLoginPage;
