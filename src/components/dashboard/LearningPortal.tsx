import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useParticipant } from "../../context/ParticipantContext";

// Matches live .learn2 / .learn2-enrich: relative card, body padding for art on the right.
export default function LearningPortal() {
  const { participant } = useParticipant();
  const isEnrich = participant?.scenario === "Auto Enrolled";

  const tag = isEnrich ? "Enrich" : "Learning";
  const desc = isEnrich
    ? "Learn how saving, spending, investing, and retirement planning can work together to support your financial goals."
    : "Learn about planning, saving, investing wisely";
  const illustration = isEnrich ? "/enrich-illustration.png" : "/learning-illustration.png";

  return (
    <Box
      as="section"
      aria-label={isEnrich ? "Enrich" : "Financial Wellness"}
      mt="16"
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      p="20"
      minH="176px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      bg={
        isEnrich
          ? "linear-gradient(135deg, var(--core-colors-neutral-surface-layer01) 0%, var(--core-colors-neutral-surface-layer01) 52%, var(--core-colors-tertiary-brand-background-primary-light) 100%)"
          : "neutral.surface.layer01"
      }
      borderWidth="1px"
      borderColor={isEnrich ? "tertiaryBrand.border.primaryDisabled" : "neutral.border.subtle"}
      boxShadow="elevation.01"
    >
      <Image
        src={illustration}
        alt=""
        aria-hidden
        position="absolute"
        right="2%"
        top="50%"
        transform="translateY(-50%)"
        w={{ base: "110px", sm: "min(38%, 132px)" }}
        maxW="132px"
        h="auto"
        objectFit="contain"
        display={{ base: "none", sm: "block" }}
        pointerEvents="none"
      />
      <Box position="relative" zIndex="1" pr={{ base: "0", sm: "min(44%, 148px)" }} maxW="100%" minW="0">
        <Box
          as="span"
          display="inline-flex"
          bg="tertiaryBrand.background.primaryLight"
          color="tertiaryBrand.text.primaryDefault"
          px="10"
          py="4"
          borderRadius="full"
          fontSize="xs"
          fontWeight="700"
          letterSpacing="wider"
          textTransform="uppercase"
          mb="12"
        >
          {tag}
        </Box>
        {!isEnrich && (
          <Text textStyle="h2" color="neutral.text.default" mb="6">
            Financial Wellness
          </Text>
        )}
        <Text fontSize="xs" color="neutral.text.subtle" mb="14" lineHeight="1.55">
          {desc}
        </Text>
        <Flex
          as={RouterLink}
          to="/enrich"
          align="center"
          gap="4"
          fontSize="xs"
          fontWeight="700"
          color="tertiaryBrand.text.primaryDefault"
          _hover={{ textDecoration: "underline" }}
          w="fit-content"
        >
          Know More
          <ArrowRight size={13} />
        </Flex>
      </Box>
    </Box>
  );
}
