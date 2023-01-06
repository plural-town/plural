import { PluralTownRule, rulesFor } from "@plural-town/ability";
import { ReactNode } from "react";
import { AiFillDashboard, AiFillFileText, AiFillSetting } from "react-icons/ai";
import { FaArrowLeft, FaUsers } from "react-icons/fa";
import { AdminProvider, useAdminAbility } from "../admin-can/AdminCan";
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
  const ability = useAdminAbility();

  return (
    <AdminProvider rules={rules ?? rulesFor([])}>
      <SidebarLayout>
        <Sidebar brand={brand}>
          <SidebarItem text="Back to Site" icon={FaArrowLeft} />
          <SidebarItem text="Dashboard" icon={AiFillDashboard} />
          <SidebarItem
            text="Server Settings"
            icon={AiFillSetting}
            disabled={ability.cannot("browse", "AdminSiteSettings")}
          />
          <SidebarItem text="Accounts" icon={FaUsers}>
            <SidebarSubItem text="All Accounts" />
            <SidebarSubItem text="Registration" />
            <SidebarSubItem text="Invites" />
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
