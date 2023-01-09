import { IdentitySummary } from "@plural/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { identityContext } from "../context";
import { IdentityContext } from "../IdentityContext";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface StoredIdentity extends IdentitySummary {}

interface StoredData {
  identities: StoredIdentity[];
}

export interface IdentityStoreProviderProps {
  /**
   * The key used to cache identities in local storage.
   * Defaults to `identities`.
   */
  cache?: string;

  children?: ReactNode;
}

/**
 * Provides context containing a list of all {@link IdentitySummary} objects available to the currently logged in accounts.
 *
 * Identities may be cached in local storage and/or fetched from the server in the background.
 */
export function IdentityStoreProvider({ cache, children }: IdentityStoreProviderProps) {
  const [clientOn, setClientOn] = useState(false);
  const [stored, setStored] = useLocalStorage<StoredData>(cache ?? "identities", {
    identities: [],
  });

  useEffect(() => setClientOn(true), []);

  // TODO: should this always auto fetch, or wait for user to manually refresh?

  const fetch = useQuery({
    queryKey: ["identityList"],
    queryFn: () => {
      return axios.get("/api/identity/available/");
    },
    enabled: clientOn,
  });

  useEffect(() => {
    if (fetch.data && fetch.data.data.status === "ok") {
      const identities: IdentitySummary[] = fetch.data.data.identities;
      setStored({
        identities,
      });
    }
  }, [fetch.data, setStored]);

  // TODO: use fetched values if available

  const ctx: IdentityContext = {
    identities: clientOn ? stored.identities : [],
    refresh: async () => {
      await fetch.refetch();
    },
  };

  return <identityContext.Provider value={ctx}>{children}</identityContext.Provider>;
}

export default IdentityStoreProvider;
