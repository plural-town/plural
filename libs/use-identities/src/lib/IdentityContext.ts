import { IdentitySummary } from "@plural/schema";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextIdentity extends IdentitySummary {}

export interface IdentityContext {
  identities: ContextIdentity[];

  /**
   * Allows the list of identities to be refreshed. `null` if refresh functionality is not available.
   *
   * Returns a Promise that resolves once the list of identities has been updated.
   */
  refresh: null | (() => Promise<void>);
}
