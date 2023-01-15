import { abilityFor, PluralTownRule, rulesFor } from "@plural-town/ability";
import { ReactNode } from "react";
import { AiFillDashboard, AiFillFileText } from "react-icons/ai";
import { FaArrowLeft, FaUser, FaUsers } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { RiUserSharedLine } from "react-icons/ri";
import SidebarHeader from "../sidebar-layout/sidebar-header/SidebarHeader";
import SidebarItem from "../sidebar-layout/sidebar-item/SidebarItem";
import SidebarLayoutMain from "../sidebar-layout/sidebar-layout-main/SidebarLayoutMain";
import SidebarLayoutPage from "../sidebar-layout/sidebar-layout-page/SidebarLayoutPage";
import SidebarSectionHeading from "../sidebar-layout/sidebar-section-heading/SidebarSectionHeading";
import SidebarSubItem from "../sidebar-layout/sidebar-sub-item/SidebarSubItem";
import Sidebar from "../sidebar-layout/sidebar/Sidebar";
import SidebarLayout from "../sidebar-layout/SidebarLayout";
import { UserProvider } from "../user-can/UserCan";

type DashboardSection =
  | "account-identities"
  | "identity-grants"
  | "identity-profiles"
  | "profile-grants";

export interface DashboardLayoutProps {
  brand: string;
  rules?: PluralTownRule[];

  section?: DashboardSection;

  accountId?: string;

  identityId?: string;

  profileId?: string;

  children?: ReactNode;
}

export function DashboardLayout({
  brand,
  rules,
  accountId,
  identityId,
  section,
  children,
}: DashboardLayoutProps) {
  const ability = abilityFor(rules ?? rulesFor([], []));

  return (
    <UserProvider rules={rules ?? rulesFor([], [])}>
      <SidebarLayout>
        <Sidebar brand={brand}>
          <SidebarItem href="/" text="Back to Site" icon={FaArrowLeft} />
          <SidebarItem href="/account/accounts/" text="Accounts" icon={FaUser} />
          <SidebarItem href="/account/identities/" text="Identities" icon={FaUsers} />
          <SidebarItem href="/account/profiles/" text="Profiles" icon={AiFillFileText} />
          {accountId && (
            <>
              <SidebarSectionHeading>Account</SidebarSectionHeading>
              <SidebarItem
                href={`/account/accounts/${accountId}/`}
                text="Account Overview"
                icon={AiFillDashboard}
              />
              <SidebarItem
                href={`/account/accounts/${accountId}/auth/`}
                text="Authentication"
                icon={MdPassword}
              />
              <SidebarItem text="Identities" icon={FaUsers} open={section === "account-identities"}>
                <SidebarSubItem
                  href={`/account/accounts/${accountId}/identities/`}
                  text="Active Identities"
                />
                <SidebarSubItem
                  href={`/account/accounts/${accountId}/identities/pending/`}
                  text="Pending Requests"
                />
              </SidebarItem>
            </>
          )}
          {identityId && (
            <>
              <SidebarSectionHeading>Identity</SidebarSectionHeading>
              <SidebarItem
                href={`/account/identities/${identityId}/`}
                text="Identity Overview"
                icon={AiFillDashboard}
              />
              <SidebarItem
                href={`/account/identities/${identityId}/grants/`}
                text="Authorized Accounts"
                icon={RiUserSharedLine}
              />
              <SidebarItem text="Profiles" icon={AiFillFileText}>
                <SidebarSubItem
                  href={`/account/identities/${identityId}/profiles/`}
                  text="Current Profiles"
                />
                <SidebarSubItem
                  href={`/account/identities/${identityId}/profiles/pending/`}
                  text="Pending Requests"
                />
              </SidebarItem>
            </>
          )}
        </Sidebar>
        <SidebarLayoutMain>
          <SidebarHeader />
          <SidebarLayoutPage>{children}</SidebarLayoutPage>
        </SidebarLayoutMain>
      </SidebarLayout>
    </UserProvider>
  );
}

export default DashboardLayout;
