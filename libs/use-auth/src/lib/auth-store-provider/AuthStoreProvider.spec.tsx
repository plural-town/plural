import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import React, { ReactNode } from "react";

import AuthStoreProvider from "./AuthStoreProvider";

const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
};

describe("AuthStoreProvider", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<AuthStoreProvider />, { wrapper });
    expect(baseElement).toBeTruthy();
  });
});
