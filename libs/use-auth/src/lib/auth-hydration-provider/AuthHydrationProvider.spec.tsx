import { render } from "@testing-library/react";

import AuthHydrationProvider from "./AuthHydrationProvider";

describe("AuthHydrationProvider", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<AuthHydrationProvider />);
    expect(baseElement).toBeTruthy();
  });
});
