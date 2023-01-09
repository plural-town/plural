import * as Yup from "yup";

export interface ActivateIdentityRequest {
  replace?: boolean;
  identity: string;
}

export const ActivateIdentityRequestSchema = Yup.object().shape({
  replace: Yup.boolean().optional(),
  identity: Yup.string().required(),
});
