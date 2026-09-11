import { Box, Flex, Image, Stack, Text } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutGrid, Wallet, ArrowLeftRight, User, FileText } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/portfolio", label: "Investment portfolio", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/profile", label: "My profile", icon: User },
  { to: "/reports", label: "Document Center", icon: FileText },
];

function NavItem({
  to,
  label,
  icon: IconCmp,
  end,
  active,
  iconSize,
}: {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  end?: boolean;
  active: boolean;
  iconSize: number;
}) {
  return (
    <NavLink to={to} end={end} aria-current={active ? "page" : undefined} style={{ textDecoration: "none", width: "100%" }}>
      <Flex
        position="relative"
        direction="column"
        align="center"
        justify="center"
        gap="6"
        px="8"
        py="14"
        color={active ? "brand.text.primaryDefault" : "neutral.text.subtle"}
        fontWeight="600"
        bg={active ? "brand.background.primarySubtle" : "transparent"}
        _hover={{ bg: active ? "brand.background.primarySubtle" : "neutral.surface.layer02", color: active ? "brand.text.primaryDefault" : "neutral.text.default" }}
        _focusVisible={{ outline: "2px solid", outlineColor: "brand.border.primaryDefault", outlineOffset: "-2px" }}
        transition="color 120ms ease, background 120ms ease"
      >
        {active && (
          <Box
            position="absolute"
            left="0"
            top="0"
            bottom="0"
            w="4px"
            bg="brand.background.primaryStrong"
            borderRightRadius="sm"
            aria-hidden
          />
        )}
        <IconCmp size={iconSize} aria-hidden focusable={false} />
        <Text fontSize="sm" textAlign="center" lineHeight="1.2">
          {label}
        </Text>
      </Flex>
    </NavLink>
  );
}

// Narrow icon-rail nav on desktop (icon stacked above a centered label),
// collapsing to a fixed bottom tab bar on mobile — matching the live
// prototype's behavior at both breakpoints exactly.
export default function Sidebar() {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const onEnrollment = pathname.startsWith("/enrollment");
  const onGoal = pathname.startsWith("/retirement-goal");
  const onSummary = pathname.startsWith("/account-summary");

  const isActive = (to: string, end?: boolean) => {
    if (end) return pathname === to || (to === "/" && (onEnrollment || onGoal || onSummary));
    return pathname.startsWith(to);
  };

  return (
    <>
      {/* Desktop rail — fixed to viewport (matches live), always covers left edge */}
      <Flex
        as="nav"
        aria-label="Primary"
        display={{ base: "none", md: "flex" }}
        direction="column"
        justify="space-between"
        w="sidebarRailWidth"
        flexShrink={0}
        py="20"
        bg="neutral.surface.layer01"
        borderRightWidth="1px"
        borderColor="neutral.border.subtle"
        position="fixed"
        top="{sizes.headerHeight}"
        left="0"
        bottom="0"
        h="calc(100dvh - {sizes.headerHeight})"
        zIndex="docked"
        overflowY="auto"
      >
        <Stack gap="4">
          {ITEMS.map((item) => (
            <NavItem key={item.to} {...item} active={isActive(item.to, item.end)} iconSize={23} />
          ))}
        </Stack>
        <Box aria-hidden textAlign="center" px="12" pb="16">
          <Image src={theme === "dark" ? "/core-logo-dark.svg" : "/core-logo.svg"} alt="" h="22px" mx="auto" />
        </Box>
      </Flex>
      {/* In-flow spacer so main content is offset by the fixed rail width */}
      <Box
        display={{ base: "none", md: "block" }}
        w="sidebarRailWidth"
        flexShrink={0}
        aria-hidden
      />

      {/* Mobile bottom tab bar */}
      <Flex
        as="nav"
        aria-label="Primary"
        display={{ base: "flex", md: "none" }}
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        bg="neutral.surface.layer01"
        borderTopWidth="1px"
        borderColor="neutral.border.subtle"
        zIndex="docked"
        pb="env(safe-area-inset-bottom)"
      >
        {ITEMS.map((item) => (
          <NavItem key={item.to} {...item} active={isActive(item.to, item.end)} iconSize={20} />
        ))}
      </Flex>
    </>
  );
}
