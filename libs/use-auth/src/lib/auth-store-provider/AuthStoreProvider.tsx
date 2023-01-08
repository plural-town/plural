import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { authContext, AuthContext, UserSessionContext } from "../AuthContext";

type StoredData = Pick<AuthContext, "users" | "front">;

export interface AuthStoreProviderProps {
  /**
   * A unique identifier used to store the serialized session info under in local storage.
   * Defaults to `authStore`.
   */
  store?: string;

  children?: ReactNode;
}

/**
 * Caches details about the currently logged in accounts and identities across the application.
 *
 * Optimized for NextJS's rendering - the initial render will not use any client-only data (e.g. local storage)
 * so pages can be safely rendered on the server side.
 */
export function AuthStoreProvider({ store, children }: AuthStoreProviderProps) {
  const [clientOn, setClientOn] = useState(false);
  const [stored, setStored] = useLocalStorage<StoredData>(store ?? "authStore", {});

  const loggedIn = useMemo<boolean>(() => {
    return !!stored.users && Array.isArray(stored.users) && stored.users.length > 0;
  }, [stored.users]);

  const addUser = useCallback(
    (user: UserSessionContext): void => {
      const existingUsers = stored.users;
      if (!existingUsers || !Array.isArray(existingUsers)) {
        setStored({ users: [user], front: stored.front });
        return;
      }
      if (existingUsers.find((u) => u.id === user.id)) {
        return;
      }
      setStored({
        users: [...existingUsers, user],
        front: stored.front,
      });
    },
    [setStored, stored],
  );

  useEffect(() => {
    setClientOn(true);
  }, []);

  const ctx: AuthContext = {
    hydrated: clientOn,
    clientOn,
    loggedIn: clientOn ? loggedIn : false,
    users: clientOn ? stored.users : [],
    front: clientOn ? stored.front : [],
    addUser,
  };

  return <authContext.Provider value={ctx}>{children}</authContext.Provider>;
}

export default AuthStoreProvider;
