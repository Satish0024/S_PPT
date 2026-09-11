import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { ArrowRight, Info, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../ui/dialog";
import { useParticipant } from "../../context/ParticipantContext";
import {
  isEligibleNotEnrolledUser,
  isNotEligibleUser,
  isOptedOutUser,
} from "../../data/participants.js";
import {
  READINESS_KEY,
  ageFromDob,
  hydratePrefs,
  money,
  parseMoney,
  readMap,
  scoreGoal,
} from "../../lib/retirementGoal.js";

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

function ScoreRing({ pct }: { pct: number }) {
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * RING_C;
  return (
    <svg viewBox="0 0 128 128" width="112" height="112" aria-hidden focusable="false">
      <circle cx="64" cy="64" r={RING_R} fill="none" stroke="var(--core-colors-neutral-border-subtle)" strokeWidth="8" />
      <circle
        cx="64"
        cy="64"
        r={RING_R}
        fill="none"
        stroke="var(--core-colors-brand-border-primary-default)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${RING_C}`}
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
    </svg>
  );
}

export default function ReadinessScoreCard() {
  const { participant } = useParticipant();
  const location = useLocation();
  const [started, setStarted] = useState(() => !!(participant.showSimulator || readMap(READINESS_KEY)[participant.id]));
  const [prefs, setPrefs] = useState(() => hydratePrefs(participant));
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  useEffect(() => {
    setStarted(!!(participant.showSimulator || readMap(READINESS_KEY)[participant.id]));
    setPrefs(hydratePrefs(participant));
  }, [participant.id, participant.showSimulator]);

  useEffect(() => {
    if (!(location.state as { goalSaved?: boolean })?.goalSaved) return;
    setStarted(true);
    setPrefs(hydratePrefs(participant));
  }, [location.state, participant]);

  const currentAge = ageFromDob(participant.profile?.dob);
  const balance = parseMoney(participant.overall?.total);
  const { score, income, expense, shortfall } = useMemo(
    () => scoreGoal({ prefs, currentAge, balance }),
    [prefs, currentAge, balance],
  );
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const eligibleNotEnrolled = isEligibleNotEnrolledUser(participant);

  if (isNotEligibleUser(participant) || isOptedOutUser(participant)) return null;

  return (
    <Box
      as="section"
      aria-label="Retirement Readiness"
      borderRadius="2xl"
      overflow="hidden"
      bg="neutral.surface.layer01"
      color="neutral.text.default"
      position="relative"
      boxShadow="elevation.01"
    >
      {/* Blue banner — matches live .rgs-banner */}
      <Flex
        as="header"
        position="relative"
        overflow="hidden"
        align="flex-start"
        gap="12"
        px="20"
        pt="16"
        pb="20"
        minH="92px"
        bg="linear-gradient(115deg, var(--core-colors-brand-background-primary-strong) 0%, color-mix(in srgb, var(--core-colors-brand-background-primary-strong) 65%, white) 100%)"
        borderTopRadius="2xl"
      >
        <Box position="relative" zIndex="1" flex="1" minW="0" maxW="66%">
          <Heading
            as="h3"
            textStyle="eyebrow"
            color="brand.text.primaryOncolor"
            opacity={0.78}
            mb="4"
          >
            Retirement Readiness
          </Heading>
          <Text textStyle="h5" fontWeight="700" color="brand.text.primaryOncolor" lineHeight="base">
            See how your inputs affect your savings, income, risk.
          </Text>
        </Box>
        <Image
          className="rgs-banner-art"
          src="/readiness-banner.png"
          alt=""
          aria-hidden
          position="absolute"
          right="-6%"
          bottom="-14%"
          w="62%"
          minW="170px"
          maxW="260px"
          h="auto"
          objectFit="contain"
          pointerEvents="none"
        />
      </Flex>

      <Box position="relative" zIndex="1" p="20">
        {started ? (
          <Flex align="center" gap="16" mb="16" direction={{ base: "column", sm: "row" }} wrap="wrap">
            <Box position="relative" w="scoreRingMd" h="scoreRingMd" flexShrink={0}>
              <ScoreRing pct={pct} />
              <Flex position="absolute" inset="0" direction="column" align="center" justify="center" fontSize="2xl" fontWeight="700" color="neutral.text.default">
                {pct}%
                <Text fontSize="2xs" fontWeight="600" color="neutral.text.subtle" textAlign="center" lineHeight="1.35" letterSpacing="wide" mt="12">
                  of your goal
                </Text>
              </Flex>
            </Box>
            <Box flex="1" w="full" minW="0">
              <Flex justify="space-between" fontSize="xs" py="8" borderBottomWidth="1px" borderColor="neutral.border.subtle" gap="10" wrap="wrap">
                <Text fontWeight="700" textTransform="uppercase" letterSpacing="wider" fontSize="2xs" color="neutral.text.subtle">
                  Expected expense
                </Text>
                <Text fontWeight="700" fontSize="base">
                  {money(expense)}
                </Text>
              </Flex>
              <Flex justify="space-between" fontSize="xs" py="8" borderBottomWidth="1px" borderColor="neutral.border.subtle" gap="10" wrap="wrap">
                <Text fontWeight="600" color="semantics.success.text">
                  All income
                </Text>
                <Text fontWeight="700" fontSize="base" color="semantics.success.text">
                  {money(income)}
                </Text>
              </Flex>
              <Flex justify="space-between" fontSize="xs" py="8" gap="10" wrap="wrap">
                <Text fontWeight="600" color="semantics.critical.text">
                  Short fall
                </Text>
                <Text fontWeight="700" fontSize="base" color="semantics.critical.text">
                  {money(shortfall)}
                </Text>
              </Flex>
            </Box>
          </Flex>
        ) : (
          <Flex direction="column" align="flex-start" gap="12" mb="16">
            <Text fontSize="xs" color="neutral.text.subtle" lineHeight="1.55">
              This estimates how much of your retirement spending is covered by your savings, using your deferrals, age, and location.
            </Text>
            {eligibleNotEnrolled ? (
              <Button
                size="sm"
                disabled
                bg="brand.background.primaryStrong"
                color="brand.text.primaryOncolor"
                opacity={0.55}
              >
                Get started
                <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                bg="brand.background.primaryStrong"
                color="brand.text.primaryOncolor"
                _hover={{ bg: "brand.background.primaryHover", color: "brand.text.primaryOncolor" }}
              >
                <RouterLink to="/retirement-goal">
                  Get started
                  <ArrowRight size={14} />
                </RouterLink>
              </Button>
            )}
          </Flex>
        )}

        <Flex
          direction="column"
          gap="8"
          mt="14"
          pt="12"
          borderTopWidth="1px"
          borderColor="neutral.border.subtle"
          fontSize="xs"
        >
          <Flex align="flex-start" gap="6" color="neutral.text.subtle" lineHeight="1.45">
            <Box as="span" mt="2" flexShrink={0}>
              <Info size={13} />
            </Box>
            Not guaranteed results.
          </Flex>
          <Flex align="center" gap="14" wrap="wrap" w="full">
            {started && (
              <Flex
                as={RouterLink}
                to="/retirement-goal"
                align="center"
                gap="4"
                fontSize="xs"
                fontWeight="700"
                color="neutral.text.default"
                _hover={{ textDecoration: "underline" }}
              >
                <SlidersHorizontal size={12} />
                Adjust deferral rate and goal
              </Flex>
            )}
            <Button
              variant="ghost"
              size="xs"
              ml="auto"
              fontWeight="700"
              color="neutral.text.default"
              onClick={() => setDisclaimerOpen(true)}
            >
              Disclaimer
              <ArrowRight size={12} />
            </Button>
          </Flex>
        </Flex>
      </Box>

      <DialogRoot open={disclaimerOpen} onOpenChange={(d) => setDisclaimerOpen(d.open)} size="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirement readiness disclaimer</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text fontSize="sm" color="neutral.text.subtle" lineHeight="1.55">
              This estimate is for educational purposes only and is not a guarantee of future results, investment advice,
              or a promise of retirement income. Actual outcomes depend on market performance, plan rules, contribution
              behavior, fees, taxes, and other factors outside this tool.
            </Text>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
