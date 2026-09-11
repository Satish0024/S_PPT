import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { FormSelect } from "../ui/form-select";
import { FileUp, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Radio, RadioGroup } from "../ui/radio";
import WizardShell from "./WizardShell";
import {
  BANK_ON_FILE,
  LOAN_INTEREST_RATE,
  LOAN_PAYMENT_METHODS,
  LOAN_REPAYMENT_FREQUENCIES,
  LOAN_REPAYMENT_METHODS,
  LOAN_TERMS_COPY,
  LOAN_TYPES,
  REQUEST_DOC_REQUIREMENTS,
  SPOUSAL_CONSENT_DOC,
  activeLoanFor,
  computeGrossLoanAmount,
  estimatePeriodicPayment,
  formatMoney,
  loanLimits,
} from "../../data/transactions.js";
import { buildRequestRecord, saveTransactionRequest } from "../../lib/transactionRequests.js";

const STEPS = ["Details", "Payment & fees", "Documents", "Summary"];

interface UploadedDoc {
  id: string;
  label: string;
  fileName: string;
}

export default function LoanWizard({
  participant,
  plan,
}: {
  participant: any;
  plan: any;
}) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const outstanding = activeLoanFor(participant, plan)?.balance || 0;
  const limits = useMemo(() => loanLimits(plan, outstanding), [plan, outstanding]);

  const [loanType, setLoanType] = useState("personal");
  const [amount, setAmount] = useState(String(Math.min(Math.max(limits.min || 300, 2500), limits.max || 2500)));
  const [years, setYears] = useState(3);
  const [months, setMonths] = useState(0);
  const [repaymentMethod, setRepaymentMethod] = useState("payroll");
  const [repaymentFrequency, setRepaymentFrequency] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("eft");
  const [maritalStatus, setMaritalStatus] = useState("single");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);

  const selectedType = LOAN_TYPES.find((t: any) => t.id === loanType) || LOAN_TYPES[0];
  const maxYears = selectedType.maxYears;
  const amountNum = Number(amount) || 0;
  const fees = computeGrossLoanAmount(amountNum);
  const periodic = estimatePeriodicPayment(amountNum, years, months, LOAN_INTEREST_RATE);

  const requiredDocs = useMemo(() => {
    const base = [...(REQUEST_DOC_REQUIREMENTS.loan || [])];
    if (maritalStatus === "married") base.push(SPOUSAL_CONSENT_DOC);
    return base;
  }, [maritalStatus]);

  const amountValid = amountNum >= limits.min && amountNum <= limits.max && limits.max > 0;
  const termValid = years * 12 + months >= 1 && years <= maxYears;
  const docsComplete = requiredDocs.every((d: any) => docs.some((u) => u.id === d.id));

  const canNext =
    step === 0
      ? amountValid && termValid && !!loanType && !!repaymentMethod && !!repaymentFrequency
      : step === 1
        ? !!paymentMethod
        : step === 2
          ? docsComplete
          : termsAccepted;

  const onUploadClick = (docId: string) => {
    setUploadingDocId(docId);
    fileRef.current?.click();
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingDocId) return;
    const meta = requiredDocs.find((d: any) => d.id === uploadingDocId);
    setDocs((prev) => [
      ...prev.filter((d) => d.id !== uploadingDocId),
      { id: uploadingDocId, label: meta?.label || uploadingDocId, fileName: file.name },
    ]);
    setUploadingDocId(null);
    e.target.value = "";
  };

  const handleConfirm = () => {
    saveTransactionRequest(
      participant.id,
      buildRequestRecord({
        type: "loan",
        typeLabel: "Loan",
        plan,
        amount: amountNum,
        extra: {
          loanType,
          years,
          months,
          repaymentMethod,
          repaymentFrequency,
          paymentMethod,
          balance: amountNum,
          monthlyPayment: periodic,
        },
      }),
    );
    navigate("/transactions");
  };

  return (
    <WizardShell
      title="Loan request"
      subtitle="Borrow from your vested balance. Interest applies."
      steps={STEPS}
      currentStep={step}
      planName={plan.name}
      onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
      onNext={
        step < STEPS.length - 1
          ? () => setStep((s) => s + 1)
          : handleConfirm
      }
      nextLabel={step === STEPS.length - 1 ? "Confirm request" : "Continue"}
      nextDisabled={!canNext}
    >
      <input ref={fileRef} type="file" hidden onChange={onFileChange} />

      {step === 0 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" color="neutral.text.default" mb="4">
            Loan details
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Eligible amount: {formatMoney(limits.min)} – {formatMoney(limits.max)}
            {outstanding > 0 ? ` (outstanding loan ${formatMoney(outstanding)} applied)` : ""}
          </Text>

          <Field label="Loan type" mb="20">
            <RadioGroup
              value={loanType}
              onValueChange={(d) => {
                setLoanType(d.value || "personal");
                const maxY = LOAN_TYPES.find((t: any) => t.id === d.value)?.maxYears || 5;
                if (years > maxY) setYears(maxY);
              }}
            >
              <Flex direction="column" gap="10">
                {LOAN_TYPES.map((t: any) => (
                  <Box
                    key={t.id}
                    p="12"
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={loanType === t.id ? "brand.border.primaryDefault" : "neutral.border.subtle"}
                    bg={loanType === t.id ? "brand.background.primaryLight" : "neutral.surface.layer01"}
                  >
                    <Radio value={t.id}>
                      <Box>
                        <Text fontWeight="700" fontSize="sm">
                          {t.label}
                        </Text>
                        <Text fontSize="xs" color="neutral.text.subtle">
                          {t.hint}
                        </Text>
                      </Box>
                    </Radio>
                  </Box>
                ))}
              </Flex>
            </RadioGroup>
          </Field>

          <Field
            label="Loan amount"
            mb="20"
            errorText={!amountValid && amount ? `Enter an amount between ${formatMoney(limits.min)} and ${formatMoney(limits.max)}` : undefined}
          >
            <Input
              type="number"
              value={amount}
              min={limits.min}
              max={limits.max}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <Flex gap="12" mb="20" direction={{ base: "column", sm: "row" }}>
            <Field label="Term (years)" flex="1">
              <FormSelect
                value={String(years)}
                onChange={(v) => setYears(Number(v))}
                options={Array.from({ length: maxYears + 1 }, (_, i) => ({
                  label: String(i),
                  value: String(i),
                }))}
              />
            </Field>
            <Field label="Term (months)" flex="1">
              <FormSelect
                value={String(months)}
                onChange={(v) => setMonths(Number(v))}
                options={Array.from({ length: 12 }, (_, i) => ({
                  label: String(i),
                  value: String(i),
                }))}
              />
            </Field>
          </Flex>

          <Field label="Repayment method" mb="20">
            <RadioGroup value={repaymentMethod} onValueChange={(d) => setRepaymentMethod(d.value || "payroll")}>
              <Flex direction="column" gap="8">
                {LOAN_REPAYMENT_METHODS.map((m: any) => (
                  <Radio key={m.id} value={m.id}>
                    <Box>
                      <Text fontSize="sm" fontWeight="600">
                        {m.label}
                      </Text>
                      <Text fontSize="xs" color="neutral.text.subtle">
                        {m.hint}
                      </Text>
                    </Box>
                  </Radio>
                ))}
              </Flex>
            </RadioGroup>
          </Field>

          <Field label="Repayment frequency" mb="20">
            <FormSelect
              value={repaymentFrequency}
              onChange={setRepaymentFrequency}
              options={LOAN_REPAYMENT_FREQUENCIES.map((f: any) => ({ label: f.label, value: f.id }))}
            />
          </Field>

          <Field label="Marital status" mb="8">
            <RadioGroup value={maritalStatus} onValueChange={(d) => setMaritalStatus(d.value || "single")}>
              <Flex gap="16" wrap="wrap">
                <Radio value="single">Single</Radio>
                <Radio value="married">Married</Radio>
              </Flex>
            </RadioGroup>
          </Field>

          <Box
            mt="20"
            p="16"
            borderRadius="md"
            bg="neutral.surface.layer02"
            borderWidth="1px"
            borderColor="neutral.border.subtle"
          >
            <Text fontSize="xs" color="neutral.text.subtle" mb="4">
              Estimated {LOAN_REPAYMENT_FREQUENCIES.find((f: any) => f.id === repaymentFrequency)?.label.toLowerCase()} payment
            </Text>
            <Text fontSize="xl" fontWeight="800" color="neutral.text.default">
              {formatMoney(periodic)}
            </Text>
            <Text fontSize="xs" color="neutral.text.subtle" mt="4">
              At {LOAN_INTEREST_RATE}% APR over {years}y {months}m
            </Text>
          </Box>
        </Box>
      )}

      {step === 1 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" color="neutral.text.default" mb="4">
            Payment &amp; fee details
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Choose how loan proceeds are disbursed. Fees are added so you still net your requested amount.
          </Text>

          <Field label="Payment method" mb="24">
            <RadioGroup value={paymentMethod} onValueChange={(d) => setPaymentMethod(d.value || "eft")}>
              <Flex direction="column" gap="10">
                {LOAN_PAYMENT_METHODS.map((m: any) => (
                  <Radio key={m.id} value={m.id}>
                    {m.label}
                  </Radio>
                ))}
              </Flex>
            </RadioGroup>
          </Field>

          {paymentMethod === "eft" && (
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
              <Flex direction="column" gap="6" fontSize="sm">
                <Flex justify="space-between" gap="12">
                  <Text color="neutral.text.subtle">Account holder</Text>
                  <Text fontWeight="600">{BANK_ON_FILE.accountHolder}</Text>
                </Flex>
                <Flex justify="space-between" gap="12">
                  <Text color="neutral.text.subtle">Bank name</Text>
                  <Text fontWeight="600">{BANK_ON_FILE.bankName}</Text>
                </Flex>
                <Flex justify="space-between" gap="12">
                  <Text color="neutral.text.subtle">Routing no.</Text>
                  <Text fontWeight="600">{BANK_ON_FILE.routingNo}</Text>
                </Flex>
                <Flex justify="space-between" gap="12">
                  <Text color="neutral.text.subtle">Account no.</Text>
                  <Text fontWeight="600">{BANK_ON_FILE.accountNumber}</Text>
                </Flex>
              </Flex>
            </Box>
          )}

          <Box borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="md" overflow="hidden">
            <Box px="16" py="10" bg="neutral.surface.layer02">
              <Text fontSize="sm" fontWeight="700">
                Fee breakdown
              </Text>
            </Box>
            <Flex direction="column" gap="0" fontSize="sm">
              {[
                ["Requested amount", formatMoney(fees.requested)],
                ["Transaction fee", formatMoney(fees.transactionFee)],
                ["Redemption fee", formatMoney(fees.redemptionFee)],
              ].map(([label, value]) => (
                <Flex key={String(label)} justify="space-between" px="16" py="10" borderTopWidth="1px" borderColor="neutral.border.subtle">
                  <Text color="neutral.text.subtle">{label}</Text>
                  <Text fontWeight="600">{value}</Text>
                </Flex>
              ))}
              <Flex
                justify="space-between"
                px="16"
                py="12"
                borderTopWidth="1px"
                borderColor="neutral.border.subtle"
                bg="neutral.surface.layer02"
              >
                <Text fontWeight="700">Gross amount from plan</Text>
                <Text fontWeight="800">{formatMoney(fees.grossAmount)}</Text>
              </Flex>
            </Flex>
          </Box>
        </Box>
      )}

      {step === 2 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" color="neutral.text.default" mb="4">
            Upload documents
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Attach the required documents to continue. Files stay in this session only.
          </Text>

          <Flex direction="column" gap="12">
            {requiredDocs.map((doc: any) => {
              const uploaded = docs.find((d) => d.id === doc.id);
              return (
                <Flex
                  key={doc.id}
                  align={{ base: "stretch", sm: "center" }}
                  justify="space-between"
                  gap="12"
                  p="16"
                  borderWidth="1px"
                  borderColor={uploaded ? "semantics.success.border" : "neutral.border.subtle"}
                  borderRadius="md"
                  direction={{ base: "column", sm: "row" }}
                >
                  <Box>
                    <Text fontSize="sm" fontWeight="700">
                      {doc.label}
                      {doc.required ? " *" : ""}
                    </Text>
                    <Text fontSize="xs" color="neutral.text.subtle">
                      {uploaded ? uploaded.fileName : "No file uploaded"}
                    </Text>
                  </Box>
                  <Flex gap="8">
                    {uploaded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        color="semantics.critical.text"
                        onClick={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => onUploadClick(doc.id)}>
                      <FileUp size={14} />
                      {uploaded ? "Replace" : "Upload"}
                    </Button>
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        </Box>
      )}

      {step === 3 && (
        <Box>
          <Heading fontSize="lg" fontWeight="700" color="neutral.text.default" mb="4">
            Review &amp; confirm
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            Confirm your loan request details before submitting.
          </Text>

          <Flex direction="column" gap="8" mb="24" fontSize="sm">
            {[
              ["Loan type", selectedType.label],
              ["Amount", formatMoney(amountNum)],
              ["Term", `${years} years, ${months} months`],
              ["Repayment", `${LOAN_REPAYMENT_METHODS.find((m: any) => m.id === repaymentMethod)?.label} · ${LOAN_REPAYMENT_FREQUENCIES.find((f: any) => f.id === repaymentFrequency)?.label}`],
              ["Est. payment", formatMoney(periodic)],
              ["Disbursement", LOAN_PAYMENT_METHODS.find((m: any) => m.id === paymentMethod)?.label],
              ["Gross from plan", formatMoney(fees.grossAmount)],
              ["Documents", `${docs.length} file(s)`],
            ].map(([k, v]) => (
              <Flex key={String(k)} justify="space-between" gap="16" py="8" borderBottomWidth="1px" borderColor="neutral.border.subtle">
                <Text color="neutral.text.subtle">{k}</Text>
                <Text fontWeight="600" textAlign="right">
                  {v}
                </Text>
              </Flex>
            ))}
          </Flex>

          <Box mb="16" p="16" borderRadius="md" bg="neutral.surface.layer02" borderWidth="1px" borderColor="neutral.border.subtle">
            <Text fontSize="sm" fontWeight="700" mb="12">
              Terms and conditions
            </Text>
            <Flex as="ul" direction="column" gap="8" pl="16" fontSize="xs" color="neutral.text.subtle">
              {LOAN_TERMS_COPY.map((line: string) => (
                <Box as="li" key={line}>
                  {line}
                </Box>
              ))}
            </Flex>
          </Box>

          <Flex as="label" align="flex-start" gap="10" cursor="pointer">
            <Box as="span" mt="4" display="inline-flex">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
            </Box>
            <Text fontSize="sm" color="neutral.text.default">
              I have read and agree to the terms and conditions above.
            </Text>
          </Flex>
        </Box>
      )}
    </WizardShell>
  );
}
