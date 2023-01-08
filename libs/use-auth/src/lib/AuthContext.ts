import { createContext } from "react";

export interface UserSessionContext {
  id: string;
}

export interface IdentitySessionContext {
  id: string;
  account: string | null;
}

export interface UnsafeAuthContext {
  /**
   * If the user is currently authenticated.
   */
  loggedIn: boolean;
}

export interface AuthContext {
  /**
   * If the auth context has been loaded with data:
   * - The client has loaded, and loaded session data from local storage
   * - The server has attached session data via {@link AuthHydrationProvider},
   *   providing auth data on first load.
   */
  hydrated: boolean;

  /**
   * If the client has "warmed up" and hydrated.
   *
   * If {@link hydrated} is set but {@link clientOn} is not, provide controls that work
   * without client-side JavaScript enabled.
   */
  clientOn: boolean;

  /**
   * If the user is currently authenticated.
   *
   * This value is _safe_ - it may be used on first render without causing a hydration error,
   * however it may change on first load.
   */
  loggedIn: boolean;

  users?: UserSessionContext[];
  front?: IdentitySessionContext[];

  addUser(user: UserSessionContext): void;
}

export const authContext = createContext<AuthContext>({
  hydrated: false,
  loggedIn: false,
  clientOn: false,
  addUser: () => {
    return;
  },
});
