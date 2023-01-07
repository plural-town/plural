import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const helpers = createMultiStyleConfigHelpers([
  "container",
  "sidebar",
  "sidebarBrandFlex",
  "brandText",
  "sidebarItemContainer",
  "item",
  "itemDisabled",
  "itemIcon",
  "itemReadOnlyIcon",
  "main",
  "header",
  "page",
]);

export const SidebarLayout = helpers.defineMultiStyleConfig({
  baseStyle: {
    container: {
      minH: "100vh",
    },
    sidebar: {
      pos: "fixed",
      top: 0,
      left: 0,
      zIndex: "sticky",
      h: "full",
      pb: 10,
      overflowX: "hidden",
      overflowY: "auto",
      border: true,
      color: "inherit",
      borderRightWidth: "1px",
      w: "60",
    },
    sidebarBrandFlex: {
      px: 4,
      py: 5,
      align: "center",
    },
    brandText: {
      fontSize: "2xl",
      ml: 2,
      color: "brand.500",
      _dark: {
        color: "white",
      },
      fontWeight: "semibold",
    },
    sidebarItemContainer: {
      direction: "column",
      fontSize: "sm",
    },
    item: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 6,
      pl: 4,
      py: 3,
      cursor: "pointer",
      color: "inherit",
      fontWeight: "semibold",
      transition: ".15s ease",
    },
    itemDisabled: {
      display: "flex",
      alignItem: "center",
      justifyContent: "space-between",
      px: 4,
      pl: 4,
      py: 3,
      cursor: "not-allowed",
      fontWeight: "semibold",
      transition: ".15s ease",
    },
    itemIcon: {
      mx: 2,
      boxSize: 4,
    },
    main: {
      ml: {
        base: 0,
        md: 60,
      },
      transition: ".3s ease",
    },
    header: {
      alignItems: "center",
      justifyContent: "space-between",
      w: "full",
      px: 4,
      borderBottomWidth: "1px",
      color: "inherit",
      h: 14,
    },
    page: {
      p: 4,
    },
  },
  variants: {
    brand: {
      container: {
        bg: "gray.50",
        _dark: {
          bg: "gray.700",
        },
      },
      sidebar: {
        bg: "white",
        _dark: {
          bg: "gray.800",
        },
      },
      sidebarItemContainer: {
        color: "gray.600",
      },
      header: {
        bg: "white",
        _dark: {
          bg: "gray.800",
        },
      },
      item: {
        _dark: {
          color: "gray.400",
        },
        _hover: {
          bg: "gray.100",
          color: "gray.900",
          _dark: {
            bg: "gray.900",
          },
        },
      },
      itemDisabled: {
        color: "gray.400",
        _hover: {
          bg: "gray.50",
          color: "orange.300",
        },
      },
      itemIcon: {
        _groupHover: {
          color: "gray.600",
          _dark: {
            color: "gray.300",
          },
        },
      },
      itemReadOnlyIcon: {
        color: "gray.400",
      },
    },
  },
  defaultProps: {
    variant: "brand",
  },
});
