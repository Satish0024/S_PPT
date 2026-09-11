import { Box, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box textAlign="center" py="64" px="16">
      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="8">
        Page not found
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="24">
        The page you are looking for does not exist or has been moved.
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
