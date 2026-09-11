import { Grid, GridItem, Heading, Stack } from "@chakra-ui/react";
import { useParticipant } from "../context/ParticipantContext";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- fixture logic ported as-is from the prototype
import { isNotEligibleUser } from "../data/participants.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- pure calculation logic ported as-is from the prototype
import { hasAccountSummary } from "../lib/accountSummary.js";
import OverallBalance from "../components/dashboard/OverallBalance";
import PlanCard from "../components/dashboard/PlanCard";
import QuickLinks from "../components/dashboard/QuickLinks";
import Transactions from "../components/dashboard/Transactions";
import LearningPortal from "../components/dashboard/LearningPortal";
import ReadinessScoreCard from "../components/dashboard/ReadinessScoreCard";

export default function Dashboard() {
  const { participant } = useParticipant();
  const first = participant.name.split(" ")[0];
  const showReadiness = !isNotEligibleUser(participant);
  const cashBalancePlan = participant.plans.find((p: any) => p.type === "Cash Balance" && p.cashBenefit);

  return (
    <>
      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="24">
        Hi {first} 👋
      </Heading>

      <Grid templateColumns={{ base: "1fr", lg: "1fr {sizes.sidebarColumn}" }} columnGap="16" rowGap="24" alignItems="start">
        <GridItem>
          <OverallBalance
            {...participant.overall}
            showSummary={hasAccountSummary(participant)}
            cashBalance={cashBalancePlan?.cashBenefit}
          />

          <Stack as="section" mt="24" gap="12">
            <Heading fontSize="base" fontWeight="700" color="neutral.text.default">
              My plans
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="12">
              {participant.plans
                .filter((plan: any) => plan.type !== "Profit Sharing")
                .map((plan: any) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
            </Grid>
          </Stack>

          <QuickLinks showGenerateStatement={!!participant.transactions?.length} />
          <Transactions rows={participant.transactions.slice(0, 5)} />
        </GridItem>

        <GridItem>
          {showReadiness && <ReadinessScoreCard />}
          <LearningPortal />
        </GridItem>
      </Grid>
    </>
  );
}
