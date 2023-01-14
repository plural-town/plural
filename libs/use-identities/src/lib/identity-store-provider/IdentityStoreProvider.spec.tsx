import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import React, { ReactNode } from "react";

import IdentityStoreProvider from "./IdentityStoreProvider";

const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
};

describe("IdentityStoreProvider", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<IdentityStoreProvider />, { wrapper });
    expect(baseElement).toBeTruthy();
  });
});
