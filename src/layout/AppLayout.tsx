import { Box, Flex, Link } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import DemoScenarioSwitcher from "./DemoScenarioSwitcher";

export default function AppLayout() {
  return (
    <>
      <Link
        href="#main-content"
        position="absolute"
        left="-9999px"
        _focus={{ left: "8px", top: "8px", zIndex: "max", bg: "brand.background.primaryStrong", color: "brand.text.primaryOncolor", px: "12", py: "8", borderRadius: "sm" }}
      >
        Skip to main content
      </Link>
      <Header />
      <Flex align="stretch" minH="calc(100dvh - {sizes.headerHeight})">
        <Sidebar />
        {/* Footer lives in this column (right of the sidebar), not
            full-bleed under it — matches the live prototype's layout, where
            the footer's rect starts at the sidebar's right edge. */}
        <Flex direction="column" flex="1" minW="0" minH="calc(100dvh - {sizes.headerHeight})">
          <Box
            as="main"
            id="main-content"
            tabIndex={-1}
            flex="1"
            px={{ base: "16", md: "32" }}
            pt={{ base: "16", md: "24" }}
            pb={{ base: "mobileNavOffset", md: "48" }}
            bg="neutral.surface.layer02"
          >
            <Outlet />
          </Box>
          <Box display={{ base: "none", md: "block" }}>
            <Footer />
          </Box>
          <Box
            display={{ base: "block", md: "none" }}
            px="16"
            py="12"
            borderTopWidth="1px"
            borderColor="neutral.border.subtle"
            bg="neutral.surface.layer01"
            fontSize="xs"
            color="neutral.text.subtle"
            textAlign="center"
            pb="4"
          >
            <Flex as="nav" aria-label="Legal" justify="center" gap="16" mb="4">
              <Link href="#" color="brand.text.primaryDefault">Privacy</Link>
              <Link href="#" color="brand.text.primaryDefault">Terms</Link>
            </Flex>
          </Box>
        </Flex>
      </Flex>
      <DemoScenarioSwitcher />
    </>
  );
}
