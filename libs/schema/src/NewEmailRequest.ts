import * as Yup from "yup";

export interface NewEmailRequest {
  email: string;
  password: string;
}

export const NewEmailRequestSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().min(4).required(),
});
