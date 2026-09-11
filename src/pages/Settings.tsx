import { useState } from "react";
import { Box, Checkbox, Flex, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { Sun, Moon, Monitor, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { toaster } from "../components/ui/toaster";
import { useTheme } from "../context/ThemeContext";

const APPEARANCE = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "Match device", icon: Monitor },
];

function SettingsBlock({ title, lede, children }: { title: string; lede: string; children: React.ReactNode }) {
  return (
    <Box as="section" bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg" p="16" mb="16">
      <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="4">
        {title}
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="16">
        {lede}
      </Text>
      {children}
    </Box>
  );
}

export default function Settings() {
  const { preference, setPreference } = useTheme();
  const [notifyTx, setNotifyTx] = useState(true);
  const [notifyStatement, setNotifyStatement] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toaster.create({ title: "Password updated", type: "success" });
  };

  return (
    <>
      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="4">
        Settings
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="16">
        Manage how the app looks, sign-in, and notifications.
      </Text>

      <SettingsBlock title="Appearance" lede="Choose how the participant portal looks on this device.">
        <Flex gap="8" wrap="wrap" role="radiogroup" aria-label="Appearance">
          {APPEARANCE.map((opt) => {
            const IconCmp = opt.icon;
            const active = preference === opt.id;
            return (
              <Flex
                as="button"
                key={opt.id}
                role="radio"
                aria-checked={active}
                onClick={() => setPreference(opt.id as any)}
                align="center"
                gap="8"
                px="16"
                py="10"
                borderRadius="md"
                borderWidth="1px"
                borderColor={active ? "brand.border.primaryDefault" : "neutral.border.default"}
                bg={active ? "brand.background.primaryLight" : "neutral.surface.layer01"}
                color={active ? "brand.text.primaryDefault" : "neutral.text.subtle"}
                fontSize="sm"
                fontWeight="600"
              >
                <IconCmp size={18} />
                {opt.label}
              </Flex>
            );
          })}
        </Flex>
      </SettingsBlock>

      <SettingsBlock title="Notifications" lede="Choose what LendGuard emails you about.">
        <Stack gap="16">
          <Checkbox.Root checked={notifyTx} onCheckedChange={(d) => setNotifyTx(!!d.checked)}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              <Text fontWeight="600" color="neutral.text.default">
                Transaction confirmations
              </Text>
              <Text fontSize="xs" color="neutral.text.subtle">
                Get an email when a deferral, loan, or transfer request is submitted or processed.
              </Text>
            </Checkbox.Label>
          </Checkbox.Root>
          <Checkbox.Root checked={notifyStatement} onCheckedChange={(d) => setNotifyStatement(!!d.checked)}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              <Text fontWeight="600" color="neutral.text.default">
                Statement ready
              </Text>
              <Text fontSize="xs" color="neutral.text.subtle">
                Get an email when a new periodic statement is available to download.
              </Text>
            </Checkbox.Label>
          </Checkbox.Root>
        </Stack>
      </SettingsBlock>

      <SettingsBlock title="Login & security" lede="Update the password you use to sign in.">
        <form onSubmit={updatePassword}>
          <Stack gap="12" maxW="formMaxW">
            <Field label="Current password" required>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </Field>
            <Field label="New password" required helperText="At least 8 characters.">
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
            <Field label="Confirm new password" required>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Field>
            {error && (
              <Text fontSize="sm" color="semantics.critical.text">
                {error}
              </Text>
            )}
            <Button type="submit" alignSelf="flex-start" bg="brand.background.primaryStrong" color="brand.text.primaryOncolor" _hover={{ bg: "brand.background.primaryHover" }}>
              <Lock size={14} />
              Update password
            </Button>
          </Stack>
        </form>
      </SettingsBlock>
    </>
  );
}
