import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface TxRow {
  date: string;
  type: string;
  plan: string;
  amt: string;
  kind?: string;
}

export default function Transactions({ rows }: { rows: TxRow[] }) {
  const navigate = useNavigate();
  return (
    <Box
      as="section"
      mt="24"
      bg="neutral.surface.layer01"
      borderWidth="1px"
      borderColor="neutral.border.subtle"
      borderRadius="lg"
      p="16"
      boxShadow="elevation.01"
    >
      <Flex justify="space-between" align="center" mb="12" gap="8" wrap="wrap">
        <Heading fontSize="base" fontWeight="700" color="neutral.text.default">
          Recent transactions
        </Heading>
        <Text
          as="button"
          fontSize="xs"
          fontWeight="700"
          color="brand.text.primaryDefault"
          onClick={() => navigate("/transactions")}
        >
          View all
        </Text>
      </Flex>
      {!rows?.length ? (
        <Text fontSize="sm" color="neutral.text.subtle">
          No transactions yet.
        </Text>
      ) : (
        rows.map((r, i) => (
          <Flex
            key={`${r.date}-${r.type}-${i}`}
            justify="space-between"
            align="center"
            py="10"
            borderTopWidth={i === 0 ? "0" : "1px"}
            borderColor="neutral.border.subtle"
            gap="12"
          >
            <Text fontSize="xs" color="neutral.text.subtle" flexShrink={0} w="72px">
              {r.date}
            </Text>
            <Box flex="1" minW="0">
              <Text fontSize="sm" fontWeight="600" color="neutral.text.default">
                {r.type}
              </Text>
              <Text fontSize="xs" color="neutral.text.subtle" truncate>
                {r.plan}
              </Text>
            </Box>
            <Text
              fontSize="sm"
              fontWeight="700"
              color={r.kind === "debit" ? "semantics.critical.text" : "semantics.success.text"}
              flexShrink={0}
            >
              {r.amt}
            </Text>
          </Flex>
        ))
      )}
    </Box>
  );
}
