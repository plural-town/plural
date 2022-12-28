import * as Yup from "yup";

export interface CreateNSRequest {
  id: string;
}

export const CreateNSRequestSchema = Yup.object().shape({
  id: Yup.string().min(1).required(),
});
