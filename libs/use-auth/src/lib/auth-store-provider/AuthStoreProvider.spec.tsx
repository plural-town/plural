import { render } from "@testing-library/react";

import AuthStoreProvider from "./AuthStoreProvider";

describe("AuthStoreProvider", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<AuthStoreProvider />);
    expect(baseElement).toBeTruthy();
  });
});
