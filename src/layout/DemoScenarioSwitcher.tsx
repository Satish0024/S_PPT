import { Avatar, Box, Button, Menu, Portal, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { useParticipant } from "../context/ParticipantContext";

// Prototype-only: switching between demo participants/scenarios. Kept
// separate from the real account menu so it reads as a demo control, tucked
// in a bottom corner rather than competing with real navigation.
export default function DemoScenarioSwitcher() {
  const { participant, participants, selectParticipant } = useParticipant();
  const navigate = useNavigate();

  return (
    <Box
      position="fixed"
      bottom={{ base: "calc({sizes.mobileNavOffset} + env(safe-area-inset-bottom))", md: "16" }}
      right="16"
      zIndex="popover"
    >
      <Menu.Root positioning={{ placement: "top-end" }}>
        <Menu.Trigger asChild>
          <Button size="sm" variant="solid" bg="neutral.surface.highContrast" color="neutral.text.onColor" borderRadius="full" boxShadow="elevation.02">
            <FlaskConical size={14} />
            Prototype demo
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="260px" maxH="320px" overflowY="auto">
              <Text px="12" py="6" fontSize="xs" textTransform="uppercase" color="neutral.text.subtle">
                Participants
              </Text>
              {participants.map((p: any) => (
                <Menu.Item
                  key={p.id}
                  value={p.id}
                  bg={p.id === participant.id ? "brand.background.primaryLight" : undefined}
                  onClick={() => {
                    selectParticipant(p.id);
                    navigate("/", { replace: true });
                  }}
                >
                  <Avatar.Root size="xs">
                    <Avatar.Image src={p.avatar} alt="" />
                    <Avatar.Fallback name={p.name} />
                  </Avatar.Root>
                  <Stack gap="0">
                    <Text fontSize="sm" fontWeight="600">
                      {p.name}
                    </Text>
                    <Text fontSize="xs" color="neutral.text.subtle">
                      {p.scenario}
                    </Text>
                  </Stack>
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  );
}
