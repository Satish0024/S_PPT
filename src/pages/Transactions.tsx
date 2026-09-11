import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Menu, Portal, Table, Tabs, Text } from "@chakra-ui/react";
import { FormSelect } from "../components/ui/form-select";
import { Plus, Landmark, ArrowDown, Shuffle, Scale, ArrowLeftRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useParticipant } from "../context/ParticipantContext";
import { formatMoney, planBalance, planVested } from "../lib/accountSummary.js";
import { TRANSACTION_TYPES, canRequest, requestStatusTone, transactablePlans } from "../data/transactions.js";
import { allRequestsFor } from "../lib/transactionRequests.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "deferral", label: "My Deferral" },
  { id: "employer", label: "Employer" },
  { id: "other", label: "Other" },
];

const TYPE_ICON: Record<string, typeof Landmark> = {
  loan: Landmark,
  withdrawal: ArrowDown,
  transfer: Shuffle,
  rebalance: Scale,
  rollover: ArrowLeftRight,
};

// requestStatusTone() returns good|ok|warn — map onto semantic token groups.
function statusColor(tone: string) {
  if (tone === "good" || tone === "success") return "semantics.success";
  if (tone === "warn" || tone === "warning") return "semantics.warning";
  if (tone === "critical") return "semantics.critical";
  // ok / highlight
  return "semantics.highlight";
}

function NewRequestMenu({ plan, disabled }: { plan: any; disabled: boolean }) {
  const navigate = useNavigate();
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button size="md" disabled={disabled || !plan} bg="brand.background.primaryStrong" color="brand.text.primaryOncolor" _hover={{ bg: "brand.background.primaryHover" }}>
          <Plus size={16} />
          New request
        </Button>
      </Menu.Trigger>
      {plan && (
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="280px">
              {TRANSACTION_TYPES.map((t: any) => {
                const IconCmp = TYPE_ICON[t.id];
                const enabled = canRequest(plan, t.id);
                return (
                  <Menu.Item
                    key={t.id}
                    value={t.id}
                    disabled={!enabled}
                    onClick={() => navigate(t.to(plan.id))}
                  >
                    <IconCmp size={16} />
                    <Box>
                      <Text fontSize="sm" fontWeight="700">
                        {t.label}
                      </Text>
                      <Text fontSize="xs" color="neutral.text.subtle">
                        {t.hint}
                      </Text>
                    </Box>
                  </Menu.Item>
                );
              })}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      )}
    </Menu.Root>
  );
}

