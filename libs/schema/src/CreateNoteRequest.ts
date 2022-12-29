import * as Yup from "yup";

export interface CreateNoteRequest {
  identities: Record<string, boolean>;

  /**
   * Text to use as the first content
   */
  content?: string;

  /**
   * An initial set of profiles that the note will be posted to.
   * May be changed while drafting the note.
   */
  profiles?: Record<string, boolean>;
}

export const CreateNoteRequestSchema = Yup.object().shape({
  identities: Yup.object().required(),

  content: Yup.string().optional(),

  profiles: Yup.object().optional(),
});
