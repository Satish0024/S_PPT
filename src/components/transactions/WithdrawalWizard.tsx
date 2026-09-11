import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { FormSelect } from "../ui/form-select";
import { Field } from "../ui/field";
import { Radio, RadioGroup } from "../ui/radio";
import WizardShell from "./WizardShell";
import {
  BANK_ON_FILE,
  PAYMENT_METHODS,
  SOURCE_OPTIONS,
  WITHDRAWAL_TYPES,
  blankWithdrawalAllocation,
  computeWithdrawalFees,
  formatMoney,
  planVested,
} from "../../data/transactions.js";
import { buildRequestRecord, saveTransactionRequest } from "../../lib/transactionRequests.js";

const STEPS = ["Type", "Amount & source", "Payment", "Summary"];

export default function WithdrawalWizard({
  participant,
  plan,
}: {
  participant: any;
  plan: any;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const vested = planVested(plan);

  const [withdrawalType, setWithdrawalType] = useState("hardship");
  const [alloc, setAlloc] = useState(() =>
    blankWithdrawalAllocation({ amount: String(Math.min(1000, Math.floor(vested))) }),
  );

  const amountNum = Number(alloc.amount) || 0;
  const fees = useMemo(
    () => computeWithdrawalFees(amountNum, withdrawalType, alloc.paymentMethod),
    [amountNum, withdrawalType, alloc.paymentMethod],
  );

  const amountValid = amountNum > 0 && amountNum <= vested;
  const canNext =
    step === 0
      ? !!withdrawalType
      : step === 1
        ? amountValid && !!alloc.source
        : step === 2
          ? !!alloc.paymentMethod
          : true;

  const typeLabel = WITHDRAWAL_TYPES.find((t: any) => t.id === withdrawalType)?.label;

  const handleConfirm = () => {
    saveTransactionRequest(
      participant.id,
      buildRequestRecord({
        type: "withdrawal",
        typeLabel: "Withdrawal",
        plan,
        amount: amountNum,
        extra: { withdrawalType, paymentMethod: alloc.paymentMethod, source: alloc.source },
      }),
    );
    navigate("/transactions");
  };

  const patch = (p: Partial<typeof alloc>) => setAlloc((a: any) => ({ ...a, ...p }));

  return (
    <WizardShell
      title="Withdrawal request"
      subtitle="Taxes and penalties may apply depending on the withdrawal type."
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
            Withdrawal type
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Available vested balance: {formatMoney(vested)}
          </Text>
          <RadioGroup value={withdrawalType} onValueChange={(d) => setWithdrawalType(d.value || "hardship")}>
            <Flex direction="column" gap="10">
              {WITHDRAWAL_TYPES.map((t: any) => (
                <Box
                  key={t.id}
                  p="12"
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={withdrawalType === t.id ? "brand.border.primaryDefault" : "neutral.border.subtle"}
                  bg={withdrawalType === t.id ? "brand.background.primaryLight" : "neutral.surface.layer01"}
                >
                  <Radio value={t.id}>
                    <Box>
                      <Text fontWeight="700" fontSize="sm">
                        {t.label}
                      </Text>
                      <Text fontSize="xs" color="neutral.text.subtle">
                        {t.penaltyPct > 0
                          ? `May include a ${t.penaltyPct}% early withdrawal penalty.`
                          : "No early withdrawal penalty for this type."}
                      </Text>
                    </Box>
                  </Radio>
                </Box>
              ))}
            </Flex>
          </RadioGroup>
        </Box>
      )}

      {step === 1 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Amount &amp; source
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Enter the net amount you want to receive and how sources should be drawn.
          </Text>
          <Field label="Net amount" mb="20" errorText={!amountValid && alloc.amount ? `Must be between $0.01 and ${formatMoney(vested)}` : undefined}>
            <Input
              type="number"
              value={alloc.amount}
              onChange={(e) => patch({ amount: e.target.value })}
            />
          </Field>
          <Field label="Source selection">
            <FormSelect
              value={alloc.source}
              onChange={(v) => patch({ source: v })}
              options={SOURCE_OPTIONS.map((o: any) => ({ label: o.label, value: o.id }))}
            />
          </Field>
        </Box>
      )}

      {step === 2 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Payment method
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Choose how you want to receive this distribution.
          </Text>
          <Field label="Payment method" mb="24">
            <RadioGroup
              value={alloc.paymentMethod}
              onValueChange={(d) => patch({ paymentMethod: d.value || "check" })}
            >
              <Flex direction="column" gap="10">
                {PAYMENT_METHODS.map((m: any) => (
                  <Radio key={m.id} value={m.id}>
                    {m.label}
                  </Radio>
                ))}
              </Flex>
            </RadioGroup>
          </Field>

          {alloc.paymentMethod === "eft" && (
            <Box
              mb="24"
              p="16"
              borderWidth="1px"
              borderColor="brand.border.primaryDefault"
              borderRadius="md"
              bg="brand.background.primaryLight"
            >
              <Text fontSize="xs" fontWeight="700" color="brand.text.primaryDefault" mb="12" textTransform="uppercase">
                Bank on file
              </Text>
              <Text fontSize="sm">
                {BANK_ON_FILE.bankName} · {BANK_ON_FILE.accountNumber}
              </Text>
            </Box>
          )}

          <Box borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="md" overflow="hidden">
            <Box px="16" py="10" bg="neutral.surface.layer02">
              <Text fontSize="sm" fontWeight="700">
                Fee &amp; tax estimate
              </Text>
            </Box>
            {[
              ["Net distribution", formatMoney(fees.netDistribution)],
              ["Fee & tax", formatMoney(fees.feeAndTax)],
              ["Redemption fee", formatMoney(fees.redemptionFee)],
              ["Penalty", formatMoney(fees.penalty)],
              ["Gross from plan", formatMoney(fees.grossAmount)],
            ].map(([label, value]) => (
              <Flex key={String(label)} justify="space-between" px="16" py="10" borderTopWidth="1px" borderColor="neutral.border.subtle" fontSize="sm">
                <Text color="neutral.text.subtle">{label}</Text>
                <Text fontWeight="600">{value}</Text>
              </Flex>
            ))}
          </Box>
        </Box>
      )}

      {step === 3 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Review &amp; confirm
          </Heading>
          <Flex direction="column" gap="8" fontSize="sm">
            {[
              ["Type", typeLabel],
              ["Net amount", formatMoney(amountNum)],
              ["Source", SOURCE_OPTIONS.find((o: any) => o.id === alloc.source)?.label],
              ["Payment", PAYMENT_METHODS.find((m: any) => m.id === alloc.paymentMethod)?.label],
              ["Gross from plan", formatMoney(fees.grossAmount)],
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
