import { Flex, Link, Text } from "@chakra-ui/react";
import { BRAND } from "../config/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Flex
      as="footer"
      align="center"
      justify="space-between"
      wrap="wrap"
      gap="8"
      px={{ base: "16", md: "24" }}
      py="12"
      bg="neutral.surface.layer01"
      borderTopWidth="1px"
      borderColor="neutral.border.subtle"
      fontSize="sm"
      color="neutral.text.subtle"
    >
      <Text>
        &copy; {year} {BRAND.name}.
      </Text>
      <Flex gap="16" as="nav" aria-label="Legal">
        <Link href={`mailto:${BRAND.supportEmail}`} color="neutral.text.subtle">
          Privacy
        </Link>
        <Link href={`mailto:${BRAND.supportEmail}`} color="neutral.text.subtle">
          Terms
        </Link>
      </Flex>
    </Flex>
  );
}
