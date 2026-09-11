import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../ui/button";

interface OverallBalanceProps {
  total: string;
  vested: string;
  loan?: string;
  cashBalance?: string;
  showSummary?: boolean;
}

export default function OverallBalance({ total, vested, loan, cashBalance, showSummary = true }: OverallBalanceProps) {
  return (
    <Box
      as="section"
      aria-label="Overall account balance"
      bg="neutral.surface.layer01"
      borderWidth="1px"
      borderColor="neutral.border.subtle"
      borderRadius="xl"
      px="24"
      py="20"
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap="16">
        <Flex gap={{ base: "24", md: "40" }} wrap="wrap" minW="0">
          <Stack gap="6" minW="0">
            <Text fontSize="sm" fontWeight="600" color="neutral.text.subtle">
              Account balance
            </Text>
            <Text textStyle="display.lg" color="neutral.text.default" fontVariantNumeric="tabular-nums">
              {total}
            </Text>
          </Stack>
          <Stack gap="6" minW="0">
            <Text fontSize="sm" fontWeight="600" color="neutral.text.subtle">
              Vested balance
            </Text>
            <Text textStyle="display.lg" color="semantics.success.text" fontVariantNumeric="tabular-nums">
              {vested}
            </Text>
          </Stack>
        </Flex>
        {showSummary && (
          <Button asChild variant="outline" size="sm">
            <RouterLink to="/account-summary">View summary</RouterLink>
          </Button>
        )}
      </Flex>

      {loan && (
        <Box mt="14" pt="14" borderTopWidth="1px" borderColor="neutral.border.subtle">
          <Flex align="baseline" gap="8" wrap="wrap">
            <Text fontSize="sm" fontWeight="600" color="neutral.text.subtle">
              Outstanding loan balance
            </Text>
            <Text fontSize="base" fontWeight="700" color="semantics.warning.text" fontVariantNumeric="tabular-nums">
              {loan}
            </Text>
          </Flex>
          <Text fontSize="xs" color="neutral.text.subtle" mt="6" lineHeight="1.45">
            This loan balance is tracked separately and is not reflected in the account balances shown above.
          </Text>
        </Box>
      )}

      {cashBalance && (
        <Box mt="14" pt="14" borderTopWidth="1px" borderColor="neutral.border.subtle">
          <Flex align="baseline" gap="8" wrap="wrap">
            <Text fontSize="sm" fontWeight="600" color="neutral.text.subtle">
              Cash balance benefit
            </Text>
            <Text fontSize="base" fontWeight="700" color="semantics.warning.text" fontVariantNumeric="tabular-nums">
              {cashBalance}
            </Text>
          </Flex>
          <Text fontSize="xs" color="neutral.text.subtle" mt="6" lineHeight="1.45">
            This is a notional value, tracked separately, and is removed from the account balances shown above.
          </Text>
        </Box>
      )}
    </Box>
  );
}
