import { render } from "@testing-library/react";

import DashboardLayout from "./DashboardLayout";

describe("DashboardLayout", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<DashboardLayout brand="Plural Social" />);
    expect(baseElement).toBeTruthy();
  });
});
