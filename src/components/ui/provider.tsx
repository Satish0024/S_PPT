import { ChakraProvider } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { system } from "../../theme/system";
import { ColorModeProvider } from "./color-mode";
import { Toaster } from "./toaster";

export function Provider({ children }: PropsWithChildren) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
        <Toaster />
      </ColorModeProvider>
    </ChakraProvider>
  );
}
