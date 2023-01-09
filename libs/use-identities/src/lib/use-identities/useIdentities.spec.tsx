import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React, { ReactNode } from "react";
import IdentityStoreProvider from "../identity-store-provider/IdentityStoreProvider";

import useIdentities from "./useIdentities";

const wrapper: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <IdentityStoreProvider>
        { children }
      </IdentityStoreProvider>
    </QueryClientProvider>
  );
};

describe("useIdentities", () => {
  it("should work without context", () => {
    const { result } = renderHook(() => useIdentities());
    expect(result.current.identities).toStrictEqual([]);
  });

  it("should work inside <IdentityStoreProvider>", () => {
    const { result } = renderHook(() => useIdentities(), { wrapper });
    expect(result.current.identities).toStrictEqual([]);
  });
});
