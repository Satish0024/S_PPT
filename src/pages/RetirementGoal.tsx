import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { FormSelect } from "../components/ui/form-select";
import { ArrowLeft, MapPin, Umbrella, CalendarDays, Banknote, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { useParticipant } from "../context/ParticipantContext";
import {
  LOCATIONS,
  LOCATION_DEFAULTS,
  READINESS_KEY,
  PREFS_KEY,
  ageFromDob,
  hydratePrefs,
  money,
  parseMoney,
  scoreGoal,
  setRateOn,
  writeMap,
} from "../lib/retirementGoal.js";

const RING_R = 42;
const RING_C = 2 * Math.PI * RING_R;

function ScoreRing({ pct }: { pct: number }) {
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * RING_C;
  return (
    <svg viewBox="0 0 100 100" width="140" height="140" role="img" aria-label={`${pct}% of retirement spend funded`}>
      {/* Track ring — neutral border */}
      <circle cx="50" cy="50" r={RING_R} fill="none" stroke="var(--core-colors-neutral-border-default)" strokeWidth="7" />
      {/* Progress ring — brand blue */}
      <circle
        cx="50"
        cy="50"
        r={RING_R}
        fill="none"
        stroke="var(--core-colors-brand-background-primary-strong)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${RING_C}`}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray .4s ease" }}
      />
    </svg>
  );
}

function TargetRow({ icon, label, hint, children }: { icon: React.ReactNode; label: string; hint: string; children: React.ReactNode }) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", sm: "center" }}
      direction={{ base: "column", sm: "row" }}
      gap="16"
      py="12"
      borderBottomWidth="1px"
      borderColor="neutral.border.subtle"
      wrap="wrap"
    >
      <Flex align="center" gap="12" flex="1" minW={{ base: "0", sm: "220px" }}>
        <Box color="brand.text.primaryDefault">{icon}</Box>
        <Box>
          <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
            {label}
          </Text>
          <Text fontSize="xs" color="neutral.text.subtle">
            {hint}
          </Text>
        </Box>
      </Flex>
      <Box flexShrink={0} w={{ base: "full", sm: "auto" }}>{children}</Box>
    </Flex>
  );
}

