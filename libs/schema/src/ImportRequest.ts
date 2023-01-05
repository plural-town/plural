import * as Yup from "yup";

/**
 * Request remote ActivityPub content.
 */
export interface ImportRequest {
  url: string;
}

export const ImportRequestSchema = Yup.object().shape({
  url: Yup.string().url().required(),
});
