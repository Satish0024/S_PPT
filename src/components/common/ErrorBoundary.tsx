import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Button } from "../ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Flex minH="100vh" align="center" justify="center" p="24" bg="neutral.surface.layer02">
        <Box
          maxW="480px"
          w="100%"
          bg="neutral.surface.layer01"
          borderWidth="1px"
          borderColor="neutral.border.subtle"
          borderRadius="xl"
          p="32"
          boxShadow="elevation.01"
        >
          <Heading fontSize="xl" fontWeight="700" color="neutral.text.default" mb="8">
            Something went wrong
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="24">
            An unexpected error occurred while rendering this page. You can try reloading, or return to the dashboard.
          </Text>
          <Flex gap="12" wrap="wrap">
            <Button
              bg="brand.background.primaryStrong"
              color="brand.text.primaryOncolor"
              _hover={{ bg: "brand.background.primaryHover" }}
              onClick={() => window.location.assign("/")}
            >
              Go to dashboard
            </Button>
            <Button variant="outline" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
          </Flex>
        </Box>
      </Flex>
    );
  }
}
