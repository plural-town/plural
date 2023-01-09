import { render } from "@testing-library/react";

import IdentityStoreProvider from "./IdentityStoreProvider";

describe("IdentityStoreProvider", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<IdentityStoreProvider />);
    expect(baseElement).toBeTruthy();
  });
});
