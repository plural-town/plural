import { rulesFor } from "@plural-town/ability";
import { render } from "@testing-library/react";

import AdminCan, { AdminProvider } from "./AdminCan";

describe("AdminCan", () => {
  it("hides the dashboard for the public", () => {
    const dashboard = render(
      <AdminProvider rules={rulesFor([], [])}>
        <AdminCan I="browse" a="AdminDashboard">
          Hello World
        </AdminCan>
      </AdminProvider>,
    );
    expect(dashboard.queryByText("Hello World")).toBeNull();
  });

  it("shows the dashboard to administrators", () => {
    const dashboard = render(
      <AdminProvider rules={rulesFor([], [{ id: "123", profiles: [], role: "ADMIN" }])}>
        <AdminCan I="browse" a="AdminDashboard">
          Hello World
        </AdminCan>
      </AdminProvider>,
    );
    expect(dashboard.getByText("Hello World")).toBeTruthy();
  });

  it("defaults to public permissions", () => {
    const dashboard = render(
      <AdminCan not I="browse" a="AdminDashboard">
        You are not an administrator.
      </AdminCan>,
    );
    expect(dashboard.getByText("You are not an administrator.")).toBeTruthy();
  });
});
