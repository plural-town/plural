import { ReactNode, useMemo } from "react";
import { authContext, AuthContext } from "../AuthContext";
import { ServerAuthHydration } from "../ServerAuthHydration";
import useAuth from "../use-auth/useAuth";

export interface AuthHydrationProviderProps {
  auth: ServerAuthHydration;
  children?: ReactNode;
}

/**
 * Supplies server-side authentication details, allowing authentication details to be supplied
 * on page-load without Next hydration errors.
 *
 * Supplements the context supplied by {@link AuthStoreProvider}, which should still be wrapping
 * {@link AuthHydrationProvider}.
 */
export function AuthHydrationProvider({ auth, children }: AuthHydrationProviderProps) {
  const existing = useAuth();

  const front = useMemo(() => {
    if (existing.clientOn) {
      return existing.front;
    }
    return auth.front ?? undefined;
  }, [auth.front, existing.clientOn, existing.front]);

  const users = useMemo(() => {
    if (existing.clientOn) {
      return existing.users;
    }
    return auth.users ?? undefined;
  }, [auth.users, existing.clientOn, existing.users]);

  const loggedIn = useMemo(() => {
    if (existing.clientOn) {
      return existing.loggedIn;
    }
    return !!users && Array.isArray(users) && users.length > 0;
  }, [existing.clientOn, existing.loggedIn, users]);

  const ctx: AuthContext = {
    hydrated: true,
    clientOn: existing.clientOn,
    loggedIn,
    front,
    users,
    addUser: existing.addUser,
  };

  return <authContext.Provider value={ctx}>{children}</authContext.Provider>;
}

export default AuthHydrationProvider;
