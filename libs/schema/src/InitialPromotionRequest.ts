import * as Yup from "yup";

export interface InitialPromotionRequest {
  identity: string;
  token?: string;
}

export const InitialPromotionRequestSchema = Yup.object().shape({
  identity: Yup.string().required(),
  token: Yup.string().optional(),
});
