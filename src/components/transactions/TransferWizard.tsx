import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { FormSelect } from "../ui/form-select";
import { Field } from "../ui/field";
import { Radio, RadioGroup } from "../ui/radio";
import WizardShell from "./WizardShell";
import { formatMoney } from "../../data/transactions.js";
import { buildRequestRecord, saveTransactionRequest } from "../../lib/transactionRequests.js";

const STEPS = ["Funds", "Amount", "Summary"];

export default function TransferWizard({
  participant,
  plan,
}: {
  participant: any;
  plan: any;
}) {
  const navigate = useNavigate();
  const investments = plan.investments || [];
  const [step, setStep] = useState(0);
  const [fromId, setFromId] = useState(investments[0]?.name || "");
  const [toId, setToId] = useState(investments[1]?.name || investments[0]?.name || "");
  const [mode, setMode] = useState<"amount" | "percent">("amount");
  const [amount, setAmount] = useState("500");
  const [percent, setPercent] = useState("10");

  const fromFund = investments.find((i: any) => i.name === fromId);
  const toFund = investments.find((i: any) => i.name === toId);
  const fromBal = fromFund?.amount || 0;

  const transferAmount = useMemo(() => {
    if (mode === "percent") return Math.round(((Number(percent) || 0) / 100) * fromBal * 100) / 100;
    return Number(amount) || 0;
  }, [mode, amount, percent, fromBal]);

  const valid =
    !!fromId &&
    !!toId &&
    fromId !== toId &&
    transferAmount > 0 &&
    transferAmount <= fromBal;

  const canNext = step === 0 ? !!fromId && !!toId && fromId !== toId : step === 1 ? valid : true;

  const handleConfirm = () => {
    saveTransactionRequest(
      participant.id,
      buildRequestRecord({
        type: "transfer",
        typeLabel: "Transfer",
        plan,
        amount: transferAmount,
        extra: { from: fromId, to: toId, mode },
      }),
    );
    navigate("/transactions");
  };

  return (
    <WizardShell
      title="Transfer request"
      subtitle="Move money between investments in this plan."
      steps={STEPS}
      currentStep={step}
      planName={plan.name}
      onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
      onNext={step < STEPS.length - 1 ? () => setStep((s) => s + 1) : handleConfirm}
      nextLabel={step === STEPS.length - 1 ? "Confirm request" : "Continue"}
      nextDisabled={!canNext}
    >
      {step === 0 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Select funds
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Choose a source fund and a destination fund.
          </Text>
          <Field label="Transfer from" mb="20">
            <FormSelect
              value={fromId}
              onChange={setFromId}
              options={investments.map((i: any) => ({
                label: `${i.name} (${formatMoney(i.amount)})`,
                value: i.name,
              }))}
            />
          </Field>
          <Field label="Transfer to">
            <FormSelect
              value={toId}
              onChange={setToId}
              options={investments.map((i: any) => ({
                label: i.name,
                value: i.name,
                disabled: i.name === fromId,
              }))}
            />
          </Field>
          {fromId === toId && (
            <Text fontSize="xs" color="semantics.critical.text" mt="8">
              Source and destination must be different funds.
            </Text>
          )}
        </Box>
      )}

      {step === 1 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Transfer amount
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="16">
            Available in {fromFund?.name}: {formatMoney(fromBal)}
          </Text>
          <Field label="Enter by" mb="16">
            <RadioGroup value={mode} onValueChange={(d) => setMode((d.value as any) || "amount")}>
              <Flex gap="16">
                <Radio value="amount">Dollar amount</Radio>
                <Radio value="percent">Percent of fund</Radio>
              </Flex>
            </RadioGroup>
          </Field>
          {mode === "amount" ? (
            <Field label="Amount">
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
          ) : (
            <Field label="Percent">
              <Input type="number" min={0} max={100} value={percent} onChange={(e) => setPercent(e.target.value)} />
            </Field>
          )}
          <Box mt="16" p="12" borderRadius="md" bg="neutral.surface.layer02">
            <Text fontSize="sm">
              Transferring <Text as="span" fontWeight="700">{formatMoney(transferAmount)}</Text>
            </Text>
          </Box>
        </Box>
      )}

      {step === 2 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Review &amp; confirm
          </Heading>
          <Flex direction="column" gap="8" fontSize="sm">
            {[
              ["From", fromFund?.name],
              ["To", toFund?.name],
              ["Amount", formatMoney(transferAmount)],
            ].map(([k, v]) => (
              <Flex key={String(k)} justify="space-between" py="8" borderBottomWidth="1px" borderColor="neutral.border.subtle" gap="16">
                <Text color="neutral.text.subtle">{k}</Text>
                <Text fontWeight="600" textAlign="right">
                  {v}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}
    </WizardShell>
  );
}
