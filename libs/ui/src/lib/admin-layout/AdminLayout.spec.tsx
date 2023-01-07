import { render } from "@testing-library/react";

import AdminLayout from "./AdminLayout";

describe("AdminLayout", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<AdminLayout brand="Plural Social" />);
    expect(baseElement).toBeTruthy();
  });
});
