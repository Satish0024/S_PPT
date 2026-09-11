import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  Menu,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Mail, Lock, FlaskConical } from "lucide-react";
import { Field } from "../components/ui/field";
import { PasswordInput } from "../components/ui/password-input";
import { DarkMode } from "../components/ui/color-mode";
import { useParticipant } from "../context/ParticipantContext";
import { BRAND } from "../config/brand";
import { DEMO_PASSWORD } from "../data/participants.js";

export default function Login() {
  const { login, participants } = useParticipant();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      setError("Email or password is incorrect.");
      return;
    }
    navigate("/", { replace: true });
  };

  const pickDemoUser = (p: any) => {
    if (login(p.profile.email, DEMO_PASSWORD)) navigate("/", { replace: true });
  };

  return (
    <Flex minH="100vh">
      {/* Brand pane */}
      <Box
        w={{ base: "0", md: "45%" }}
        flexShrink={0}
        display={{ base: "none", md: "block" }}
        bgGradient="to-br"
        gradientFrom="brand.background.primaryLight"
        gradientTo="brand.background.ctaHover"
        position="relative"
        overflow="hidden"
        p="32"
      >
        <Box
          aria-hidden
          position="absolute"
          inset="0"
          opacity={0.55}
          bgImage="radial-gradient(80% 50% at 80% 10%, var(--core-colors-brand-overlay-login-radial), transparent 55%), radial-gradient(60% 40% at 10% 80%, var(--core-colors-brand-overlay-login-accent), transparent 50%)"
        />
        <Stack gap="16" maxW="loginBrandMaxW" position="absolute" bottom="32" left="32">
          <Image src={BRAND.logo} alt="" h="logoHeight" w="auto" maxH="logoHeight" objectFit="contain" />
          <Heading fontSize="3xl" color="brand.text.primaryActive" lineHeight="1.2">
            {BRAND.tagline}
          </Heading>
          <Text fontSize="base" color="brand.text.primaryActive" opacity={0.85}>
            {BRAND.taglineBody}
          </Text>
        </Stack>
      </Box>

      {/* Sign-in pane — always dark brand chrome, independent of the app's
          light/dark preference (the reference has no theme toggle here). */}
      <Flex flex="1" align="center" justify="center" bg="neutral.900" p={{ base: "16", md: "24" }}>
        <DarkMode
          display="block"
          w="full"
          maxW="loginFormMaxW"
          bg="neutral.surface.layer01"
          borderWidth="1px"
          borderColor="neutral.border.subtle"
          borderRadius="lg"
          p="24"
          boxShadow="elevation.02"
        >
          <Image src={BRAND.logoOnDark || BRAND.logo} alt={BRAND.name} h="logoHeight" mb="16" />
          <Heading fontSize="xl" color="neutral.text.default" mb="4">
            Sign in
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="16">
            Use your participant email to continue.
          </Text>

          <form onSubmit={submit}>
            <Stack gap="12">
              <Field label="Email">
                <InputGroup startElement={<Mail size={16} />}>
                  <Input
                    type="email"
                    autoComplete="username"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                  />
                </InputGroup>
              </Field>
              <Field label="Password">
                <InputGroup startElement={<Lock size={16} />}>
                  <PasswordInput
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                  />
                </InputGroup>
              </Field>
              {error && (
                <Text fontSize="sm" color="semantics.critical.text">
                  {error}
                </Text>
              )}
              <Button type="submit" bg="brand.background.primaryStrong" color="brand.text.primaryOncolor" _hover={{ bg: "brand.background.primaryHover" }} size="lg">
                Sign in
              </Button>
            </Stack>
          </form>
        </DarkMode>
      </Flex>

      {/* Prototype-only demo scenario picker */}
      <Box position="fixed" bottom="16" right="16" zIndex="popover">
        <Menu.Root positioning={{ placement: "top-end" }}>
          <Menu.Trigger asChild>
            <Button size="sm" bg="neutral.surface.highContrast" color="neutral.text.onColor" borderRadius="full" boxShadow="elevation.02">
              <FlaskConical size={14} />
              Prototype demo — try a participant
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="260px" maxH="320px" overflowY="auto">
                {participants.map((p: any) => (
                  <Menu.Item key={p.id} value={p.id} onClick={() => pickDemoUser(p)}>
                    <Avatar.Root size="xs">
                      <Avatar.Image src={p.avatar} alt="" />
                      <Avatar.Fallback name={p.name} />
                    </Avatar.Root>
                    <Stack gap="0">
                      <Text fontSize="sm" fontWeight="600">
                        {p.name}
                      </Text>
                      <Text fontSize="xs" color="neutral.text.subtle">
                        {p.scenario}
                      </Text>
                    </Stack>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Box>
    </Flex>
  );
}
