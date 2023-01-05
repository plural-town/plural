import * as Yup from "yup";

export interface ImportInvalidLoginResponse {
  status: "failure";
  error: "NO_LOGIN";
  nextStep: "LOGIN";
  message: string;
}

export interface ImportInvalidParameterResponse {
  status: "failure";
  error: "MISSING_PARAMETER";
  parameter: "query" | "search";
}

/**
 * The URL has been accepted, and will be processed in a background task.
 */
export interface ImportQueuedResponse {
  status: "ok";
  queued: true;
  query: string;
  job: string;
}

/**
 * The URL has already been processed, but the system was not able to find
 * a valid entity at the URL entered.
 */
export interface ImportInvalidResponse {
  status: "ok";
  queued: false;
  query: string;
  entityFound: false;
}

interface ImportCompleteResponse {
  status: "ok";
  queued: false;
  query: string;
  entityFound: true;
  entityId: string;
  url: string;
}

/**
 * The URL has already been processed, and is a note.
 */
export interface ImportCompleteNoteResponse extends ImportCompleteResponse {
  entityType: "NOTE";
}

/**
 * The URL has already been processed, and is a profile.
 */
export interface ImportCompletePersonResponse extends ImportCompleteResponse {
  entityType: "PERSON";
}

export type ImportResponse =
  | ImportInvalidLoginResponse
  | ImportQueuedResponse
  | ImportInvalidResponse
  | ImportCompleteNoteResponse
  | ImportCompletePersonResponse;

export type ImportStatusResponse =
  | ImportInvalidLoginResponse
  | ImportInvalidParameterResponse
  | ImportQueuedResponse
  | ImportCompleteNoteResponse
  | ImportCompletePersonResponse;

export const ImportResponseSchema = Yup.object().shape({
  status: Yup.mixed<"ok" | "failure">().oneOf(["ok", "failure"]).required(),
  error: Yup.mixed<"NO_LOGIN">()
    .oneOf(["NO_LOGIN"])
    .when("status", {
      is: "failure",
      then: (s) => s.required(),
    }),
  queued: Yup.boolean().when("status", {
    is: "ok",
    then: (s) => s.required(),
  }),
  query: Yup.string().when("status", {
    is: "ok",
    then: (s) => s.required(),
  }),
  job: Yup.string().when("queued", {
    is: true,
    then: (s) => s.required(),
  }),
  entityFound: Yup.boolean().when("queued", {
    is: false,
    then: (s) => s.required(),
  }),
});
