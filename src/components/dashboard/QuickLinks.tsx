import { Box, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Users, FileText, LineChart, FileSpreadsheet } from "lucide-react";

function QuickLink({ to, state, icon, label }: { to: string; state?: any; icon: React.ReactNode; label: string }) {
  return (
    <Flex
      as={RouterLink}
      to={to}
      state={state}
      align="center"
      gap="12"
      px="14"
      py="14"
      bg="neutral.surface.layer01"
      borderWidth="1px"
      borderColor="neutral.border.subtle"
      borderRadius="lg"
      boxShadow="elevation.01"
      textDecoration="none"
      color="inherit"
      _hover={{ borderColor: "neutral.border.default", boxShadow: "elevation.02" }}
      transition="border-color 120ms ease, box-shadow 120ms ease"
    >
      <Flex
        align="center"
        justify="center"
        w="36px"
        h="36px"
        flexShrink={0}
        borderRadius="sm"
        bg="brand.background.primarySubtle"
        color="brand.text.primaryDefault"
        aria-hidden
      >
        {icon}
      </Flex>
      <Text fontSize="sm" fontWeight="700" color="neutral.text.default" lineHeight="1.25">
        {label}
      </Text>
    </Flex>
  );
}

export default function QuickLinks({ showGenerateStatement }: { showGenerateStatement?: boolean }) {
  return (
    <Box as="section" mt="24">
      <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="12">
        Quick links
      </Heading>
      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, minmax(0, 1fr))" }} gap="10">
        <QuickLink to="/profile?section=beneficiary&add=1" icon={<Users size={18} />} label="Add beneficiary" />
        <QuickLink to="/reports" icon={<FileText size={18} />} label="My documents" />
        <QuickLink to="/portfolio" icon={<LineChart size={18} />} label="My portfolio" />
        {showGenerateStatement && (
          <QuickLink
            to="/reports"
            state={{ openStatement: true }}
            icon={<FileSpreadsheet size={18} />}
            label="Generate statement"
          />
        )}
      </Grid>
      <Text
        as={RouterLink}
        to="/risk-questionnaire"
        display="inline-block"
        mt="12"
        fontSize="xs"
        fontWeight="600"
        color="brand.text.primaryDefault"
        textDecoration="underline"
        _hover={{ color: "brand.text.primaryHover" }}
      >
        Investment style questionnaire
      </Text>
    </Box>
  );
}
