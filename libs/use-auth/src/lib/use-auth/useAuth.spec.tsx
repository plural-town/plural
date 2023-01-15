import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import React, { ReactNode } from "react";
import AuthStoreProvider from "../auth-store-provider/AuthStoreProvider";

import useAuth from "./useAuth";

const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthStoreProvider>{children}</AuthStoreProvider>
    </QueryClientProvider>
  );
};

describe("useAuth", () => {
  it("should work without context", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.users).toBeUndefined();
    expect(result.current.front).toBeUndefined();
  });

  it("should store authentication", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });
    expect(result.current.users).toBeUndefined();

    act(() => {
      result.current.addUser({
        id: "1234",
      });
    });
    expect(result.current.users).toStrictEqual([{ id: "1234" }]);
  });
});
