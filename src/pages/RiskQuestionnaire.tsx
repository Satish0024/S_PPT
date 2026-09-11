import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { FormSelect } from "../components/ui/form-select";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useParticipant } from "../context/ParticipantContext";
import {
  LIKERT_OPTIONS,
  LIKERT_QUESTIONS,
  QUESTIONNAIRE_STEP_COUNT,
} from "../data/riskQuestionnaire.js";
import {
  getRiskAnswers,
  getRiskLevel,
  scoreQuestionnaire,
  setRiskAnswers,
  setRiskProfileId,
} from "../lib/riskProfile.js";

// ─── Financial profile step options ────────────────────────────────────────

const INCOME_RANGES = [
  "Under $40,000",
  "$40,000 – $75,000",
  "$75,000 – $125,000",
  "$125,000 – $200,000",
  "Over $200,000",
];

const TIME_HORIZONS = [
  "Less than 5 years",
  "5 – 10 years",
  "10 – 20 years",
  "More than 20 years",
];

// ─── Badge color map by risk level id ──────────────────────────────────────

const LEVEL_BADGE: Record<string, { bg: string; color: string }> = {
  conservative: {
    bg: "semantics.success.backgroundLight",
    color: "semantics.success.text",
  },
  moderate: {
    bg: "tertiaryBrand.background.primaryLight",
    color: "tertiaryBrand.text.primaryDefault",
  },
  aggressive: {
    bg: "semantics.critical.backgroundLight",
    color: "semantics.critical.text",
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────

function ProgressPip({ active, done }: { active: boolean; done: boolean }) {
  return (
    <Box
      w="8px"
      h="8px"
      borderRadius="full"
      bg={
        done
          ? "brand.background.primaryStrong"
          : active
            ? "brand.background.primaryStrong"
            : "neutral.border.strong"
      }
      opacity={done ? 1 : active ? 1 : 0.4}
      flexShrink={0}
    />
  );
}

function LikertStep({
  question,
  stepIndex,
  total,
  answer,
  onAnswer,
  onBack,
  onNext,
}: {
  question: { id: string; text: string };
  stepIndex: number;
  total: number;
  answer: number | null;
  onAnswer: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Box>
      {/* Progress pips + counter */}
      <Flex align="center" gap="6" mb="24">
        {Array.from({ length: total }).map((_, i) => (
          <ProgressPip key={i} active={i === stepIndex} done={i < stepIndex} />
        ))}
        <Text fontSize="xs" color="neutral.text.subtle" ml="4">
          {String(stepIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </Text>
      </Flex>

      <Heading fontSize="xl" fontWeight="700" color="neutral.text.default" mb="24" lineHeight="1.35">
        {question.text}
      </Heading>

      <Flex direction="column" gap="10" mb="32">
        {LIKERT_OPTIONS.map((opt) => {
          const selected = answer === opt.value;
          return (
            <Flex
              as="button"
              key={opt.value}
              align="center"
              gap="12"
              px="16"
              py="14"
              borderRadius="md"
              borderWidth="2px"
              borderColor={
                selected ? "brand.border.primaryDefault" : "neutral.border.subtle"
              }
              bg={
                selected ? "brand.background.primarySubtle" : "neutral.surface.layer01"
              }
              color={selected ? "brand.text.primaryDefault" : "neutral.text.default"}
              fontWeight={selected ? "600" : "500"}
              fontSize="sm"
              textAlign="left"
              onClick={() => onAnswer(opt.value)}
              aria-pressed={selected}
            >
              <Box
                w="18px"
                h="18px"
                borderRadius="full"
                borderWidth="2px"
                borderColor={
                  selected ? "brand.border.primaryDefault" : "neutral.border.strong"
                }
                bg={selected ? "brand.background.primaryStrong" : "transparent"}
                flexShrink={0}
              />
              {opt.label}
            </Flex>
          );
        })}
      </Flex>

      <Flex gap="12">
        <Button variant="outline" onClick={onBack} aria-label="Previous question">
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button
          bg="brand.background.primaryStrong"
          color="brand.text.primaryOncolor"
          _hover={{ bg: "brand.background.primaryHover" }}
          onClick={onNext}
          disabled={answer === null}
        >
          {stepIndex === total - 1 ? "Continue" : "Next"}
          <ArrowRight size={16} />
        </Button>
      </Flex>
    </Box>
  );
}

function FinancialProfileStep({
  income,
  horizon,
  onChange,
  onBack,
  onNext,
}: {
  income: string;
  horizon: string;
  onChange: (key: "income" | "horizon", val: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = income !== "" && horizon !== "";
  return (
    <Box>
      <Badge
        bg="brand.background.primarySubtle"
        color="brand.text.primaryDefault"
        fontSize="xs"
        fontWeight="700"
        mb="16"
        px="10"
        py="4"
        borderRadius="full"
      >
        Almost there
      </Badge>
      <Heading fontSize="xl" fontWeight="700" color="neutral.text.default" mb="8">
        A little more about you
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="24">
        This helps us fine-tune the context for your results — it doesn&apos;t change your
        questionnaire score.
      </Text>

      <Box mb="20">
        <Text fontSize="sm" fontWeight="600" color="neutral.text.default" mb="6">
          Estimated annual household income
        </Text>
        <FormSelect
          size="md"
          value={income}
          onChange={(v) => onChange("income", v)}
          placeholder="Select income range…"
          options={INCOME_RANGES.map((r) => ({ label: r, value: r }))}
        />
      </Box>

      <Box mb="32">
        <Text fontSize="sm" fontWeight="600" color="neutral.text.default" mb="6">
          How many years until you plan to retire?
        </Text>
        <FormSelect
          size="md"
          value={horizon}
          onChange={(v) => onChange("horizon", v)}
          placeholder="Select time horizon…"
          options={TIME_HORIZONS.map((h) => ({ label: h, value: h }))}
        />
      </Box>

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
          disabled={!valid}
        >
          See my results
          <ArrowRight size={16} />
        </Button>
      </Flex>
    </Box>
  );
}

function ResultsCard({
  levelId,
  onRetake,
  onSave,
}: {
  levelId: string;
  onRetake: () => void;
  onSave: () => void;
}) {
  const level = getRiskLevel(levelId);
  const badge = LEVEL_BADGE[levelId] ?? LEVEL_BADGE.moderate;

  return (
    <Box>
      <Flex align="center" gap="10" mb="24">
        <CheckCircle size={22} color="var(--core-colors-semantics-success-background-strong)" />
        <Heading fontSize="xl" fontWeight="700" color="neutral.text.default">
          Your investment profile
        </Heading>
      </Flex>

      <Box
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="xl"
        p="24"
        mb="20"
      >
        <Badge
          bg={badge.bg}
          color={badge.color}
          fontSize="xs"
          fontWeight="800"
          letterSpacing="wide"
          px="10"
          py="4"
          borderRadius="full"
          mb="12"
        >
          {level.badge}
        </Badge>
        <Heading fontSize="lg" fontWeight="700" color="neutral.text.default" mb="6">
          {level.label}
        </Heading>
        <Text fontSize="sm" color="neutral.text.subtle" mb="20">
          {level.copy}
        </Text>

        <Box
          bg="neutral.surface.layer02"
          borderRadius="md"
          p="14"
          mb="16"
        >
          <Text fontSize="xs" fontWeight="700" color="neutral.text.subtle" mb="10" textTransform="uppercase" letterSpacing="wider">
            Your outlook
          </Text>
          <Text fontSize="sm" color="neutral.text.default" fontStyle="italic">
            &ldquo;{level.outlook}&rdquo;
          </Text>
        </Box>

        <Text fontSize="xs" fontWeight="700" color="neutral.text.subtle" mb="10" textTransform="uppercase" letterSpacing="wider">
          Key insights
        </Text>
        <Flex direction="column" gap="8">
          {level.insights.map((insight: string) => (
            <Flex key={insight} align="start" gap="8" fontSize="sm" color="neutral.text.default">
              <Box
                mt="5px"
                w="6px"
                h="6px"
                borderRadius="full"
                bg="brand.background.primaryStrong"
                flexShrink={0}
              />
              {insight}
            </Flex>
          ))}
        </Flex>
      </Box>

      <Flex gap="12">
        <Button
          bg="brand.background.primaryStrong"
          color="brand.text.primaryOncolor"
          _hover={{ bg: "brand.background.primaryHover" }}
          onClick={onSave}
        >
          Save profile
        </Button>
        <Button variant="ghost" onClick={onRetake}>
          Retake questionnaire
        </Button>
      </Flex>
    </Box>
  );
}

// ─── Total steps: 5 Likert + 1 financial profile + 1 results ───────────────
// Step indices: 0-4 = Likert, 5 = financial profile, 6 = results

type FinancialProfile = { income: string; horizon: string };

export default function RiskQuestionnaire() {
  const { participant } = useParticipant();
  const navigate = useNavigate();

  // Pre-populate from saved answers if the participant has done this before
  const saved = getRiskAnswers(participant.id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(saved ?? {});
  const [profile, setProfile] = useState<FinancialProfile>({
    income: "",
    horizon: "",
  });
  const [resultLevelId, setResultLevelId] = useState<string | null>(null);

  const RESULTS_STEP = QUESTIONNAIRE_STEP_COUNT + 1; // index 6

  const handleLikertAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => {
    if (step === 0) {
      navigate(-1);
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleFinancialContinue = () => {
    const { score, levelId } = scoreQuestionnaire(answers);
    // score is available for debugging but levelId drives the result
    void score;
    setResultLevelId(levelId);
    setStep(RESULTS_STEP);
  };

  const handleSave = () => {
    if (!resultLevelId) return;
    setRiskAnswers(participant.id, answers);
    setRiskProfileId(participant.id, resultLevelId);
    navigate("/");
  };

  const handleRetake = () => {
    setAnswers({});
    setStep(0);
    setResultLevelId(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────
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
        Investment style questionnaire
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="28">
        Answer a few questions to find an investment style that matches your comfort with
        risk. Your answers are saved and can be updated at any time.
      </Text>

      {/* Card container */}
      <Box
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="xl"
        p={{ base: "20", md: "32" }}
        maxW="wizardMaxW"
      >
        {/* Likert questions (steps 0-4) */}
        {step < QUESTIONNAIRE_STEP_COUNT && (
          <LikertStep
            question={LIKERT_QUESTIONS[step]}
            stepIndex={step}
            total={QUESTIONNAIRE_STEP_COUNT}
            answer={answers[LIKERT_QUESTIONS[step].id] ?? null}
            onAnswer={(v) => handleLikertAnswer(LIKERT_QUESTIONS[step].id, v)}
            onBack={goBack}
            onNext={goNext}
          />
        )}

        {/* Financial profile step (step 5) */}
        {step === QUESTIONNAIRE_STEP_COUNT && (
          <FinancialProfileStep
            income={profile.income}
            horizon={profile.horizon}
            onChange={(key, val) => setProfile((p) => ({ ...p, [key]: val }))}
            onBack={goBack}
            onNext={handleFinancialContinue}
          />
        )}

        {/* Results (step 6) */}
        {step === RESULTS_STEP && resultLevelId && (
          <ResultsCard
            levelId={resultLevelId}
            onRetake={handleRetake}
            onSave={handleSave}
          />
        )}
      </Box>
    </>
  );
}
