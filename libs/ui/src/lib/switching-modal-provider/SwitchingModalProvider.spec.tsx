import { render } from "@testing-library/react";

import SwitchingModalProvider from "./SwitchingModalProvider";

describe("SwitchingModalProvider", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SwitchingModalProvider />);
    expect(baseElement).toBeTruthy();
  });
});
