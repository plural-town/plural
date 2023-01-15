import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import {
  authContext,
  AuthContext,
  IdentitySessionContext,
  UserSessionContext,
} from "../AuthContext";
import { ServerAuthHydration } from "../ServerAuthHydration";

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

  // TODO: add useQuery caching options so this doesn't always fetch

  const fetch = useQuery({
    queryKey: ["auth"],
    queryFn: () => {
      return axios.get("/api/session/auth/");
    },
    enabled: clientOn,
  });

  useEffect(() => {
    if (fetch.data && fetch.data.data.status === "ok") {
      const auth: ServerAuthHydration = fetch.data.data.auth;
      setStored({
        users: auth.users ?? undefined,
        front: auth.front ?? undefined,
      });
    }
  }, [fetch.data, setStored]);

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

  const setUsers = useCallback(
    (users: UserSessionContext[]) => {
      setStored({
        users,
        front: stored.front,
      });
    },
    [setStored, stored.front],
  );

  const setFront = useCallback(
    (front: IdentitySessionContext[]) => {
      setStored({
        users: stored.users,
        front,
      });
    },
    [setStored, stored.users],
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
    setFront,
    setUsers,
    refresh: async () => {
      await fetch.refetch();
    },
  };

  return <authContext.Provider value={ctx}>{children}</authContext.Provider>;
}

export default AuthStoreProvider;
