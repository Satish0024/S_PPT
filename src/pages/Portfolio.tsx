import { useEffect, useMemo, useState, Fragment } from "react";
import {
  Box,
  Flex,
  Heading,
  Table,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { FormSelect } from "../components/ui/form-select";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HOLDINGS, PLAN_FUNDS, PLAN_STATS, cumSeries, labelsFor, ENDS, money } from "../data/portfolio.js";
import { ASSET_CLASS_ORDER, resolveChartPalette } from "../lib/chartPalette.js";
import { formatMoney, planBalance } from "../lib/accountSummary.js";
import { useParticipant } from "../context/ParticipantContext";
import FundDetailDialog from "../components/common/FundDetailDialog";

function holdingsFromPlan(plan: any) {
  const investments = plan?.investments || [];
  if (!investments.length) return null;
  return investments.map((i: any) => ({
    name: i.name,
    asset: i.asset || "—",
    cusip: "—",
    returnPct: 0,
    invested: i.amount || 0,
    current: i.amount || 0,
    gain: 0,
    units: i.units || 0,
  }));
}

function statsFromPlan(plan: any) {
  const bal = planBalance(plan);
  const label = formatMoney(bal);
  return {
    label: plan.name,
    current: label,
    invested: label,
    gain: "$0.00",
    ret: "—",
  };
}

const PERIODS = ["1m", "3m", "6m", "ytd", "1y", "3y", "5y", "10y"];
const PERIOD_LABELS: Record<string, string> = {
  "1m": "1M", "3m": "3M", "6m": "6M", ytd: "YTD", "1y": "1Y", "3y": "3Y", "5y": "5Y", "10y": "10Y",
};

const SERIES_META = [
  { key: "total", label: "Total portfolio" },
  ...ASSET_CLASS_ORDER.map((label: string, i: number) => ({
    key: `ac-${i}`,
    label,
    endScale: [1, 0.78, 0.92, 1.08, 0.95, 0.34, 0.28, 0.41, 0.68, 0.55, 0.18][i],
    seed: 11 + i * 3,
  })),
];

const DEFAULT_VISIBLE = new Set(["total", "ac-0", "ac-5", "ac-8"]);

const COLS: Record<string, { key: string; type: "text" | "num" }> = {
  name: { key: "name", type: "text" },
  asset: { key: "asset", type: "text" },
  cusip: { key: "cusip", type: "text" },
  return: { key: "returnPct", type: "num" },
  invested: { key: "invested", type: "num" },
  current: { key: "current", type: "num" },
  gain: { key: "gain", type: "num" },
  units: { key: "units", type: "num" },
};

function SortIcon({ active, dir }: { active: boolean; dir: number }) {
  if (!active) return <ArrowUpDown size={12} opacity={0.4} />;
  return dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
}

