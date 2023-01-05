import React, { ReactNode } from "react";
import { render } from "@testing-library/react";

import Index from "../pages/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe("Index", () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <Index name="Untitled Social" BASE_DOMAIN="example.com" REGISTRATION_ENABLED />,
      {
        wrapper,
      },
    );
    expect(baseElement).toBeTruthy();
  });
});
