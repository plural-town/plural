import * as Yup from "yup";

export interface CreateNoteRequest {
  identities: Record<string, boolean>;
}

export const CreateNoteRequestSchema = Yup.object().shape({
  identities: Yup.object().required(),
});
