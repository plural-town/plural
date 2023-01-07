import { render } from "@testing-library/react";

import SidebarLayout from "./SidebarLayout";

describe("SidebarLayout", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SidebarLayout />);
    expect(baseElement).toBeTruthy();
  });
});
