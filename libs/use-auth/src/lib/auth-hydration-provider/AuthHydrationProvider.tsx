import isEqual from "lodash.isequal";
import { ReactNode, useEffect, useMemo } from "react";
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
    return auth.front ?? existing.front;
  }, [auth.front, existing.front]);

  const users = useMemo(() => {
    return auth.users ?? existing.users;
  }, [auth.users, existing.users]);

  useEffect(() => {
    if (auth.front && !isEqual(auth.front, existing.front)) {
      existing.setFront(auth.front);
    }
  }, [auth.front, existing]);

  const loggedIn = useMemo(() => {
    return !!users && Array.isArray(users) && users.length > 0;
  }, [users]);

  const ctx: AuthContext = {
    hydrated: true,
    clientOn: existing.clientOn,
    loggedIn,
    front,
    users,
    addUser: existing.addUser,
    setFront: existing.setFront,
    setUsers: existing.setUsers,
  };

  return <authContext.Provider value={ctx}>{children}</authContext.Provider>;
}

export default AuthHydrationProvider;
