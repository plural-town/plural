import { extendTheme } from "@chakra-ui/react";
import { SidebarLayout } from "./components/sidebar-layout";

export const theme = extendTheme({
  components: {
    SidebarLayout,
  },
});

export default theme;
