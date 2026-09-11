import { Dialog, Portal, Stack, Flex, Text } from "@chakra-ui/react";
import { Button } from "../ui/button";

interface Field {
  label: string;
  value?: string | number;
}

interface FundDetailDialogProps {
  name: string;
  fields: Field[];
  onClose: () => void;
}

// Lightweight fund-info popup opened by clicking a hyperlinked investment
// name — used across Portfolio, Enrollment's Investment Election step, and
// the Transfer wizard.
export default function FundDetailDialog({ name, fields, onClose }: FundDetailDialogProps) {
  const visible = fields.filter((f) => f.value !== undefined && f.value !== null && f.value !== "");

  return (
    <Dialog.Root open onOpenChange={(d) => !d.open && onClose()} placement="center" size="sm">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title fontSize="base">{name}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="8">
                {visible.map((f) => (
                  <Flex key={f.label} justify="space-between" gap="16" fontSize="sm">
                    <Text color="neutral.text.subtle">{f.label}</Text>
                    <Text color="neutral.text.default" fontWeight="600" textAlign="right">
                      {f.value}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer justifyContent="center">
              <Button onClick={onClose} bg="brand.background.primaryStrong" color="brand.text.primaryOncolor" _hover={{ bg: "brand.background.primaryHover" }}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
