import { renderHook } from "@testing-library/react";
import IdentityStoreProvider from "../identity-store-provider/IdentityStoreProvider";

import useIdentities from "./useIdentities";

describe("useIdentities", () => {
  it("should work without context", () => {
    const { result } = renderHook(() => useIdentities());
    expect(result.current.identities).toStrictEqual([]);
  });

  it("should work inside <IdentityStoreProvider>", () => {
    const { result } = renderHook(() => useIdentities(), { wrapper: IdentityStoreProvider });
    expect(result.current.identities).toStrictEqual([]);
  });
});