export default function RetirementGoal() {
  const { participant } = useParticipant();
  const navigate = useNavigate();
  const currentAge = ageFromDob(participant.profile?.dob);
  const balance = parseMoney(participant.overall?.total);

  const [prefs, setPrefs] = useState(() => hydratePrefs(participant));

  const { score, income, expense, shortfall } = useMemo(
    () => scoreGoal({ prefs, currentAge, balance }),
    [prefs, currentAge, balance],
  );
  const pct = Math.max(0, Math.min(100, Math.round(score)));

  const set = (key: string, value: any) => setPrefs((p: any) => ({ ...p, [key]: value }));

  const setLocation = (loc: string) => {
    const defaults = LOCATION_DEFAULTS[loc as keyof typeof LOCATION_DEFAULTS];
    setPrefs((p: any) => ({ ...p, location: loc, monthlySpend: defaults.monthlySpend, salary: defaults.salary, outside: defaults.outside }));
  };

  const confirm = () => {
    writeMap(PREFS_KEY, participant.id, prefs);
    writeMap(READINESS_KEY, participant.id, true);
    navigate("/", { state: { goalSaved: true } });
  };

  return (
    <>
      <Flex as={RouterLink} to="/" align="center" gap="4" fontSize="sm" fontWeight="600" color="brand.text.primaryDefault" mb="8" w="fit-content">
        <ArrowLeft size={16} />
        Back to dashboard
      </Flex>
      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="16">
        Retirement readiness
      </Heading>

      <Flex gap="16" align="start" wrap="wrap">
        {/* Live results aside — white card matching live prototype */}
        <Box
          as="aside"
          flexShrink={{ md: 0 }}
          w={{ base: "full", md: "asidePanel" }}
          bg="neutral.surface.layer01"
          borderWidth="1px"
          borderColor="neutral.border.subtle"
          borderRadius="xl"
          p="20"
          position={{ base: "relative", lg: "sticky" }}
          top="16"
        >
          <Flex justify="center" my="8">
            <Box position="relative" w="scoreRingLg" h="scoreRingLg">
              <ScoreRing pct={pct} />
              <Flex position="absolute" inset="0" direction="column" align="center" justify="center">
                <Text textStyle="display.md" color="neutral.text.default">
                  {pct}%
                </Text>
                <Text fontSize="xs" color="neutral.text.subtle">
                  Goal reached
                </Text>
              </Flex>
            </Box>
          </Flex>
          <Box mb="16">
            <Flex justify="space-between" fontSize="xs" py="6" borderBottomWidth="1px" borderColor="neutral.border.subtle">
              <Text color="neutral.text.subtle">Expected expense</Text>
              <Text fontWeight="700" color="neutral.text.default">{money(expense)}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="xs" py="6" borderBottomWidth="1px" borderColor="neutral.border.subtle">
              <Text color="neutral.text.subtle">All income</Text>
              <Text fontWeight="700" color="semantics.success.text">
                {money(income)}
              </Text>
            </Flex>
            <Flex justify="space-between" fontSize="xs" py="6">
              <Text color="neutral.text.subtle">Shortfall</Text>
              <Text fontWeight="700" color="semantics.critical.text">
                {money(shortfall)}
              </Text>
            </Flex>
          </Box>
          <Box fontSize="xs" borderTopWidth="1px" borderColor="neutral.border.subtle" pt="12">
            {[
              ["Retirement age", prefs.retireAge],
              ["Years remaining", Math.max(1, (prefs.retireAge || 67) - currentAge)],
              ["Deferrals", `${(prefs.pre || 0) + (prefs.roth || 0)}% of pay`],
              ["Auto increase", prefs.autoOn ? `+${prefs.autoPct || 1}% / yr` : "Off"],
            ].map(([label, value]) => (
              <Flex key={label as string} justify="space-between" py="4">
                <Text color="neutral.text.subtle">{label}</Text>
                <Text fontWeight="600" color="neutral.text.default">{value}</Text>
              </Flex>
            ))}
          </Box>
          <Text fontSize="xs" color="neutral.text.subtle" mt="12">
            *Not guaranteed results.
          </Text>
        </Box>

        {/* Inputs */}
        <Box flex="1" minW={{ base: "0", md: "320px" }} display="flex" flexDirection="column" gap="16">
          <Box bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg" p="16">
            <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="8">
              Retirement target
            </Heading>
            <TargetRow icon={<MapPin size={16} />} label="Retirement location" hint="This information is used to determine the state tax">
              <FormSelect
                size="sm"
                width="filterMinW"
                value={prefs.location}
                onChange={setLocation}
                options={LOCATIONS.map((loc: string) => ({ label: loc, value: loc }))}
              />
            </TargetRow>
            <TargetRow icon={<Umbrella size={16} />} label="Planned retirement age" hint={`About ${Math.max(1, (prefs.retireAge || 67) - currentAge)} years from now`}>
              <Flex align="center" gap="8">
                <Button size="sm" variant="outline" onClick={() => set("retireAge", Math.max(50, (prefs.retireAge || 67) - 1))} aria-label="Lower age">
                  −
                </Button>
                <Text fontWeight="700" w="32px" textAlign="center">
                  {prefs.retireAge}
                </Text>
                <Button size="sm" variant="outline" onClick={() => set("retireAge", Math.min(80, (prefs.retireAge || 67) + 1))} aria-label="Raise age">
                  +
                </Button>
              </Flex>
            </TargetRow>
            <TargetRow icon={<CalendarDays size={16} />} label="Monthly spending" hint={`About ${money((prefs.monthlySpend || 0) * 12)} a year`}>
              <Input size="sm" w="140px" value={prefs.monthlySpend} onChange={(e) => set("monthlySpend", parseMoney(e.target.value))} />
            </TargetRow>
            <TargetRow icon={<Banknote size={16} />} label="Annual salary" hint="Drives how much each deferral percent saves">
              <Input size="sm" w="140px" value={prefs.salary} onChange={(e) => set("salary", parseMoney(e.target.value))} />
            </TargetRow>
            <TargetRow icon={<DollarSign size={16} />} label="Savings outside your 401(k)" hint="Brokerage, IRAs, and cash you expect to use in retirement">
              <Input size="sm" w="140px" value={prefs.outside} onChange={(e) => set("outside", parseMoney(e.target.value))} />
            </TargetRow>
          </Box>

          <Box bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg" p="16">
            <Text fontSize="xs" color="neutral.text.subtle" mb="4">
              Plan
            </Text>
            <FormSelect
              size="sm"
              disabled
              mb="16"
              value={participant.overall ? "current" : ""}
              onChange={() => {}}
              options={[{ label: participant.plans?.[0]?.name || "Plan", value: "current" }]}
            />

            <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="12">
              Deferrals
            </Heading>

            <Box mb="16">
              <Flex justify="space-between" align="center" mb="4">
                <Box>
                  <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
                    Pre-tax deferral
                  </Text>
                  <Text fontSize="xs" color="neutral.text.subtle">
                    Goes in before taxes and can lower taxable income today.
                  </Text>
                </Box>
                <Text fontWeight="700">{prefs.pre || 0}%</Text>
              </Flex>
              <Slider
                min={0}
                max={12}
                step={1}
                value={[prefs.pre || 0]}
                onValueChange={(d) => setPrefs((p: any) => setRateOn(p, "pre", d.value[0]))}
                colorPalette="primary"
              />
            </Box>

            <Box mb="16">
              <Flex justify="space-between" align="center" mb="4">
                <Box>
                  <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
                    Roth deferral
                  </Text>
                  <Text fontSize="xs" color="neutral.text.subtle">
                    Goes in after taxes. Qualified withdrawals can come out tax-free.
                  </Text>
                </Box>
                <Text fontWeight="700">{prefs.roth || 0}%</Text>
              </Flex>
              <Slider
                min={0}
                max={12}
                step={1}
                value={[prefs.roth || 0]}
                onValueChange={(d) => setPrefs((p: any) => setRateOn(p, "roth", d.value[0]))}
                colorPalette="primary"
              />
            </Box>

            <Flex
              as="button"
              onClick={() => set("autoOn", !prefs.autoOn)}
              align="center"
              gap="12"
              w="full"
              p="12"
              borderRadius="md"
              borderWidth="1px"
              borderColor="neutral.border.subtle"
              textAlign="left"
            >
              <Box
                w="18px"
                h="18px"
                borderRadius="sm"
                borderWidth="2px"
                borderColor={prefs.autoOn ? "brand.border.primaryDefault" : "neutral.border.strong"}
                bg={prefs.autoOn ? "brand.background.primaryStrong" : "transparent"}
                flexShrink={0}
              />
              <Box>
                <Text fontSize="sm" fontWeight="700" color="neutral.text.default">
                  Auto increase · {prefs.autoOn ? "On" : "Off"}
                </Text>
                <Text fontSize="xs" color="neutral.text.subtle">
                  Typical plan setting is +1% each year until 10%.
                </Text>
              </Box>
            </Flex>
          </Box>

          <Flex gap="12" wrap="wrap">
            <Button onClick={confirm} bg="brand.background.primaryStrong" color="brand.text.primaryOncolor" _hover={{ bg: "brand.background.primaryHover" }}>
              Confirm changes
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")}>
              Cancel
            </Button>
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
