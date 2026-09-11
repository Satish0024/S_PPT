import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { FormSelect } from "../ui/form-select";
import { Field } from "../ui/field";
import { Radio, RadioGroup } from "../ui/radio";
import WizardShell from "./WizardShell";
import {
  ROLLOVER_PAYMENT_MODES,
  ROLLOVER_PLAN_TYPES,
  ROLLOVER_SOURCES,
  formatMoney,
} from "../../data/transactions.js";
import { buildRequestRecord, saveTransactionRequest } from "../../lib/transactionRequests.js";

const STEPS = ["External plan", "Amount", "Summary"];

export default function RolloverWizard({
  participant,
  plan,
}: {
  participant: any;
  plan: any;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [planType, setPlanType] = useState("401k");
  const [institution, setInstitution] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("check");
  const [amount, setAmount] = useState("5000");
  const [source, setSource] = useState("pretax");

  const amountNum = Number(amount) || 0;
  const detailsValid = !!planType && institution.trim().length > 1;
  const amountValid = amountNum > 0;
  const canNext = step === 0 ? detailsValid : step === 1 ? amountValid && !!source : true;

  const handleConfirm = () => {
    saveTransactionRequest(
      participant.id,
      buildRequestRecord({
        type: "rollover",
        typeLabel: "Rollover",
        plan,
        amount: amountNum,
        extra: { planType, institution, accountNumber, paymentMode, source },
      }),
    );
    navigate("/transactions");
  };

  return (
    <WizardShell
      title="Rollover request"
      subtitle="Move money from a former employer plan or IRA into this plan."
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
            Distributing plan details
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Tell us about the external account sending the rollover.
          </Text>
          <Field label="Plan type" mb="16">
            <FormSelect
              value={planType}
              onChange={setPlanType}
              options={ROLLOVER_PLAN_TYPES.map((t: any) => ({ label: t.label, value: t.id }))}
            />
          </Field>
          <Field label="Institution / custodian" mb="16">
            <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Fidelity" />
          </Field>
          <Field label="Account number (optional)" mb="16">
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          </Field>
          <Field label="Payment mode">
            <RadioGroup value={paymentMode} onValueChange={(d) => setPaymentMode(d.value || "check")}>
              <Flex gap="16" wrap="wrap">
                {ROLLOVER_PAYMENT_MODES.map((m: any) => (
                  <Radio key={m.id} value={m.id}>
                    {m.label}
                  </Radio>
                ))}
              </Flex>
            </RadioGroup>
          </Field>
        </Box>
      )}

      {step === 1 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Rollover amount
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Enter the amount being rolled into this plan and the tax source.
          </Text>
          <Field label="Amount" mb="20">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Source">
            <RadioGroup value={source} onValueChange={(d) => setSource(d.value || "pretax")}>
              <Flex direction="column" gap="10">
                {ROLLOVER_SOURCES.map((s: any) => (
                  <Radio key={s.id} value={s.id}>
                    {s.label}
                  </Radio>
                ))}
              </Flex>
            </RadioGroup>
          </Field>
        </Box>
      )}

      {step === 2 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" mb="4">
            Review &amp; confirm
          </Heading>
          <Flex direction="column" gap="8" fontSize="sm">
            {[
              ["Plan type", ROLLOVER_PLAN_TYPES.find((t: any) => t.id === planType)?.label],
              ["Institution", institution],
              ["Account", accountNumber || "—"],
              ["Payment mode", ROLLOVER_PAYMENT_MODES.find((m: any) => m.id === paymentMode)?.label],
              ["Source", ROLLOVER_SOURCES.find((s: any) => s.id === source)?.label],
              ["Amount", formatMoney(amountNum)],
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
