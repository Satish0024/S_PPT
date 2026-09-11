import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { hasAdvanceElections, planEnrollmentStatus } from "../../data/participants.js";
import { useParticipant } from "../../context/ParticipantContext";

export function PlanStats({ stats }: { stats?: { balance: string; vested: string } }) {
  if (!stats) return null;
  return (
    <Flex gap={{ base: "16", md: "24" }} mt="12" wrap="wrap">
      <Stack gap="4">
        <Text fontSize="xs" color="neutral.text.subtle">
          Account balance
        </Text>
        <Text fontSize="base" fontWeight="600" color="neutral.text.default">
          {stats.balance}
        </Text>
      </Stack>
      <Stack gap="4">
        <Text fontSize="xs" color="neutral.text.subtle">
          Vested balance
        </Text>
        <Text fontSize="base" fontWeight="600" color="semantics.success.text">
          {stats.vested}
        </Text>
      </Stack>
    </Flex>
  );
}

function statusTokens(cls: string | undefined, status: string) {
  if (/eligible/i.test(status) && !/enrolled/i.test(status) && !/auto/i.test(status)) {
    return { bg: "brand.background.primarySubtle", text: "brand.text.primaryDefault", label: status || "Eligible" };
  }
  if (/not eligible/i.test(status) || cls === "muted") {
    return { bg: "neutral.surface.layer02", text: "neutral.text.subtle", label: status || "Not Eligible" };
  }
  if (/opted/i.test(status) || cls === "opted") {
    return { bg: "neutral.surface.layer02", text: "neutral.text.subtle", label: status || "Opted Out" };
  }
  if (cls === "eligible") {
    return { bg: "brand.background.primarySubtle", text: "brand.text.primaryDefault", label: status || "Eligible" };
  }
  return { bg: "semantics.success.backgroundLight", text: "semantics.success.text", label: status || "Participating" };
}

function noticeTokens(noticeClass: string | undefined) {
  if (noticeClass === "eligible-notice") return statusTokens("eligible", "Eligible");
  if (noticeClass === "ineligible-notice") return statusTokens("muted", "Not Eligible");
  if (noticeClass === "opted-notice") return statusTokens("opted", "Opted Out");
  return statusTokens(undefined, "Participating");
}

export default function PlanCard({ plan }: { plan: any }) {
  const { participant, sessionVersion } = useParticipant();
  // Re-read PLAN_STATUS_KEY after enroll / opt-out bumps sessionVersion.
  void sessionVersion;
  const status = planEnrollmentStatus(plan, participant.id);
  const badge = statusTokens(plan.badgeClass, status);
  const advanceSaved =
    plan.noticeLink?.label === "Provide elections in advance" && hasAdvanceElections(participant.id);
  const link = advanceSaved ? { label: "View Saved Details", details: true } : plan.noticeLink;
  const to = link?.details ? `/plans/${plan.id}` : link?.to;
  const isCashBalance = plan.type === "Cash Balance";

  return (
    <Box
      as="article"
      bg="neutral.surface.layer01"
      borderWidth="1px"
      borderColor="neutral.border.subtle"
      borderRadius="lg"
      p="16"
      boxShadow="elevation.01"
    >
      <Flex justify="space-between" align="flex-start" gap="8">
        <Stack gap="4">
          <Text fontSize="xl" fontWeight="700" color="neutral.text.default" letterSpacing="snug" lineHeight="xl">
            {plan.name}
          </Text>
          <Text fontSize="xs" color="brand.text.primaryDefault" fontWeight="600">
            {plan.type}
          </Text>
          <Text fontSize="xs" color="neutral.text.subtle">
            {plan.meta}
          </Text>
        </Stack>
        <Box
          fontSize="xs"
          fontWeight="600"
          px="8"
          py="4"
          borderRadius="full"
          bg={badge.bg}
          color={badge.text}
          whiteSpace="nowrap"
        >
          {badge.label}
        </Box>
      </Flex>

      {isCashBalance ? (
        <Text fontSize="sm" color="neutral.text.subtle" mt="12">
          Cash balance benefit is <b>{plan.cashBenefit}</b>. This is a notional value, tracked separately, and is
          removed from the account balances shown above.
        </Text>
      ) : (
        <>
          <Text
            fontSize="sm"
            mt="12"
            p="8"
            borderRadius="sm"
            bg={noticeTokens(plan.noticeClass).bg}
            color="neutral.text.subtle"
          >
            {plan.notice}{" "}
            {to && (
              <Box
                as={RouterLink}
                to={to}
                display="inline"
                textDecoration="underline"
                fontWeight="600"
                color="brand.text.primaryDefault"
              >
                {link.label}
              </Box>
            )}
          </Text>
          <PlanStats stats={plan.stats} />
        </>
      )}
    </Box>
  );
}
