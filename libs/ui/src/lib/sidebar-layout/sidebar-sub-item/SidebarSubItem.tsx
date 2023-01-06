import SidebarItem, { SidebarItemProps } from "../sidebar-item/SidebarItem";

export function SidebarSubItem(props: Omit<SidebarItemProps, "pl" | "py">) {
  return <SidebarItem {...props} pl={12} py={2} />;
}

export default SidebarSubItem;