function RequestsPanel({ participant, planId, onPlanChange }: { participant: any; planId?: string; onPlanChange: (id: string) => void }) {
  const plans = useMemo(() => transactablePlans(participant), [participant]);
  const plan = plans.find((p: any) => p.id === planId) || plans[0];
  const requests = useMemo(() => {
    const all = allRequestsFor(participant);
    if (!plan) return all;
    return all.filter((r: any) => r.plan === plan.name);
  }, [participant, plan]);

  if (!plans.length) {
    return (
      <Text fontSize="sm" color="neutral.text.subtle" py="24">
        You don't have a plan balance to raise a transaction request against yet.
      </Text>
    );
  }

  return (
    <>
      <Flex gap="8" wrap="wrap" mt="16" role="tablist" aria-label="Plan">
        {plans.map((p: any) => (
          <Box
            as="button"
            key={p.id}
            role="tab"
            aria-selected={p.id === plan.id}
            onClick={() => onPlanChange(p.id)}
            textAlign="left"
            px="12"
            py="10"
            borderRadius="md"
            borderWidth="1px"
            borderColor={p.id === plan.id ? "brand.border.primaryDefault" : "neutral.border.subtle"}
            bg={p.id === plan.id ? "brand.background.primaryLight" : "neutral.surface.layer01"}
          >
            <Text fontSize="xs" color="neutral.text.subtle">
              Plan ID {p.meta?.match(/ID\s+(\S+)/i)?.[1] || p.id}
            </Text>
            <Text fontSize="sm" fontWeight="600" color={p.id === plan.id ? "brand.text.primaryDefault" : "neutral.text.default"}>
              {p.name}
            </Text>
          </Box>
        ))}
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="16"
        mt="16"
        p="16"
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="lg"
      >
        <Box>
          <Text fontSize="xs" color="neutral.text.subtle" textTransform="uppercase">
            Plan details
          </Text>
          <Heading fontSize="lg" color="neutral.text.default">
            {plan.name}
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle">
            Plan ID {plan.meta?.match(/ID\s+(\S+)/i)?.[1] || plan.id} · Type {plan.type}
          </Text>
        </Box>
        <Flex gap="24">
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle">
              Plan balance
            </Text>
            <Text fontSize="base" fontWeight="700">
              {formatMoney(planBalance(plan))}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle">
              Vested balance
            </Text>
            <Text fontSize="base" fontWeight="700" color="semantics.success.text">
              {formatMoney(planVested(plan))}
            </Text>
          </Box>
        </Flex>
      </Flex>

      {!requests.length ? (
        <Text fontSize="sm" color="neutral.text.subtle" py="24">
          No transaction requests yet for this plan.
        </Text>
      ) : (
        <Box mt="16" overflowX="auto">
          <Text fontSize="xs" fontWeight="600" color="neutral.text.subtle" textTransform="uppercase" letterSpacing="wide" mb="8">
            Recent Requests
          </Text>
          <Table.Root size="md" variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Plan</Table.ColumnHeader>
                <Table.ColumnHeader>Date</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Amount</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {requests.map((r: any) => (
                <Table.Row key={r.id}>
                  <Table.Cell>{r.typeLabel}</Table.Cell>
                  <Table.Cell>{r.plan}</Table.Cell>
                  <Table.Cell>{r.date}</Table.Cell>
                  <Table.Cell>
                    <Box
                      as="span"
                      px="8"
                      py="2"
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                      bg={`${statusColor(requestStatusTone(r.status))}.backgroundLight`}
                      color={`${statusColor(requestStatusTone(r.status))}.text`}
                    >
                      {r.status}
                    </Box>
                  </Table.Cell>
                  <Table.Cell>{r.amount}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </>
  );
}

function HistoryPanel({ participant }: { participant: any }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [plan, setPlan] = useState("all");

  const plans = useMemo(() => [...new Set(participant.transactions.map((t: any) => t.plan))], [participant]);

  const rows = useMemo(() => {
    return participant.transactions.filter((t: any) => {
      const kindOk = filter === "all" || (filter === "other" ? !["deferral", "employer"].includes(t.kind) : t.kind === filter);
      const planOk = plan === "all" || t.plan === plan;
      return kindOk && planOk;
    });
  }, [participant, filter, plan]);

  return (
    <>
      <Flex
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        wrap="wrap"
        gap="12"
        mt="16"
      >
        <Flex gap="4" wrap="wrap" aria-label="Transaction type">
          {FILTERS.map((f) => (
            <Box
              as="button"
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              px="10"
              py="4"
              borderRadius="sm"
              fontSize="xs"
              fontWeight="600"
              bg={filter === f.id ? "brand.background.primaryStrong" : "neutral.surface.layer02"}
              color={filter === f.id ? "brand.text.primaryOncolor" : "neutral.text.subtle"}
            >
              {f.label}
            </Box>
          ))}
        </Flex>
        <Flex align="center" gap="12" wrap="wrap" direction={{ base: "column", sm: "row" }} alignItems={{ base: "stretch", sm: "center" }}>
          <FormSelect
            aria-label="Filter by plan"
            size="sm"
            width={{ base: "full", sm: "auto" }}
            minW={{ sm: "filterMinW" }}
            value={plan}
            onChange={setPlan}
            options={[
              { label: "All plans", value: "all" },
              ...plans.map((name) => ({ label: String(name), value: String(name) })),
            ]}
          />
          <Text as="button" fontSize="sm" fontWeight="600" color="brand.text.primaryDefault" onClick={() => navigate("/reports", { state: { openStatement: true } })}>
            Download periodic statement
          </Text>
        </Flex>
      </Flex>

      {!rows.length ? (
        <Text fontSize="sm" color="neutral.text.subtle" py="24">
          No transactions yet.
        </Text>
      ) : (
        <Box mt="16" overflowX="auto">
          <Table.Root size="md" variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Date</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Plan</Table.ColumnHeader>
                <Table.ColumnHeader>Amount</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((r: any, i: number) => (
                <Table.Row key={`${r.date}-${r.type}-${i}`}>
                  <Table.Cell>{r.date}</Table.Cell>
                  <Table.Cell>{r.type}</Table.Cell>
                  <Table.Cell>{r.plan}</Table.Cell>
                  <Table.Cell color={r.kind === "debit" ? "semantics.critical.text" : "semantics.success.text"} fontWeight="600">
                    {r.amt}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </>
  );
}

export default function Transactions() {
  const { participant } = useParticipant();
  const plans = useMemo(() => transactablePlans(participant), [participant]);
  const [tab, setTab] = useState("requests");
  const [planId, setPlanId] = useState<string | undefined>(plans[0]?.id);
  const plan = plans.find((p: any) => p.id === planId) || plans[0];

  useEffect(() => {
    if (!plans.length) return;
    if (!plans.some((p: any) => p.id === planId)) setPlanId(plans[0].id);
  }, [plans, planId]);

  return (
    <>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap="12" mb="16">
        <Box>
          <Heading as="h1" textStyle="h1" color="neutral.text.default">
            Transactions
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle">
            View, edit, and raise transaction requests
          </Text>
        </Box>
        <NewRequestMenu plan={plan} disabled={!plans.length} />
      </Flex>

      <Box bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg" p="16">
        <Tabs.Root value={tab} onValueChange={(d) => setTab(d.value)} variant="line">
          <Tabs.List>
            <Tabs.Trigger value="requests">Requests</Tabs.Trigger>
            <Tabs.Trigger value="history">History</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="requests">
            <RequestsPanel participant={participant} planId={plan?.id} onPlanChange={setPlanId} />
          </Tabs.Content>
          <Tabs.Content value="history">
            <HistoryPanel participant={participant} />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </>
  );
}
