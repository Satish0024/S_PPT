import { Avatar, Box, Flex, IconButton, Image, Menu, Portal, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Moon, Sun, KeyRound, LogOut, ChevronDown } from "lucide-react";
import { useParticipant } from "../context/ParticipantContext";
import { useTheme } from "../context/ThemeContext";
import { BRAND } from "../config/brand";

export default function Header() {
  const { participant, logout } = useParticipant();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      h="headerHeight"
      px={{ base: "16", md: "24" }}
      bg="neutral.surface.layer01"
      borderBottomWidth="1px"
      borderColor="neutral.border.subtle"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Image
        src={theme === "dark" ? BRAND.logoOnDark || BRAND.logo : BRAND.logo}
        alt={BRAND.name}
        h="logoHeight"
        maxW={{ base: "120px", md: "none" }}
      />

      <Flex align="center" gap="4">
        <IconButton
          asChild
          variant="ghost"
          size="sm"
          aria-label="Get help"
          title="Get help"
        >
          <a href={`mailto:${BRAND.supportEmail}`}>
            <HelpCircle size={19} />
          </a>
        </IconButton>

        <IconButton
          variant="ghost"
          size="sm"
          onClick={toggle}
          aria-pressed={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </IconButton>

        <Menu.Root>
          <Menu.Trigger asChild>
            {/* @ts-ignore — Flex `type` prop is valid for as="button" at runtime */}
            <Flex
              as="button"
              type="button"
              align="center"
              gap="8"
              px="8"
              py="4"
              borderRadius="full"
              cursor="pointer"
              bg="transparent"
              _hover={{ bg: "neutral.surface.layer02" }}
              aria-label={`Account menu for ${participant.name}`}
            >
              <Avatar.Root size="xs">
                <Avatar.Image src={participant.avatar} alt="" />
                <Avatar.Fallback name={participant.name} />
              </Avatar.Root>
              <Text fontSize="sm" fontWeight="600" color="neutral.text.default" display={{ base: "none", sm: "block" }}>
                {participant.name}
              </Text>
              <Box as="span" color="neutral.text.subtle" display={{ base: "none", sm: "inline-flex" }}>
                <ChevronDown size={14} />
              </Box>
            </Flex>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="220px">
                <Flex direction="column" px="12" py="8" gap="4">
                  <Text fontSize="xs" color="neutral.text.subtle" textTransform="uppercase">
                    Username
                  </Text>
                  <Text fontSize="sm" color="neutral.text.default">
                    {participant.profile?.email}
                  </Text>
                </Flex>
                <Menu.Separator />
                <Menu.Item value="change-password" onClick={() => navigate("/settings")}>
                  <KeyRound size={16} />
                  Change Password
                </Menu.Item>
                <Menu.Item
                  value="sign-out"
                  color="semantics.critical.text"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  <LogOut size={16} />
                  Log out
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  );
}
