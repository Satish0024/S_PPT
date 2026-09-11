import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Text,
  Input,
} from "@chakra-ui/react";
import { ArrowLeft, ArrowRight, CheckCircle, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { useParticipant } from "../context/ParticipantContext";
import {
  DEFERRAL_KEY,
  INVESTMENT_KEY,
  markAdvanceElections,
  markPlanManuallyEnrolled,
  isEligibleNotEnrolledUser,
  isOptedOutUser,
} from "../data/participants.js";
import { PLAN_FUNDS } from "../data/portfolio.js";
import { readMap, writeMap } from "../lib/retirementGoal.js";

// ─── Types ─────────────────────────────────────────────────────────────────

interface DeferralState {
  pre: number;
  roth: number;
  autoOn: boolean;
  autoPct: number;
}

interface AllocationMap {
  [fundName: string]: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const STEPS = ["Deferral rate", "Investment election", "Summary"];
const MAX_DEFERRAL = 12; // per slider in RetirementGoal

// ─── Helpers ───────────────────────────────────────────────────────────────

function loadSavedDeferral(participantId: string): DeferralState {
  const map = readMap(DEFERRAL_KEY);
  const saved = map[participantId] || (map.pre != null ? map : null);
  return {
    pre: saved?.pre ?? 6,
    roth: saved?.roth ?? 2,
    autoOn: saved?.autoOn ?? false,
    autoPct: saved?.autoPct ?? 1,
  };
}

function loadSavedAllocations(participantId: string): AllocationMap {
  const map = readMap(INVESTMENT_KEY);
  const saved = map[participantId];
  if (saved && typeof saved === "object" && !Array.isArray(saved)) return saved as AllocationMap;
  // Default: equal split across funds
  const each = Math.floor(100 / PLAN_FUNDS.length);
  const remainder = 100 - each * PLAN_FUNDS.length;
  return Object.fromEntries(
    PLAN_FUNDS.map((f: { name: string }, i: number) => [f.name, i === 0 ? each + remainder : each]),
  );
}

function fmtPct(n: number) {
  return `${n}%`;
}

// ─── Step indicator ────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <Flex align="center" gap="0" mb="28" overflowX="auto">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Flex key={label} align="center" flex={i < STEPS.length - 1 ? "1" : undefined}>
            <Flex direction="column" align="center" gap="6" minW="80px">
              <Flex
                w="32px"
                h="32px"
                borderRadius="full"
                align="center"
                justify="center"
                fontSize="sm"
                fontWeight="700"
                bg={
                  done
                    ? "brand.background.primaryStrong"
                    : active
                      ? "brand.background.primaryStrong"
                      : "neutral.surface.layer02"
                }
                color={
                  done || active ? "brand.text.primaryOncolor" : "neutral.text.subtle"
                }
                borderWidth={active && !done ? "2px" : "0"}
                borderColor="brand.border.primaryDefault"
              >
                {done ? <CheckCircle size={14} /> : i + 1}
              </Flex>
              <Text
                fontSize="xs"
                fontWeight={active ? "700" : "500"}
                color={active ? "brand.text.primaryDefault" : "neutral.text.subtle"}
                textAlign="center"
                whiteSpace="nowrap"
              >
                {label}
              </Text>
            </Flex>
            {i < STEPS.length - 1 && (
              <Box
                flex="1"
                h="2px"
                mb="22px"
                bg={done ? "brand.background.primaryStrong" : "neutral.border.subtle"}
                mx="4"
              />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}

// ─── Step 1: Deferral Rate ─────────────────────────────────────────────────

function DeferralStep({
  state,
  onChange,
  onNext,
}: {
  state: DeferralState;
  onChange: (patch: Partial<DeferralState>) => void;
  onNext: () => void;
}) {
  const total = (state.pre || 0) + (state.roth || 0);

  return (
    <Box>
      <Heading fontSize="lg" fontWeight="700" color="neutral.text.default" mb="4">
        Set your deferral rate
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="24">
        Choose how much of each paycheck you contribute to your retirement account. You can
        change this at any time.
      </Text>

      {/* Pre-tax */}
      <Box mb="20">
        <Flex justify="space-between" align="center" mb="6">
          <Box>
            <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
              Pre-tax deferral
            </Text>
            <Text fontSize="xs" color="neutral.text.subtle">
              Contributions made before taxes — lowers taxable income today.
            </Text>
          </Box>
          <Text fontWeight="800" fontSize="lg" color="neutral.text.default">
            {fmtPct(state.pre)}
          </Text>
        </Flex>
        <Slider
          min={0}
          max={MAX_DEFERRAL}
          step={1}
          value={[state.pre]}
          onValueChange={(d) => onChange({ pre: d.value[0] })}
          colorPalette="primary"
        />
      </Box>

      {/* Roth */}
      <Box mb="24">
        <Flex justify="space-between" align="center" mb="6">
          <Box>
            <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
              Roth deferral
            </Text>
            <Text fontSize="xs" color="neutral.text.subtle">
              After-tax contributions — qualified withdrawals can be tax-free.
            </Text>
          </Box>
          <Text fontWeight="800" fontSize="lg" color="neutral.text.default">
            {fmtPct(state.roth)}
          </Text>
        </Flex>
        <Slider
          min={0}
          max={MAX_DEFERRAL}
          step={1}
          value={[state.roth]}
          onValueChange={(d) => onChange({ roth: d.value[0] })}
          colorPalette="primary"
        />
      </Box>

      {/* Total indicator */}
      <Flex
        align="center"
        gap="8"
        p="12"
        borderRadius="md"
        bg={total > 0 ? "semantics.success.backgroundLight" : "neutral.surface.layer02"}
        mb="20"
      >
        <Info size={14} color="var(--core-colors-neutral-text-subtle)" />
        <Text fontSize="xs" color="neutral.text.subtle">
          Total deferral:&nbsp;
          <Text as="span" fontWeight="700" color="neutral.text.default">
            {fmtPct(total)} of pay
          </Text>
          {total === 0 && " — consider contributing at least 1% to get started."}
        </Text>
      </Flex>

      {/* Auto-increase */}
      <Flex
        as="button"
        onClick={() => onChange({ autoOn: !state.autoOn })}
        align="center"
        gap="12"
        w="full"
        p="14"
        borderRadius="md"
        borderWidth="2px"
        borderColor={state.autoOn ? "brand.border.primaryDefault" : "neutral.border.subtle"}
        bg={state.autoOn ? "brand.background.primarySubtle" : "neutral.surface.layer01"}
        textAlign="left"
        mb="20"
        aria-pressed={state.autoOn}
      >
        <Box
          w="18px"
          h="18px"
          borderRadius="sm"
          borderWidth="2px"
          borderColor={state.autoOn ? "brand.border.primaryDefault" : "neutral.border.strong"}
          bg={state.autoOn ? "brand.background.primaryStrong" : "transparent"}
          flexShrink={0}
        />
        <Box>
          <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
            Auto-increase · {state.autoOn ? "On" : "Off"}
          </Text>
          <Text fontSize="xs" color="neutral.text.subtle">
            Automatically increases your deferral each year.
          </Text>
        </Box>
      </Flex>

      {state.autoOn && (
        <Box mb="20" pl="30px">
          <Flex justify="space-between" align="center" mb="4">
            <Text fontSize="sm" color="neutral.text.default">
              Increase by (% per year)
            </Text>
            <Text fontWeight="700">{fmtPct(state.autoPct)}</Text>
          </Flex>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[state.autoPct]}
            onValueChange={(d) => onChange({ autoPct: d.value[0] })}
            colorPalette="primary"
          />
        </Box>
      )}

      <Button
        bg="brand.background.primaryStrong"
        color="brand.text.primaryOncolor"
        _hover={{ bg: "brand.background.primaryHover" }}
        onClick={onNext}
      >
        Continue
        <ArrowRight size={16} />
      </Button>
    </Box>
  );
}

// ─── Step 2: Investment Election ────────────────────────────────────────────

function InvestmentStep({
  allocations,
  onChangeAlloc,
  onBack,
  onNext,
}: {
  allocations: AllocationMap;
  onChangeAlloc: (fund: string, pct: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const total = useMemo(
    () => Object.values(allocations).reduce((s, v) => s + (v || 0), 0),
    [allocations],
  );
  const isValid = total === 100;

  return (
    <Box>
      <Heading fontSize="lg" fontWeight="700" color="neutral.text.default" mb="4">
        Investment election
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="24">
        Allocate your contributions across the available funds. Percentages must total 100%.
      </Text>

      <Flex direction="column" gap="12" mb="20">
        {PLAN_FUNDS.map((fund: { name: string; cat: string; risk: string; exp: string }) => (
          <Box
            key={fund.name}
            bg="neutral.surface.layer01"
            borderWidth="1px"
            borderColor="neutral.border.subtle"
            borderRadius="lg"
            p="14"
          >
            <Flex align="start" justify="space-between" gap="16" wrap="wrap">
              <Box flex="1" minW={{ base: "0", md: "selectMinW" }}>
                <Text fontSize="sm" fontWeight="700" color="neutral.text.default" mb="2">
                  {fund.name}
                </Text>
                <Flex gap="8" align="center">
                  <Badge
                    bg="neutral.surface.layer02"
                    color="neutral.text.subtle"
                    fontSize="xs"
                    px="8"
                    py="2"
                    borderRadius="full"
                  >
                    {fund.cat}
                  </Badge>
                  <Text fontSize="xs" color="neutral.text.subtle">
                    Expense ratio {fund.exp}
                  </Text>
                </Flex>
              </Box>
              <Flex align="center" gap="8" flexShrink={0}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  w="72px"
                  size="sm"
                  textAlign="right"
                  value={allocations[fund.name] ?? 0}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                    onChangeAlloc(fund.name, val);
                  }}
                  aria-label={`${fund.name} allocation percentage`}
                />
                <Text fontSize="sm" color="neutral.text.subtle" w="12px">
                  %
                </Text>
              </Flex>
            </Flex>
          </Box>
        ))}
      </Flex>

      {/* Total indicator */}
      <Flex
        align="center"
        gap="8"
        p="12"
        borderRadius="md"
        bg={
          isValid
            ? "semantics.success.backgroundLight"
            : total > 100
              ? "semantics.error.backgroundLight"
              : "neutral.surface.layer02"
        }
        mb="24"
      >
        <Text
          fontSize="sm"
          fontWeight="700"
          color={
            isValid
              ? "semantics.success.text"
              : total > 100
                ? "semantics.error.text"
                : "neutral.text.subtle"
          }
        >
          Total: {total}%{" "}
          {isValid ? "✓ Good to go" : total > 100 ? "— over 100%" : `— ${100 - total}% remaining`}
        </Text>
      </Flex>

      <Flex gap="12">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button
          bg="brand.background.primaryStrong"
          color="brand.text.primaryOncolor"
          _hover={{ bg: "brand.background.primaryHover" }}
          onClick={onNext}
          disabled={!isValid}
        >
          Review summary
          <ArrowRight size={16} />
        </Button>
      </Flex>
    </Box>
  );
}

// ─── Step 3: Summary ────────────────────────────────────────────────────────

function SummaryStep({
  deferral,
  allocations,
  isAdvanceElection,
  planName,
  onBack,
  onConfirm,
}: {
  deferral: DeferralState;
  allocations: AllocationMap;
  isAdvanceElection: boolean;
  planName: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <Box>
      <Heading fontSize="lg" fontWeight="700" color="neutral.text.default" mb="4">
        Review & confirm
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="24">
        {isAdvanceElection
          ? "These elections will be saved and applied once you become eligible."
          : "Review your elections before confirming enrollment."}
      </Text>

      {/* Deferral summary */}
      <Box
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="lg"
        p="16"
        mb="16"
      >
        <Text fontSize="xs" fontWeight="700" color="neutral.text.subtle" textTransform="uppercase" letterSpacing="wider" mb="10">
          Deferral rate
        </Text>
        <Flex direction="column" gap="8">
          <Flex justify="space-between" fontSize="sm" borderBottomWidth="1px" borderColor="neutral.border.subtle" pb="8">
            <Text color="neutral.text.subtle">Pre-tax</Text>
            <Text fontWeight="700" color="neutral.text.default">
              {fmtPct(deferral.pre)}
            </Text>
          </Flex>
          <Flex justify="space-between" fontSize="sm" borderBottomWidth="1px" borderColor="neutral.border.subtle" pb="8">
            <Text color="neutral.text.subtle">Roth</Text>
            <Text fontWeight="700" color="neutral.text.default">
              {fmtPct(deferral.roth)}
            </Text>
          </Flex>
          <Flex justify="space-between" fontSize="sm" borderBottomWidth="1px" borderColor="neutral.border.subtle" pb="8">
            <Text color="neutral.text.subtle">Total deferral</Text>
            <Text fontWeight="700" color="neutral.text.default">
              {fmtPct(deferral.pre + deferral.roth)}
            </Text>
          </Flex>
          <Flex justify="space-between" fontSize="sm">
            <Text color="neutral.text.subtle">Auto-increase</Text>
            <Text fontWeight="700" color="neutral.text.default">
              {deferral.autoOn ? `+${fmtPct(deferral.autoPct)} / yr` : "Off"}
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* Investment summary */}
      <Box
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="lg"
        p="16"
        mb="24"
      >
        <Text fontSize="xs" fontWeight="700" color="neutral.text.subtle" textTransform="uppercase" letterSpacing="wider" mb="10">
          Investment election
        </Text>
        <Flex direction="column" gap="8">
          {Object.entries(allocations)
            .filter(([, pct]) => pct > 0)
            .map(([name, pct]) => (
              <Flex key={name} justify="space-between" fontSize="sm" borderBottomWidth="1px" borderColor="neutral.border.subtle" pb="8">
                <Text color="neutral.text.subtle" flex="1" mr="16" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                  {name}
                </Text>
                <Text fontWeight="700" color="neutral.text.default" flexShrink={0}>
                  {fmtPct(pct)}
                </Text>
              </Flex>
            ))}
        </Flex>
      </Box>

      {/* Plan badge */}
      <Flex
        align="center"
        gap="8"
        p="12"
        borderRadius="md"
        bg="brand.background.primarySubtle"
        mb="24"
        fontSize="sm"
      >
        <Info size={14} />
        <Text color="brand.text.primaryDefault">
          <Text as="span" fontWeight="700">Plan: </Text>
          {planName}
        </Text>
      </Flex>

      <Flex gap="12">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button
          bg="brand.background.primaryStrong"
          color="brand.text.primaryOncolor"
          _hover={{ bg: "brand.background.primaryHover" }}
          onClick={onConfirm}
        >
          {isAdvanceElection ? "Save elections" : "Confirm enrollment"}
          <CheckCircle size={16} />
        </Button>
      </Flex>
    </Box>
  );
}

// ─── Confirmed screen ───────────────────────────────────────────────────────

function ConfirmedScreen({ isAdvanceElection }: { isAdvanceElection: boolean }) {
  const navigate = useNavigate();
  return (
    <Box textAlign="center" py="40">
      <Flex justify="center" mb="16">
        <CheckCircle size={48} color="var(--core-colors-semantics-success-background-strong)" />
      </Flex>
      <Heading fontSize="xl" fontWeight="700" color="neutral.text.default" mb="8">
        {isAdvanceElection ? "Elections saved!" : "Enrollment confirmed!"}
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="32" maxW="loginFormMaxW" mx="auto">
        {isAdvanceElection
          ? "Your deferral and investment elections have been saved. They will take effect once you become eligible."
          : "You're now enrolled. Your elections will take effect on the next payroll cycle."}
      </Text>
      <Button
        bg="brand.background.primaryStrong"
        color="brand.text.primaryOncolor"
        _hover={{ bg: "brand.background.primaryHover" }}
        onClick={() => navigate("/")}
      >
        Back to dashboard
      </Button>
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Enrollment() {
  const { participant } = useParticipant();
  const navigate = useNavigate();

  // Determine which plan to enroll in (first eligible or opted-out plan)
  const eligiblePlan = participant.plans?.find(
    (p: any) => p.noticeLink?.to === "/enrollment" || p.badge === "Eligible" || p.badge === "Opted Out",
  );

  // Not-eligible participants provide advance elections instead of real enrollment
  const isAdvanceElection = !isEligibleNotEnrolledUser(participant) && !isOptedOutUser(participant);

  const planName = eligiblePlan?.name ?? participant.plans?.[0]?.name ?? "Your plan";

  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [deferral, setDeferral] = useState<DeferralState>(() => loadSavedDeferral(participant.id));
  const [allocations, setAllocations] = useState<AllocationMap>(() => loadSavedAllocations(participant.id));

  const handleAllocChange = (fund: string, pct: number) => {
    setAllocations((prev) => ({ ...prev, [fund]: pct }));
  };

  const handleConfirm = () => {
    writeMap(DEFERRAL_KEY, participant.id, {
      pre: deferral.pre,
      roth: deferral.roth,
      autoOn: deferral.autoOn,
      autoPct: deferral.autoPct,
    });
    writeMap(INVESTMENT_KEY, participant.id, allocations);

    // Mark enrollment status
    if (eligiblePlan) {
      if (isEligibleNotEnrolledUser(participant) || isOptedOutUser(participant)) {
        markPlanManuallyEnrolled(eligiblePlan.id, participant.id);
      }
    }
    if (!isEligibleNotEnrolledUser(participant) && !isOptedOutUser(participant)) {
      markAdvanceElections(participant.id);
    }

    setConfirmed(true);
  };

  if (confirmed) {
    return <ConfirmedScreen isAdvanceElection={isAdvanceElection} />;
  }

  return (
    <>
      {/* Back link */}
      <Flex
        as="button"
        align="center"
        gap="4"
        fontSize="sm"
        fontWeight="600"
        color="brand.text.primaryDefault"
        mb="8"
        w="fit-content"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Flex>

      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="4">
        {isAdvanceElection ? "Provide elections in advance" : "Enrollment"}
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="24">
        {isAdvanceElection
          ? "Set your deferral rate and investment elections to take effect when you become eligible."
          : "Complete each step to enroll in your plan."}
      </Text>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Card */}
      <Box
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="xl"
        p={{ base: "20", md: "32" }}
        maxW="720px"
      >
        {step === 0 && (
          <DeferralStep
            state={deferral}
            onChange={(patch) => setDeferral((d) => ({ ...d, ...patch }))}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <InvestmentStep
            allocations={allocations}
            onChangeAlloc={handleAllocChange}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <SummaryStep
            deferral={deferral}
            allocations={allocations}
            isAdvanceElection={isAdvanceElection}
            planName={planName}
            onBack={() => setStep(1)}
            onConfirm={handleConfirm}
          />
        )}
      </Box>
    </>
  );
}
