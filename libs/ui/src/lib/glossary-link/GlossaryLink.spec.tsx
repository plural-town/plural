import { render } from "@testing-library/react";

import GlossaryLink from "./GlossaryLink";

describe("GlossaryLink", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<GlossaryLink />);
    expect(baseElement).toBeTruthy();
  });
});
