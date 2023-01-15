import { render } from "@testing-library/react";

import SiteHeaderUserMenu from "./SiteHeaderUserMenu";

describe("SiteHeaderUserMenu", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SiteHeaderUserMenu />);
    expect(baseElement).toBeTruthy();
  });
});
