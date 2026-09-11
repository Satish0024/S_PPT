import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Input, Text } from "@chakra-ui/react";
import WizardShell from "./WizardShell";
import { NAV_DISCLAIMER, computeBuySell, formatMoney } from "../../data/transactions.js";
import { buildRequestRecord, saveTransactionRequest } from "../../lib/transactionRequests.js";

const STEPS = ["Allocation", "Summary"];

function fundId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function RebalanceWizard({
  participant,
  plan,
}: {
  participant: any;
  plan: any;
}) {
  const navigate = useNavigate();
  const investments = plan.investments || [];
  const total = investments.reduce((s: number, i: any) => s + (i.amount || 0), 0);

  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    investments.forEach((i: any) => {
      map[fundId(i.name)] = total ? Math.round(((i.amount || 0) / total) * 1000) / 10 : 0;
    });
    // Normalize to 100
    const sum = Object.values(map).reduce((a, b) => a + b, 0);
    const first = Object.keys(map)[0];
    if (first && Math.abs(sum - 100) > 0.05) {
      map[first] = Math.round((map[first] + (100 - sum)) * 10) / 10;
    }
    return map;
  }, [investments, total]);

  const [step, setStep] = useState(0);
  const [targets, setTargets] = useState<Record<string, number>>(initial);

  const pctTotal = Object.values(targets).reduce((a, b) => a + (Number(b) || 0), 0);
  const pctOk = Math.abs(pctTotal - 100) < 0.05;

  const rows = investments.map((i: any) => {
    const id = fundId(i.name);
    const afterPct = Number(targets[id]) || 0;
    const afterAmount = Math.round(((afterPct / 100) * total) * 100) / 100;
    return {
      id,
      name: i.name,
      amount: i.amount || 0,
      pct: total ? Math.round(((i.amount || 0) / total) * 1000) / 10 : 0,
      afterPct,
      afterAmount,
      nav: i.price || 0,
    };
  });

  const buySell = computeBuySell(rows);

  const handleConfirm = () => {
    saveTransactionRequest(
      participant.id,
      buildRequestRecord({
        type: "rebalance",
        typeLabel: "Rebalance",
        plan,
        amount: buySell.totalAmount,
        extra: { targets, buyCount: buySell.buyCount, sellCount: buySell.sellCount },
      }),
    );
    navigate("/transactions");
  };

  return (
    <WizardShell
      title="Rebalance request"
      subtitle="Set target percentages for your investment lineup."
      steps={STEPS}
      currentStep={step}
      planName={plan.name}
      onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
      onNext={step < STEPS.length - 1 ? () => setStep((s) => s + 1) : handleConfirm}
      nextLabel={step === STEPS.length - 1 ? "Confirm request" : "Continue"}
      nextDisabled={step === 0 ? !pctOk : false}
    >
      {step === 0 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Target allocation
          </Heading>
          <Text fontSize="xs" color="neutral.text.subtle" mb="16">
            {NAV_DISCLAIMER}
          </Text>
          <Flex justify="space-between" mb="12" fontSize="sm">
            <Text color="neutral.text.subtle">Plan balance</Text>
            <Text fontWeight="700">{formatMoney(total)}</Text>
          </Flex>
          <Flex
            justify="space-between"
            mb="16"
            p="10"
            borderRadius="md"
            bg={pctOk ? "semantics.success.backgroundLight" : "semantics.warning.backgroundLight"}
            color={pctOk ? "semantics.success.text" : "semantics.warning.text"}
            fontSize="sm"
            fontWeight="700"
          >
            <Text>Total allocation</Text>
            <Text>{pctTotal.toFixed(1)}%</Text>
          </Flex>

          <Flex direction="column" gap="12">
            {rows.map((r: any) => (
              <Flex
                key={r.id}
                gap="12"
                align={{ base: "stretch", sm: "center" }}
                direction={{ base: "column", sm: "row" }}
                p="12"
                borderWidth="1px"
                borderColor="neutral.border.subtle"
                borderRadius="md"
              >
                <Box flex="1" minW="0">
                  <Text fontSize="sm" fontWeight="600" truncate>
                    {r.name}
                  </Text>
                  <Text fontSize="xs" color="neutral.text.subtle">
                    Current {r.pct}% · {formatMoney(r.amount)}
                  </Text>
                </Box>
                <Flex align="center" gap="8">
                  <Input
                    type="number"
                    w="88px"
                    value={targets[r.id] ?? 0}
                    min={0}
                    max={100}
                    step={0.1}
                    onChange={(e) =>
                      setTargets((prev) => ({
                        ...prev,
                        [r.id]: Number(e.target.value),
                      }))
                    }
                  />
                  <Text fontSize="sm" color="neutral.text.subtle">
                    %
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}

      {step === 1 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Review trades
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="16">
            {buySell.buyCount} buy(s) · {buySell.sellCount} sell(s) · {formatMoney(buySell.totalAmount)} total trade value
          </Text>
          {!buySell.trades.length ? (
            <Text fontSize="sm" color="neutral.text.subtle">
              No material trades — targets match current holdings.
            </Text>
          ) : (
            <Flex direction="column" gap="8">
              {buySell.trades.map((t: any) => (
                <Flex
                  key={t.id}
                  justify="space-between"
                  gap="12"
                  py="10"
                  borderBottomWidth="1px"
                  borderColor="neutral.border.subtle"
                  fontSize="sm"
                >
                  <Box minW="0">
                    <Text fontWeight="600" truncate>
                      {t.name}
                    </Text>
                    <Text
                      fontSize="xs"
                      color={t.action === "Buy" ? "semantics.success.text" : "semantics.critical.text"}
                    >
                      {t.action}
                    </Text>
                  </Box>
                  <Text fontWeight="700">{formatMoney(t.amount)}</Text>
                </Flex>
              ))}
            </Flex>
          )}
        </Box>
      )}
    </WizardShell>
  );
}
