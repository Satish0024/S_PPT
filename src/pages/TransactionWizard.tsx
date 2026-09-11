import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Heading, Text } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useParticipant } from "../context/ParticipantContext";
import { TRANSACTION_TYPES, canRequest, transactablePlans } from "../data/transactions.js";
import LoanWizard from "../components/transactions/LoanWizard";
import WithdrawalWizard from "../components/transactions/WithdrawalWizard";
import TransferWizard from "../components/transactions/TransferWizard";
import RebalanceWizard from "../components/transactions/RebalanceWizard";
import RolloverWizard from "../components/transactions/RolloverWizard";

export default function TransactionWizard() {
  const { type } = useParams<{ type: string }>();
  const [params] = useSearchParams();
  const planId = params.get("plan") || undefined;
  const { participant } = useParticipant();

  const plans = transactablePlans(participant);
  const plan = plans.find((p: any) => p.id === planId) || plans[0];
  const typeMeta = TRANSACTION_TYPES.find((t: any) => t.id === type);

  if (!typeMeta) {
    return (
      <EmptyState
        title="Unknown request type"
        body={`“${type}” is not a supported transaction request.`}
      />
    );
  }

  if (!plan) {
    return (
      <EmptyState
        title="No eligible plan"
        body="You don't have a plan balance to raise a transaction request against yet."
      />
    );
  }

  if (!canRequest(plan, typeMeta.id)) {
    return (
      <EmptyState
        title={`${typeMeta.label} not available`}
        body={`This plan isn't eligible for a ${typeMeta.label.toLowerCase()} request right now.`}
      />
    );
  }

  const props = { participant, plan };

  switch (typeMeta.id) {
    case "loan":
      return <LoanWizard {...props} />;
    case "withdrawal":
      return <WithdrawalWizard {...props} />;
    case "transfer":
      return <TransferWizard {...props} />;
    case "rebalance":
      return <RebalanceWizard {...props} />;
    case "rollover":
      return <RolloverWizard {...props} />;
    default:
      return (
        <EmptyState
          title="Coming soon"
          body={`${typeMeta.label} requests aren't available in this build yet.`}
        />
      );
  }
}

function EmptyState({ title, body }: { title: string; body: string }) {
  const navigate = useNavigate();
  return (
    <>
      <Button variant="ghost" color="brand.text.primaryDefault" mb="8" px="0" onClick={() => navigate("/transactions")}>
        <ArrowLeft size={16} />
        Back to transactions
      </Button>
      <Box
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="xl"
        p="32"
        maxW="wizardMaxW"
      >
        <Heading fontSize="xl" fontWeight="700" mb="8">
          {title}
        </Heading>
        <Text fontSize="sm" color="neutral.text.subtle">
          {body}
        </Text>
      </Box>
    </>
  );
}