function parsePct(value: string) {
  const n = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

export default function Portfolio() {
  const { participant } = useParticipant();
  const participantPlans = useMemo(
    () => (participant.plans || []).filter((p: any) => (p.investments || []).length > 0),
    [participant],
  );
  const useParticipantPlans = participantPlans.length > 0;

  const [tab, setTab] = useState("overview");
  const [openFund, setOpenFund] = useState<any>(null);
  const [period, setPeriod] = useState("1y");
  const [planId, setPlanId] = useState(() =>
    useParticipantPlans ? participantPlans[0].id : "lendguard-401k",
  );
  const [sort, setSort] = useState<{ key: string | null; dir: number }>({ key: null, dir: 1 });
  const [ytdDir, setYtdDir] = useState<number | null>(null);
  const [visible, setVisible] = useState(DEFAULT_VISIBLE);
  const chartPalette = useMemo(() => resolveChartPalette(), []);

  useEffect(() => {
    if (!useParticipantPlans) return;
    if (!participantPlans.some((p: any) => p.id === planId)) {
      setPlanId(participantPlans[0].id);
    }
  }, [useParticipantPlans, participantPlans, planId]);

  const selectedParticipantPlan = participantPlans.find((p: any) => p.id === planId);
  const plan =
    useParticipantPlans && selectedParticipantPlan
      ? statsFromPlan(selectedParticipantPlan)
      : (PLAN_STATS as Record<string, any>)[planId] || PLAN_STATS["lendguard-401k"];

  const holdings = useMemo(() => {
    const fromPlan = useParticipantPlans ? holdingsFromPlan(selectedParticipantPlan) : null;
    const rows = [...(fromPlan || HOLDINGS)];
    if (!sort.key) return rows;
    const col = COLS[sort.key];
    rows.sort((a: any, b: any) => {
      const av = a[col.key];
      const bv = b[col.key];
      if (col.type === "num") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv), undefined, { sensitivity: "base" }) * sort.dir;
    });
    return rows;
  }, [sort, useParticipantPlans, selectedParticipantPlan]);

  const planFunds = useMemo(() => {
    const rows = [...PLAN_FUNDS];
    if (!ytdDir) return rows;
    rows.sort((a: any, b: any) => (parsePct(a.ytd) - parsePct(b.ytd)) * ytdDir);
    return rows;
  }, [ytdDir]);

  const chartData = useMemo(() => {
    const ends = (ENDS as Record<string, any>)[period] || ENDS["1y"];
    const labs = labelsFor(period);
    const n = labs.length;
    const equity = cumSeries(n, ends.equity, 1);
    const bond = cumSeries(n, ends.bond, 4);
    const target = cumSeries(n, ends.target, 7);
    const total = equity.map((e: number, i: number) => Math.round((e * 0.64 + bond[i] * 0.23 + target[i] * 0.13) * 100) / 100);
    const dataByKey: Record<string, number[]> = { total, equity, bond, target };
    SERIES_META.forEach((s: any) => {
      if (dataByKey[s.key]) return;
      dataByKey[s.key] = cumSeries(n, ends.equity * (s.endScale ?? 0.7), s.seed ?? 9);
    });
    return labs.map((label: string, i: number) => {
      const row: Record<string, any> = { label };
      SERIES_META.forEach((s: any) => {
        row[s.key] = dataByKey[s.key][i];
      });
      return row;
    });
  }, [period]);

  const toggleSort = (key: string) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir * -1 } : { key, dir: 1 }));
  };

  const toggleYtd = () => setYtdDir((d) => (d === 1 ? -1 : 1));

  return (
    <>
      <Flex justify="space-between" align="center" wrap="wrap" gap="12" mb="16">
        <Heading as="h1" textStyle="h1" color="neutral.text.default">
          Investment portfolio
        </Heading>
        <FormSelect
          aria-label="Select plan"
          size="sm"
          width="auto"
          minW="planSelectMinW"
          value={planId}
          onChange={setPlanId}
          options={
            useParticipantPlans
              ? participantPlans.map((p: any) => ({ label: p.name, value: p.id }))
              : Object.entries(PLAN_STATS).map(([id, p]: any) => ({ label: p.label, value: id }))
          }
        />
      </Flex>

      <Tabs.Root value={tab} onValueChange={(d) => setTab(d.value)} variant="line">
        <Tabs.List>
          <Tabs.Trigger value="overview">My portfolio</Tabs.Trigger>
          <Tabs.Trigger value="investments">Plan investments</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          <Flex gap="16" align="stretch" wrap="wrap" mt="16">
            <Box as="aside" aria-label="Portfolio summary" w={{ base: "full", md: "280px" }} flexShrink={{ md: 0 }}>
              <Box
                bg="neutral.surface.layer01"
                borderWidth="1px"
                borderColor="neutral.border.subtle"
                borderRadius="xl"
                p="16"
                display="flex"
                flexDirection="column"
                gap="8"
              >
                <Box bg="neutral.surface.layer02" borderRadius="md" p="14">
                  <Text fontSize="xs" color="neutral.text.subtle" textTransform="uppercase" letterSpacing="wide">
                    Current balance
                  </Text>
                  <Text textStyle="display.lg" color="neutral.text.default">
                    {plan.current}
                  </Text>
                </Box>
                <Box bg="neutral.surface.layer02" borderRadius="md" px="14" py="12">
                  <Text fontSize="xs" color="neutral.text.subtle" textTransform="uppercase" letterSpacing="wide">
                    Invested balance
                  </Text>
                  <Text fontSize="lg" fontWeight="700" color="neutral.text.default">
                    {plan.invested}
                  </Text>
                </Box>
                <Box bg="neutral.surface.layer02" borderRadius="md" px="14" py="12">
                  <Text fontSize="xs" color="neutral.text.subtle" textTransform="uppercase" letterSpacing="wide">
                    Gain / loss
                  </Text>
                  <Text fontSize="lg" fontWeight="700" color="semantics.success.text">
                    {plan.gain}
                  </Text>
                </Box>
                <Box bg="neutral.surface.layer02" borderRadius="md" px="14" py="12">
                  <Text fontSize="xs" color="neutral.text.subtle" textTransform="uppercase" letterSpacing="wide">
                    Fund return YTD
                  </Text>
                  <Text fontSize="lg" fontWeight="700" color="semantics.success.text">
                    {plan.ret}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box
              flex="1"
              minW={{ base: "0", md: "320px" }}
              bg="neutral.surface.layer01"
              borderWidth="1px"
              borderColor="neutral.border.subtle"
              borderRadius="lg"
              p="16"
              boxShadow="elevation.01"
            >
              <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="12">
                Asset class performance
              </Heading>
              <Flex gap="4" wrap="wrap" mb="12">
                {PERIODS.map((p) => (
                  <Box
                    as="button"
                    key={p}
                    onClick={() => setPeriod(p)}
                    px="10"
                    py="4"
                    borderRadius="sm"
                    fontSize="xs"
                    fontWeight="600"
                    bg={period === p ? "brand.background.primaryStrong" : "neutral.surface.layer02"}
                    color={period === p ? "brand.text.primaryOncolor" : "neutral.text.subtle"}
                  >
                    {PERIOD_LABELS[p]}
                  </Box>
                ))}
              </Flex>
              <Box h="chartHeight">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--core-colors-neutral-border-default)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      label={{ value: "Time Period", position: "insideBottom", offset: -4, fontSize: 12, fontWeight: 600 }}
                      height={36}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      label={{ value: "Rate of return (%)", angle: -90, position: "insideLeft", fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip formatter={((v: number) => `${v.toFixed(2)}%`) as any} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {SERIES_META.filter((s) => visible.has(s.key)).map((s, i) => (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.label}
                        stroke={chartPalette[i % chartPalette.length]}
                        strokeWidth={s.key === "total" ? 2.5 : 2}
                        dot={{ r: 2 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Flex gap="8" wrap="wrap" mt="8">
                {SERIES_META.map((s, i) => (
                  <Box
                    as="button"
                    key={s.key}
                    onClick={() =>
                      setVisible((v) => {
                        const next = new Set(v);
                        next.has(s.key) ? next.delete(s.key) : next.add(s.key);
                        return next;
                      })
                    }
                    display="flex"
                    alignItems="center"
                    gap="4"
                    fontSize="xs"
                    px="6"
                    py="4"
                    borderRadius="sm"
                    opacity={visible.has(s.key) ? 1 : 0.4}
                    color="neutral.text.subtle"
                  >
                    <Box w="8px" h="8px" borderRadius="full" bg={chartPalette[i % chartPalette.length]} />
                    {s.label}
                  </Box>
                ))}
              </Flex>
            </Box>
          </Flex>

          <Box
            as="section"
            mt="24"
            bg="neutral.surface.layer01"
            borderWidth="1px"
            borderColor="neutral.border.subtle"
            borderRadius="lg"
            p="16"
            overflowX="auto"
            boxShadow="elevation.01"
          >
            <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="12">
              Investments
            </Heading>
            <Table.Root size="md" variant="line">
              <Table.Header>
                <Table.Row>
                  {[
                    ["name", "Investment name"],
                    ["asset", "Asset class"],
                    ["cusip", "CUSIP"],
                    ["return", "Fund return YTD"],
                    ["invested", "Invested balance"],
                    ["current", "Current balance"],
                    ["gain", "Gain/loss"],
                    ["units", "Unit balance"],
                  ].map(([key, label]) => (
                    <Table.ColumnHeader key={key} cursor="pointer" onClick={() => toggleSort(key)} whiteSpace="nowrap">
                      <Flex align="center" gap="4">
                        {label}
                        <SortIcon active={sort.key === key} dir={sort.dir} />
                      </Flex>
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {holdings.map((h: any, i: number) => (
                  <Table.Row key={`${h.name}-${h.cusip}-${i}`}>
                    <Table.Cell>
                      <Text as="button" color="brand.text.primaryDefault" fontWeight="600" onClick={() => setOpenFund(h)}>
                        {h.name}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>{h.asset}</Table.Cell>
                    <Table.Cell color="neutral.text.subtle">{h.cusip}</Table.Cell>
                    <Table.Cell color="semantics.success.text">{h.returnPct.toFixed(2)}%</Table.Cell>
                    <Table.Cell>{money(h.invested)}</Table.Cell>
                    <Table.Cell>{money(h.current)}</Table.Cell>
                    <Table.Cell color="semantics.success.text">+{money(h.gain).slice(1)}</Table.Cell>
                    <Table.Cell>{h.units.toFixed(2)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="investments">
          <Box
            as="section"
            mt="16"
            bg="neutral.surface.layer01"
            borderWidth="1px"
            borderColor="neutral.border.subtle"
            borderRadius="lg"
            p="16"
            overflowX="auto"
            boxShadow="elevation.01"
          >
            <Heading fontSize="base" fontWeight="700" color="neutral.text.default">
              Plan investments
            </Heading>
            <Text fontSize="sm" color="neutral.text.subtle" mb="12">
              Browse and compare the funds available within the retirement plan.
            </Text>
            <Table.Root size="md" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader rowSpan={2}>Fund name / category</Table.ColumnHeader>
                  <Table.ColumnHeader rowSpan={2} cursor="pointer" onClick={toggleYtd}>
                    <Flex align="center" gap="4">
                      Return YTD
                      <SortIcon active={!!ytdDir} dir={ytdDir || 1} />
                    </Flex>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader colSpan={4} textAlign="center">
                    Average annual total return
                  </Table.ColumnHeader>
                  <Table.ColumnHeader colSpan={2} textAlign="center">
                    Total annual operating expenses
                  </Table.ColumnHeader>
                  <Table.ColumnHeader rowSpan={2}>Shareholder-type fees</Table.ColumnHeader>
                </Table.Row>
                <Table.Row>
                  <Table.ColumnHeader>1 yr.</Table.ColumnHeader>
                  <Table.ColumnHeader>5 yr.</Table.ColumnHeader>
                  <Table.ColumnHeader>10 yr.</Table.ColumnHeader>
                  <Table.ColumnHeader>Since inception</Table.ColumnHeader>
                  <Table.ColumnHeader>As a %</Table.ColumnHeader>
                  <Table.ColumnHeader>Per $1,000</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {planFunds.map((f: any) => (
                  <Fragment key={f.name}>
                    <Table.Row>
                      <Table.Cell>
                        <Text as="button" color="brand.text.primaryDefault" fontWeight="600" onClick={() => setOpenFund(f)}>
                          {f.name}
                        </Text>
                        <Text fontSize="xs" color="neutral.text.subtle">
                          {f.cat}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{f.ytd}</Table.Cell>
                      <Table.Cell>{f.y1}</Table.Cell>
                      <Table.Cell>{f.y5}</Table.Cell>
                      <Table.Cell>{f.y10}</Table.Cell>
                      <Table.Cell>{f.si}</Table.Cell>
                      <Table.Cell>{f.exp}</Table.Cell>
                      <Table.Cell>{f.perK}</Table.Cell>
                      <Table.Cell>{f.fees}</Table.Cell>
                    </Table.Row>
                    <Table.Row bg="neutral.surface.layer02">
                      <Table.Cell fontSize="xs" color="neutral.text.subtle">
                        {f.bench}
                      </Table.Cell>
                      {f.b.map((v: string, i: number) => (
                        <Table.Cell key={`${f.name}-b-${i}`} fontSize="xs" color="neutral.text.subtle">
                          {v}
                        </Table.Cell>
                      ))}
                      <Table.Cell>—</Table.Cell>
                      <Table.Cell>—</Table.Cell>
                      <Table.Cell>N/A</Table.Cell>
                    </Table.Row>
                  </Fragment>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Tabs.Content>
      </Tabs.Root>

      {openFund && (
        <FundDetailDialog
          name={openFund.name}
          onClose={() => setOpenFund(null)}
          fields={[
            { label: "Asset class / category", value: openFund.asset || openFund.cat },
            { label: "CUSIP", value: openFund.cusip },
            { label: "Fund return YTD", value: openFund.returnPct != null ? `${openFund.returnPct.toFixed(2)}%` : openFund.ytd },
            { label: "Current balance", value: openFund.current != null ? money(openFund.current) : undefined },
            { label: "Unit balance", value: openFund.units != null ? openFund.units.toFixed(2) : undefined },
            { label: "1 yr. return", value: openFund.y1 },
            { label: "5 yr. return", value: openFund.y5 },
            { label: "10 yr. return", value: openFund.y10 },
            { label: "Total annual operating expenses", value: openFund.exp },
          ]}
        />
      )}
    </>
  );
}
