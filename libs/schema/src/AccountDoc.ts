import * as Yup from "yup";

/**
 * A moderately flattened representation of an {@link Account},
 * intended for rendering and ACL.
 */
export interface AccountDoc {
  kind: "Account";
  id: string;
}

export const AccountDocSchema = Yup.object().shape({
  kind: Yup.mixed<"Account">().oneOf(["Account"]).required(),
  id: Yup.string().required(),
});
