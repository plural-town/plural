import * as Yup from "yup";

export interface CreateIdentityRequest {
  accountId: string;
  name: string;
  displayName: string;
}

export const CreateIdentityRequestSchema = Yup.object().shape({
  accountId: Yup.string().required(),
  name: Yup.string().min(1).required(),
  displayName: Yup.string().optional(),
});
