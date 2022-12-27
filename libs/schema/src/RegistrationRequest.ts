import * as Yup from "yup";

export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
  singlet: boolean;
}

export const RegistrationRequestSchema = Yup.object().shape({
  name: Yup.string().min(2).required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(4).required(),
  singlet: Yup.bool().optional(),
});
