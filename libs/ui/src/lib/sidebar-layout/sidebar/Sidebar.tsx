import { Drawer, DrawerContent, DrawerOverlay, DrawerProps, useDisclosure } from "@chakra-ui/react";
import SidebarContent, { SidebarContentProps } from "../sidebar-content/SidebarContent";

export interface SidebarProps extends Omit<SidebarContentProps, "display" | "w" | "borderRight"> {
  placement?: DrawerProps["placement"];
}

export function Sidebar({ placement, ...props }: SidebarProps) {
  const { isOpen, onClose } = useDisclosure();

  return (
    <>
      <SidebarContent
        {...props}
        display={{
          base: "none",
          md: "unset",
        }}
      />
      <Drawer isOpen={isOpen} onClose={onClose} placement={placement ?? "left"}>
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent {...props} w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Sidebar;
