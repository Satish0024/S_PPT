import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <Flex align="center" gap="0" mb="28" overflowX="auto">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Flex key={label} align="center" flex={i < steps.length - 1 ? "1" : undefined}>
            <Flex direction="column" align="center" gap="6" minW="72px">
              <Flex
                w="32px"
                h="32px"
                borderRadius="full"
                align="center"
                justify="center"
                fontSize="sm"
                fontWeight="700"
                bg={
                  done || active
                    ? "brand.background.primaryStrong"
                    : "neutral.surface.layer02"
                }
                color={done || active ? "brand.text.primaryOncolor" : "neutral.text.subtle"}
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
            {i < steps.length - 1 && (
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

export interface WizardShellProps {
  title: string;
  subtitle?: string;
  steps: string[];
  currentStep: number;
  children: ReactNode;
  planName?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideFooter?: boolean;
  cancelTo?: string;
}

export default function WizardShell({
  title,
  subtitle,
  steps,
  currentStep,
  children,
  planName,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  hideFooter = false,
  cancelTo = "/transactions",
}: WizardShellProps) {
  const navigate = useNavigate();
  const isFirst = currentStep <= 0;

  return (
    <>
      <Flex
        as="button"
        align="center"
        gap="4"
        fontSize="sm"
        fontWeight="600"
        color="brand.text.primaryDefault"
        mb="8"
        w="fit-content"
        onClick={() => navigate(cancelTo)}
      >
        <ArrowLeft size={16} />
        Back to transactions
      </Flex>

      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="4">
        {title}
      </Heading>
      {subtitle && (
        <Text fontSize="sm" color="neutral.text.subtle" mb="8">
          {subtitle}
        </Text>
      )}
      {planName && (
        <Text fontSize="sm" color="neutral.text.subtle" mb="24">
          Plan:{" "}
          <Text as="span" fontWeight="600" color="neutral.text.default">
            {planName}
          </Text>
        </Text>
      )}

      <StepIndicator steps={steps} current={currentStep} />

      <Box
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="xl"
        p={{ base: "20", md: "32" }}
        maxW="wizardMaxW"
        boxShadow="elevation.01"
      >
        {children}

        {!hideFooter && (
          <Flex
            gap="12"
            mt="32"
            pt="24"
            borderTopWidth="1px"
            borderColor="neutral.border.subtle"
            wrap="wrap"
            direction={{ base: "column-reverse", sm: "row" }}
            justify="space-between"
          >
            <Flex gap="12" wrap="wrap">
              {!isFirst && onBack && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
              <Button variant="ghost" color="neutral.text.subtle" onClick={() => navigate(cancelTo)}>
                Cancel
              </Button>
            </Flex>
            {onNext && (
              <Button
                bg="brand.background.primaryStrong"
                color="brand.text.primaryOncolor"
                _hover={{ bg: "brand.background.primaryHover" }}
                disabled={nextDisabled}
                onClick={onNext}
                w={{ base: "100%", sm: "auto" }}
              >
                {nextLabel}
              </Button>
            )}
          </Flex>
        )}
      </Box>
    </>
  );
}
