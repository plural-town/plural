import { ChakraProvider } from "@chakra-ui/react";
import { AuthStoreProvider } from "@plural/use-auth";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchMediaMock from "jest-matchmedia-mock";
import React, { ReactNode } from "react";

import IdentitySwitcher from "./IdentitySwitcher";

const AuthWrapper: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <ChakraProvider>
      <AuthStoreProvider>{children}</AuthStoreProvider>
    </ChakraProvider>
  );
};

const AuthenticatedNotFronting = {
  users: [
    {
      id: "123",
    },
  ],
};

const IDENTITY_01_NAME = "alter1";
const IDENTITY_10_NAME = "alter10";

const SingleFronting = {
  users: [
    {
      id: "123",
    },
  ],
  front: [
    {
      id: "alter1",
      account: "123",
    },
  ],
};

const ManyFronting = {
  users: [
    {
      id: "123",
    },
  ],
  front: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
    id: `alter${i}`,
    account: "123",
  })),
};

describe("IdentitySwitcher", () => {
  let matchMedia: MatchMediaMock;
  let getItem: jest.SpyInstance<string | null, [key: string]>;

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
    getItem = jest.spyOn(Storage.prototype, "getItem");
  });

  afterEach(() => {
    matchMedia.clear();
    getItem.mockClear();
  });

  afterAll(() => {
    getItem.mockRestore();
  });

  it("should render successfully", () => {
    const { baseElement } = render(<IdentitySwitcher />, { wrapper: ChakraProvider });
    expect(baseElement).toBeTruthy();
  });

  it("directs users to login if rendered without any context", () => {
    const switcher = render(<IdentitySwitcher />, { wrapper: ChakraProvider });
    expect(switcher.getByText("No Active Session")).toBeTruthy();
    expect(switcher.getByText("Login")).toBeTruthy();
  });

  it("directs users to login if rendered with empty context", () => {
    const switcher = render(<IdentitySwitcher />, {
      wrapper: AuthWrapper,
    });
    expect(switcher.getByText("No Active Session")).toBeTruthy();
    expect(switcher.getByText("Login")).toBeTruthy();
  });

  it("informs users if no identities are active", () => {
    getItem.mockImplementation(() => JSON.stringify(AuthenticatedNotFronting));
    const switcher = render(<IdentitySwitcher />, {
      wrapper: AuthWrapper,
    });
    expect(switcher.getByText("No identities are active.")).toBeTruthy();
  });

  it("lists an active identity", () => {
    getItem.mockImplementation(() => JSON.stringify(SingleFronting));
    const switcher = render(<IdentitySwitcher />, {
      wrapper: AuthWrapper,
    });
    expect(switcher.getByText(IDENTITY_01_NAME)).toBeTruthy();
    expect(switcher.getByText("Show More")).not.toBeVisible();
    expect(switcher.queryByText("No identities are active.")).toBeNull();
  });

  it("limits the number of identities displayed", async () => {
    const user = userEvent.setup();
    getItem.mockImplementation(() => JSON.stringify(ManyFronting));
    const switcher = render(<IdentitySwitcher />, {
      wrapper: AuthWrapper,
    });
    expect(switcher.getByText(IDENTITY_01_NAME)).toBeVisible();
    expect(switcher.queryByText(IDENTITY_10_NAME)).toBeNull();
    expect(switcher.getByText("Show More")).toBeVisible();

    await user.click(switcher.getByText("Show More"));

    expect(switcher.getByText("Show Less")).toBeVisible();
    expect(switcher.getByText(IDENTITY_01_NAME)).toBeVisible();
    expect(switcher.getByText(IDENTITY_10_NAME)).toBeVisible();

    await user.click(switcher.getByText("Show Less"));

    expect(switcher.getByText("Show More")).toBeVisible();
    expect(switcher.queryByText(IDENTITY_10_NAME)).toBeNull();
  });
});
