import * as Yup from "yup";

export interface UpdateNoteContent {
  content: string;
}

export const UpdateNoteContentSchema = Yup.object().shape({
  content: Yup.string().optional(),
});
