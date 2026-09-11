import { Box, Heading, Text } from "@chakra-ui/react";
import { Construction } from "lucide-react";

// Placeholder kept only for any residual unfinished routes. Transaction
// wizards, enrollment, risk questionnaire, and enrich are now implemented.
export default function ComingSoon({ title }: { title: string }) {
  return (
    <Box textAlign="center" py="64" color="neutral.text.subtle">
      <Box mb="12" display="flex" justifyContent="center">
        <Construction size={32} />
      </Box>
      <Heading fontSize="lg" color="neutral.text.default" mb="4">
        {title}
      </Heading>
      <Text fontSize="sm">This flow is being ported from the prototype next.</Text>
    </Box>
  );
}
