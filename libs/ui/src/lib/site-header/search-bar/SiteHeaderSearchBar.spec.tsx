import { render } from "@testing-library/react";

import SiteHeaderSearchBar from "./SiteHeaderSearchBar";

describe("SiteHeaderSearchBar", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SiteHeaderSearchBar />);
    expect(baseElement).toBeTruthy();
  });
});
