import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Table, Tabs, Text } from "@chakra-ui/react";
import { ArrowLeft, ChevronDown, ChevronRight, Database, Landmark } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useParticipant } from "../context/ParticipantContext";
import { formatMoney, formatPct, isSummaryPlan, planBalance, planVested, summaryForPlan } from "../lib/accountSummary.js";
import { Button } from "../components/ui/button";

function DonutChart({ rows, total }: { rows: any[]; total: number }) {
  return (
    <Box position="relative" w="donutChart" h="donutChart" mx="auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="pct" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={1} strokeWidth={0}>
            {rows.map((r) => (
              <Cell key={r.id} fill={r.color} />
            ))}
          </Pie>
          <Tooltip formatter={((v: number, n: string) => [`${v.toFixed(2)}%`, n]) as any} />
        </PieChart>
      </ResponsiveContainer>
      <Flex position="absolute" inset="0" direction="column" align="center" justify="center" pointerEvents="none">
        <Text fontSize="xs" color="neutral.text.subtle">
          Account balance
        </Text>
        <Text fontSize="base" fontWeight="700" color="neutral.text.default">
          {formatMoney(total)}
        </Text>
        <Text fontSize="xs" color="neutral.text.subtle">
          100.00%
        </Text>
      </Flex>
    </Box>
  );
}

function BreakdownTable({ rows }: { rows: any[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (!rows.length) {
    return (
      <Text fontSize="sm" color="neutral.text.subtle" py="16">
        No balance to show.
      </Text>
    );
  }

  return (
    <Box overflowX="auto">
      <Table.Root size="md" variant="line">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Source</Table.ColumnHeader>
            <Table.ColumnHeader>Balance</Table.ColumnHeader>
            <Table.ColumnHeader>Percent</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell>
                <Flex
                  as={row.items?.length ? "button" : "div"}
                  align="center"
                  gap="8"
                  onClick={() => row.items?.length && toggle(row.id)}
                >
                  {row.items?.length ? (
                    expanded.has(row.id) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )
                  ) : (
                    <Box w="14px" />
                  )}
                  <Box w="8px" h="8px" borderRadius="full" bg={row.color} flexShrink={0} />
                  {row.name}
                </Flex>
                {expanded.has(row.id) &&
                  row.items?.map((item: any) => (
                    <Flex key={item.name} justify="space-between" pl="30" py="4" fontSize="xs" color="neutral.text.subtle">
                      <Text>{item.name}</Text>
                      <Text>{formatMoney(item.amount)}</Text>
                    </Flex>
                  ))}
              </Table.Cell>
              <Table.Cell>{formatMoney(row.amount)}</Table.Cell>
              <Table.Cell>{formatPct(row.pct)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

export default function AccountSummary() {
  const navigate = useNavigate();
  const { participant } = useParticipant();
  const [tab, setTab] = useState<"sources" | "investments">("sources");
  const summaryPlans = useMemo(() => (participant.plans || []).filter(isSummaryPlan), [participant]);
  const [planId, setPlanId] = useState<string | undefined>(summaryPlans[0]?.id);
  const plan = summaryPlans.find((p: any) => p.id === planId) || summaryPlans[0];
  const summary = plan ? summaryForPlan(plan) : null;

  const rows = tab === "sources" ? summary?.sources : summary?.investments;

  return (
    <>
      <Button variant="ghost" color="brand.text.primaryDefault" mb="8" px="0" onClick={() => navigate("/")}>
        <ArrowLeft size={14} />
        Dashboard
      </Button>

      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="4">
        Account summary
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="16">
        View balances by sources or by investments
      </Text>

      {!summaryPlans.length ? (
        <Box
          bg="neutral.surface.layer01"
          borderWidth="1px"
          borderColor="neutral.border.subtle"
          borderRadius="lg"
          p="32"
          textAlign="center"
        >
          <Text fontSize="sm" color="neutral.text.subtle">
            You don't have any plans with a balance to summarize yet.
          </Text>
        </Box>
      ) : (
      <Flex gap="16" align="start" wrap="wrap">
        <Box flexShrink={{ md: 0 }} w={{ base: "full", md: "asidePanel" }} display="flex" flexDirection="column" gap="8">
          {summaryPlans.map((p: any) => (
            <Box
              as="button"
              key={p.id}
              onClick={() => setPlanId(p.id)}
              textAlign="left"
              p="16"
              borderRadius="lg"
              borderWidth="1px"
              borderColor={p.id === plan?.id ? "brand.border.primaryDefault" : "neutral.border.subtle"}
              bg={p.id === plan?.id ? "brand.background.primaryLight" : "neutral.surface.layer01"}
            >
              <Flex justify="space-between" align="flex-start" gap="8" mb="4">
                <Text fontSize="sm" fontWeight="700" color={p.id === plan?.id ? "brand.text.primaryDefault" : "neutral.text.default"}>
                  {p.name}
                </Text>
                <Box fontSize="xs" fontWeight="600" px="8" py="2" borderRadius="full" bg="semantics.success.backgroundLight" color="semantics.success.text" whiteSpace="nowrap">
                  {p.badge}
                </Box>
              </Flex>
              <Text fontSize="xs" color="neutral.text.subtle" mb="8">
                Plan ID {p.meta?.match(/ID\s+(\S+)/i)?.[1] || p.id} · Type {p.type}
              </Text>
              <Flex gap="16">
                <Box>
                  <Text fontSize="xs" color="neutral.text.subtle">
                    Account balance
                  </Text>
                  <Text fontSize="sm" fontWeight="700">
                    {formatMoney(planBalance(p))}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="neutral.text.subtle">
                    Vested balance
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color="semantics.success.text">
                    {formatMoney(planVested(p))}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Box>

        <Box flex="1" minW={{ base: "0", md: "320px" }} bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg" p="16">
          <Tabs.Root value={tab} onValueChange={(d) => setTab(d.value as any)} variant="line">
            <Tabs.List>
              <Tabs.Trigger value="sources">
                <Database size={14} /> Sources
              </Tabs.Trigger>
              <Tabs.Trigger value="investments">
                <Landmark size={14} /> Investments
              </Tabs.Trigger>
            </Tabs.List>
            <Box mt="16">
              {summary && rows && (
                <>
                  <DonutChart rows={rows} total={summary.balance} />
                  <Box mt="24">
                    <BreakdownTable rows={rows} />
                  </Box>
                </>
              )}
            </Box>
          </Tabs.Root>
        </Box>
      </Flex>
      )}
    </>
  );
}
