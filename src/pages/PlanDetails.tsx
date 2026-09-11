import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Percent, LineChart } from "lucide-react";
import { useParticipant } from "../context/ParticipantContext";
import { formatMoney, planBalance, planVested } from "../lib/accountSummary.js";
import { INVESTMENT_KEY, markPlanStatus, planEnrollmentStatus } from "../data/participants.js";
import { readMap } from "../lib/retirementGoal.js";

const TABS = [
  { id: "deferrals", label: "Deferrals", icon: Percent },
  { id: "investments", label: "Investments", icon: LineChart },
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" py="10" borderBottomWidth="1px" borderColor="neutral.border.subtle" fontSize="sm">
      <Text color="neutral.text.subtle">{label}</Text>
      <Text fontWeight="700" color="neutral.text.default">
        {value}
      </Text>
    </Flex>
  );
}

function statusTokens(status: string) {
  if (/opted/i.test(status)) {
    return { bg: "neutral.surface.layer02", text: "neutral.text.subtle" };
  }
  if (/eligible/i.test(status) && !/enrolled/i.test(status) && !/auto/i.test(status)) {
    return { bg: "brand.background.primarySubtle", text: "brand.text.primaryDefault" };
  }
  if (/not eligible/i.test(status)) {
    return { bg: "neutral.surface.layer02", text: "neutral.text.subtle" };
  }
  return { bg: "semantics.success.backgroundLight", text: "semantics.success.text" };
}

export default function PlanDetails() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { participant, sessionVersion } = useParticipant();
  void sessionVersion;
  const [tab, setTab] = useState("deferrals");
  const plan = (participant.plans || []).find((p: any) => p.id === planId) || participant.plans?.[0];

  const savedAllocations = useMemo(() => {
    const map = readMap(INVESTMENT_KEY);
    return map[participant.id] || null;
  }, [participant.id, sessionVersion]);

  if (!plan) {
    return (
      <Text fontSize="sm" color="neutral.text.subtle">
        Plan not found.
      </Text>
    );
  }

  const status = planEnrollmentStatus(plan, participant.id);
  const badge = statusTokens(status || plan.badge || "");
  const totalSources = (plan.sources || []).reduce((s: number, x: any) => s + x.amount, 0);
  const totalInvestments = (plan.investments || []).reduce((s: number, x: any) => s + x.amount, 0);
  const electionRows =
    savedAllocations && typeof savedAllocations === "object"
      ? Object.entries(savedAllocations as Record<string, number>).filter(([, pct]) => (pct as number) > 0)
      : [];

  const handleOptOut = () => {
    markPlanStatus(plan.id, "Opted Out", participant.id);
    navigate("/");
  };

  return (
    <>
      <Flex as={RouterLink} to="/" align="center" gap="4" fontSize="sm" fontWeight="600" color="brand.text.primaryDefault" mb="8" w="fit-content">
        ‹ Your Plans
      </Flex>
      <Flex align="center" gap="12" mb="16" wrap="wrap">
        <Heading as="h1" textStyle="h1" color="neutral.text.default">
          {plan.name}
        </Heading>
        <Box fontSize="xs" fontWeight="600" px="8" py="2" borderRadius="full" bg={badge.bg} color={badge.text}>
          {status || plan.badge}
        </Box>
      </Flex>

      <Flex justify="space-between" align="center" wrap="wrap" gap="16" mb="16" p="16" bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg">
        <Box>
          <Text fontSize="xs" color="neutral.text.subtle" textTransform="uppercase">
            Plan Details
          </Text>
          <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
            {plan.type} · Plan ID {plan.meta?.match(/ID\s+(\S+)/i)?.[1] || plan.id}
          </Text>
          <Text fontSize="xs" color="neutral.text.subtle" mt="8">
            Company Name
          </Text>
          <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
            LendGuard
          </Text>
        </Box>
        <Flex gap="24">
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle">
              Account balance
            </Text>
            <Text fontSize="lg" fontWeight="700" color="neutral.text.default">
              {formatMoney(planBalance(plan))}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle">
              Vested balance
            </Text>
            <Text fontSize="lg" fontWeight="700" color="semantics.success.text">
              {formatMoney(planVested(plan))}
            </Text>
          </Box>
        </Flex>
      </Flex>

      <Flex gap="4" mb="16">
        {TABS.map((t) => {
          const IconCmp = t.icon;
          const active = tab === t.id;
          return (
            <Flex
              as="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              align="center"
              gap="8"
              px="16"
              py="10"
              borderRadius="md"
              bg={active ? "brand.background.primaryLight" : "transparent"}
              color={active ? "brand.text.primaryDefault" : "neutral.text.subtle"}
              fontWeight="600"
              fontSize="sm"
            >
              <IconCmp size={16} />
              {t.label}
            </Flex>
          );
        })}
      </Flex>

      <Box bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg" p="16" maxW="520px">
        {tab === "deferrals" ? (
          <>
            <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="8">
              Contribution sources
            </Heading>
            {(plan.sources || []).length ? (
              (plan.sources || []).map((s: any) => (
                <Row key={s.name} label={s.name} value={`${formatMoney(s.amount)} · ${totalSources ? ((s.amount / totalSources) * 100).toFixed(0) : 0}%`} />
              ))
            ) : (
              <Text fontSize="sm" color="neutral.text.subtle">
                No contribution sources on file for this plan.
              </Text>
            )}
          </>
        ) : (
          <>
            <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="4">
              Investments
            </Heading>
            <Text fontSize="xs" color="neutral.text.subtle" mb="8">
              {electionRows.length ? "Your investment elections" : "Plan investments · Current allocation by balance"}
            </Text>
            {electionRows.length ? (
              <>
                {electionRows.map(([name, pct]) => (
                  <Row key={name} label={name} value={`${pct}%`} />
                ))}
                <Flex justify="space-between" pt="12" fontSize="sm" fontWeight="700" color="neutral.text.default">
                  <Text>Total</Text>
                  <Text>100%</Text>
                </Flex>
              </>
            ) : (plan.investments || []).length ? (
              <>
                {(plan.investments || []).map((inv: any) => (
                  <Row key={inv.name} label={inv.name} value={`${totalInvestments ? ((inv.amount / totalInvestments) * 100).toFixed(0) : 0}%`} />
                ))}
                <Flex justify="space-between" pt="12" fontSize="sm" fontWeight="700" color="neutral.text.default">
                  <Text>Total</Text>
                  <Text>100%</Text>
                </Flex>
              </>
            ) : (
              <Text fontSize="sm" color="neutral.text.subtle">
                No investment elections on file for this plan.
              </Text>
            )}
          </>
        )}
      </Box>

      {!/opted/i.test(status || "") && (
        <Text as="button" mt="24" fontSize="sm" fontWeight="600" color="semantics.critical.text" onClick={handleOptOut}>
          Opt out of paycheck deferral
        </Text>
      )}
    </>
  );
}
