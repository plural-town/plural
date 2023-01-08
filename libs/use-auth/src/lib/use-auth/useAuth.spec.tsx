import { act, renderHook } from "@testing-library/react";
import AuthStoreProvider from "../auth-store-provider/AuthStoreProvider";

import useAuth from "./useAuth";

describe("useAuth", () => {
  it("should work without context", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.users).toBeUndefined();
    expect(result.current.front).toBeUndefined();
  });

  it("should store authentication", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthStoreProvider,
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
