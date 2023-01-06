import { abilityFor, PluralTownRule, rulesFor } from "@plural-town/ability";
import { ReactNode } from "react";
import { AiFillDashboard, AiFillFileText, AiFillSetting } from "react-icons/ai";
import { FaArrowLeft, FaUsers } from "react-icons/fa";
import { AdminProvider } from "../admin-can/AdminCan";
import SidebarHeader from "../sidebar-layout/sidebar-header/SidebarHeader";
import SidebarItem from "../sidebar-layout/sidebar-item/SidebarItem";
import SidebarLayoutMain from "../sidebar-layout/sidebar-layout-main/SidebarLayoutMain";
import SidebarLayoutPage from "../sidebar-layout/sidebar-layout-page/SidebarLayoutPage";
import SidebarSubItem from "../sidebar-layout/sidebar-sub-item/SidebarSubItem";
import Sidebar from "../sidebar-layout/sidebar/Sidebar";
import SidebarLayout from "../sidebar-layout/SidebarLayout";

export interface AdminLayoutProps {
  brand: string;
  rules?: PluralTownRule[];
  children?: ReactNode;
}

export function AdminLayout({ brand, rules, children }: AdminLayoutProps) {
  const ability = abilityFor(rules ?? rulesFor([]));

  return (
    <AdminProvider rules={rules ?? rulesFor([])}>
      <SidebarLayout>
        <Sidebar brand={brand}>
          <SidebarItem href="/" text="Back to Site" icon={FaArrowLeft} />
          <SidebarItem href="/admin/" text="Dashboard" icon={AiFillDashboard} />
          <SidebarItem
            href="/admin/site/"
            text="Server Settings"
            icon={AiFillSetting}
            disabled={ability.cannot("browse", "AdminDashboard", "siteSettings")}
            readonly={ability.cannot("update", "AdminDashboard", "siteSettings")}
          />
          <SidebarItem text="Accounts" icon={FaUsers}>
            <SidebarSubItem
              href="/admin/accounts/"
              text="All Accounts"
              disabled={ability.cannot("browse", "AdminDashboard", "accounts")}
              readonly={ability.cannot("browse", "AdminDashboard", "accounts")}
            />
            <SidebarSubItem
              text="Registration"
              disabled={ability.cannot("browse", "AdminDashboard", "regSettings")}
              readonly={ability.cannot("update", "AdminDashboard", "regSettings")}
            />
            <SidebarSubItem
              text="Invites"
              disabled={ability.cannot("browse", "AdminDashboard", "invitations")}
              readonly={ability.cannot("update", "AdminDashboard", "invitations")}
            />
          </SidebarItem>
          <SidebarItem text="Profiles" icon={AiFillFileText}>
            <SidebarSubItem text="All Profiles" />
          </SidebarItem>
        </Sidebar>
        <SidebarLayoutMain>
          <SidebarHeader />
          <SidebarLayoutPage>{children}</SidebarLayoutPage>
        </SidebarLayoutMain>
      </SidebarLayout>
    </AdminProvider>
  );
}

export default AdminLayout;
