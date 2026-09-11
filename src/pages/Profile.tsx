import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge, Box, Flex, Grid, Heading, Image, Input, Table, Text } from "@chakra-ui/react";
import { FormSelect } from "../components/ui/form-select";
import { Heart, Landmark, Briefcase, Tags, Users, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { useParticipant } from "../context/ParticipantContext";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- pure logic ported as-is from the prototype
import {
  ACCOUNT_TYPES,
  PROFILE_SECTIONS,
  CLASS_TABS,
  RELATIONSHIPS,
  ageLabel,
  emptyBeneficiary,
  fullSsn,
  loadProfile,
  maskSsn,
  saveBeneficiaries,
  saveProfileSection,
} from "../lib/profileDetails.js";

const NAV = [
  { id: "personal", label: "Personal Details", icon: Heart },
  { id: "bank", label: "Bank Details", icon: Landmark },
  { id: "employment", label: "Employment Information", icon: Briefcase },
  { id: "classification", label: "Employee Classification", icon: Tags },
  { id: "beneficiary", label: "Beneficiary Details", icon: Users },
];

const EDITABLE = new Set(["personal", "bank", "employment"]);

function Row({ label, value, hint, children }: { label: string; value?: string; hint?: string; children?: React.ReactNode }) {
  const empty = value == null || String(value).trim() === "";
  return (
    <Flex
      justify="space-between"
      gap="16"
      py="10"
      borderBottomWidth="1px"
      borderColor="neutral.border.subtle"
      fontSize="sm"
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "flex-start" }}
    >
      <Text color="neutral.text.subtle" flexShrink={0}>
        {label}
      </Text>
      <Box textAlign={{ base: "left", sm: "right" }}>
        {children || (
          <Text fontWeight="600" color={empty ? "neutral.text.subtle" : "neutral.text.default"}>
            {empty ? "—" : value}
          </Text>
        )}
        {hint && (
          <Text fontSize="xs" color="neutral.text.subtle">
            {hint}
          </Text>
        )}
      </Box>
    </Flex>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg" p="16" mb="16">
      <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="8">
        {title}
      </Heading>
      {children}
    </Box>
  );
}

function formatAddress(p: any) {
  return [p.address1, p.address2, p.address3, [p.city, p.state, p.zip].filter(Boolean).join(", "), p.country].filter(Boolean);
}

function formatPhone(country?: string, number?: string) {
  if (!number) return "";
  return `${country || "+1"} ${number}`.trim();
}

function EditActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <Flex gap="8" mt="16" justify="flex-end">
      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" bg="brand.background.primaryStrong" color="brand.text.primaryOncolor" _hover={{ bg: "brand.background.primaryHover" }} onClick={onSave}>
        Save
      </Button>
    </Flex>
  );
}

function PersonalView({ data, showSsn, onToggleSsn }: { data: any; showSsn: boolean; onToggleSsn: () => void }) {
  const p = data;
  const age = ageLabel(p.dob);
  const address = formatAddress(p);
  const fullName = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
  return (
    <>
      <SectionCard title="About You">
        <Row label="Name" value={fullName} />
        <Row label="Gender" value={p.gender} />
        <Row label="Marital Status" value={p.maritalStatus} />
        <Row label="Date Of Birth" value={p.dob} hint={age} />
        <Row label="SSN">
          <Flex align="center" gap="8" justify="flex-end">
            <Text fontWeight="600">{showSsn ? fullSsn(p.ssn) : maskSsn(p.ssn)}</Text>
            <Box as="button" aria-label={showSsn ? "Hide SSN" : "Show SSN"} onClick={onToggleSsn} color="neutral.text.subtle">
              {showSsn ? <EyeOff size={14} /> : <Eye size={14} />}
            </Box>
          </Flex>
        </Row>
      </SectionCard>
      <SectionCard title="Contact">
        <Row label="Email" value={p.email} />
        <Row label="Primary Phone" value={formatPhone(p.phoneCountry, p.phone)} />
        {p.phone2 && <Row label="Secondary Phone" value={formatPhone(p.phone2Country, p.phone2)} />}
        <Row label="Address">
          {address.length ? (
            <Box textAlign="right">
              {address.map((line: string) => (
                <Text key={line} fontWeight="600">
                  {line}
                </Text>
              ))}
            </Box>
          ) : (
            <Text color="neutral.text.subtle">—</Text>
          )}
        </Row>
      </SectionCard>
    </>
  );
}

function PersonalEdit({ draft, onChange }: { draft: any; onChange: (patch: any) => void }) {
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [key]: e.target.value });
  return (
    <>
      <SectionCard title="About You">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="12" mb="12">
          <Field label="First name">
            <Input value={draft.firstName || ""} onChange={set("firstName")} />
          </Field>
          <Field label="Middle name">
            <Input value={draft.middleName || ""} onChange={set("middleName")} />
          </Field>
          <Field label="Last name">
            <Input value={draft.lastName || ""} onChange={set("lastName")} />
          </Field>
          <Field label="Gender">
            <FormSelect
              value={draft.gender || ""}
              onChange={(v) => onChange({ gender: v })}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Non-binary", value: "Non-binary" },
                { label: "Prefer not to say", value: "Prefer not to say" },
              ]}
            />
          </Field>
          <Field label="Marital status">
            <FormSelect
              value={draft.maritalStatus || ""}
              onChange={(v) => onChange({ maritalStatus: v })}
              options={[
                { label: "Single", value: "Single" },
                { label: "Married", value: "Married" },
                { label: "Divorced", value: "Divorced" },
                { label: "Widowed", value: "Widowed" },
              ]}
            />
          </Field>
          <Field label="Date of birth">
            <Input value={draft.dob || ""} onChange={set("dob")} />
          </Field>
        </Grid>
      </SectionCard>
      <SectionCard title="Contact">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="12">
          <Field label="Email">
            <Input type="email" value={draft.email || ""} onChange={set("email")} />
          </Field>
          <Field label="Primary phone">
            <Input value={draft.phone || ""} onChange={set("phone")} />
          </Field>
          <Field label="Address line 1">
            <Input value={draft.address1 || ""} onChange={set("address1")} />
          </Field>
          <Field label="Address line 2">
            <Input value={draft.address2 || ""} onChange={set("address2")} />
          </Field>
          <Field label="City">
            <Input value={draft.city || ""} onChange={set("city")} />
          </Field>
          <Field label="State">
            <Input value={draft.state || ""} onChange={set("state")} />
          </Field>
          <Field label="ZIP">
            <Input value={draft.zip || ""} onChange={set("zip")} />
          </Field>
          <Field label="Country">
            <Input value={draft.country || ""} onChange={set("country")} />
          </Field>
        </Grid>
      </SectionCard>
    </>
  );
}

function BankView({ data }: { data: any }) {
  const b = data;
  if (!b.hasBank) {
    return (
      <Text fontSize="sm" color="neutral.text.subtle" py="16">
        No bank information is on file.
      </Text>
    );
  }
  return (
    <SectionCard title="Account">
      <Row label="Account Holder" value={b.holderName} />
      <Row label="Bank Name" value={b.bankName} />
      <Row label="Account Type" value={b.accountType} />
      <Row label="Account Number" value={b.accountNumber} />
      <Row label="ABA Routing Number" value={b.routing} />
    </SectionCard>
  );
}

function BankEdit({ draft, onChange }: { draft: any; onChange: (patch: any) => void }) {
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [key]: e.target.value });
  return (
    <SectionCard title="Account">
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="12">
        <Field label="Account holder">
          <Input value={draft.holderName || ""} onChange={set("holderName")} />
        </Field>
        <Field label="Bank name">
          <Input value={draft.bankName || ""} onChange={set("bankName")} />
        </Field>
        <Field label="Account type">
          <FormSelect
            value={draft.accountType || "Checking"}
            onChange={(v) => onChange({ accountType: v })}
            options={ACCOUNT_TYPES.map((t: string) => ({ label: t, value: t }))}
          />
        </Field>
        <Field label="Account number">
          <Input value={draft.accountNumber || ""} onChange={set("accountNumber")} />
        </Field>
        <Field label="ABA routing number">
          <Input value={draft.routing || ""} onChange={set("routing")} />
        </Field>
      </Grid>
    </SectionCard>
  );
}

function Flag({ label, on }: { label: string; on?: string }) {
  const isYes = on === "Yes";
  return (
    <Flex align="center" justify="space-between" py="8" borderBottomWidth="1px" borderColor="neutral.border.subtle" fontSize="sm">
      <Text color="neutral.text.subtle">{label}</Text>
      <Badge colorPalette={isYes ? "green" : "gray"} bg={isYes ? "semantics.success.backgroundLight" : "neutral.surface.layer02"} color={isYes ? "semantics.success.text" : "neutral.text.subtle"}>
        {on || "No"}
      </Badge>
    </Flex>
  );
}

function EmploymentView({ data }: { data: any }) {
  const e = data;
  return (
    <>
      <SectionCard title="Job">
        <Row label="Payroll Frequency" value={e.payrollFrequency} />
        <Row label="Date Of Hire" value={e.hireDate} />
        <Row label="Ownership %" value={e.ownership} />
      </SectionCard>
      <SectionCard title="Rehire">
        <Row label="Most Recent Rehire" value={e.rehireDate} />
        <Row label="Most Recent Term" value={e.termDate} />
      </SectionCard>
      <SectionCard title="Status Flags">
        <Flag label="QDRO" on={e.qdro} />
        <Flag label="Family Member Of Owner" on={e.familyMember} />
        <Flag label="Officer" on={e.officer} />
        <Flag label="HCE" on={e.hce} />
        <Flag label="Key Employee" on={e.keyEmployee} />
        <Flag label="Insider / Restricted" on={e.insider} />
      </SectionCard>
    </>
  );
}

function EmploymentEdit({ draft, onChange }: { draft: any; onChange: (patch: any) => void }) {
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [key]: e.target.value });
  const yesNo = ["No", "Yes"];
  return (
    <>
      <SectionCard title="Job">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="12">
          <Field label="Payroll frequency">
            <FormSelect
              value={draft.payrollFrequency || ""}
              onChange={(v) => onChange({ payrollFrequency: v })}
              options={[
                { label: "Weekly", value: "Weekly" },
                { label: "Biweekly", value: "Biweekly" },
                { label: "Semi-Monthly", value: "Semi-Monthly" },
                { label: "Monthly", value: "Monthly" },
              ]}
            />
          </Field>
          <Field label="Date of hire">
            <Input value={draft.hireDate || ""} onChange={set("hireDate")} />
          </Field>
          <Field label="Ownership %">
            <Input value={draft.ownership || ""} onChange={set("ownership")} />
          </Field>
        </Grid>
      </SectionCard>
      <SectionCard title="Rehire">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="12">
          <Field label="Most recent rehire">
            <Input value={draft.rehireDate || ""} onChange={set("rehireDate")} />
          </Field>
          <Field label="Most recent term">
            <Input value={draft.termDate || ""} onChange={set("termDate")} />
          </Field>
        </Grid>
      </SectionCard>
      <SectionCard title="Status Flags">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="12">
          {(["qdro", "familyMember", "officer", "hce", "keyEmployee", "insider"] as const).map((key) => (
            <Field key={key} label={key === "familyMember" ? "Family member of owner" : key === "keyEmployee" ? "Key employee" : key === "insider" ? "Insider / restricted" : key.toUpperCase()}>
              <FormSelect
                value={draft[key] || "No"}
                onChange={(v) => onChange({ [key]: v })}
                options={yesNo.map((v) => ({ label: v, value: v }))}
              />
            </Field>
          ))}
        </Grid>
      </SectionCard>
    </>
  );
}

function ClassificationView({ data }: { data: any }) {
  const [tab, setTab] = useState(CLASS_TABS[0]);
  const row = data[tab] || data.Location;
  return (
    <>
      <Flex gap="4" mb="16" role="tablist">
        {CLASS_TABS.map((name: string) => (
          <Box
            as="button"
            key={name}
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            px="12"
            py="6"
            borderRadius="sm"
            fontSize="sm"
            fontWeight="600"
            bg={tab === name ? "brand.background.primaryStrong" : "neutral.surface.layer02"}
            color={tab === name ? "brand.text.primaryOncolor" : "neutral.text.subtle"}
          >
            {name}
          </Box>
        ))}
      </Flex>
      <SectionCard title="Current">
        <Row label="Type" value={row.type} />
        <Row label="Code" value={row.code} />
        <Row label="Name" value={row.name} />
        <Row label="Start Date" value={row.start} />
        <Row label="End Date" value={row.end} />
      </SectionCard>
      <SectionCard title="History">
        <Box overflowX="auto">
          <Table.Root size="sm" variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Code</Table.ColumnHeader>
                <Table.ColumnHeader>Start date</Table.ColumnHeader>
                <Table.ColumnHeader>End date</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(row.history || []).map((item: any, i: number) => (
                <Table.Row key={`${item.code}-${i}`}>
                  <Table.Cell>{item.type}</Table.Cell>
                  <Table.Cell>{item.code}</Table.Cell>
                  <Table.Cell>{item.start || "—"}</Table.Cell>
                  <Table.Cell>{item.end || "—"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </SectionCard>
    </>
  );
}

function BeneficiaryTable({ primary, contingent }: { primary: any[]; contingent: any[] }) {
  const rows = [...primary.map((r) => ({ ...r, group: "Primary" })), ...contingent.map((r) => ({ ...r, group: "Contingent" }))];
  if (!rows.length) {
    return (
      <Text fontSize="sm" color="neutral.text.subtle" py="16">
        No beneficiaries on file.
      </Text>
    );
  }
  return (
    <Box overflowX="auto">
      <Table.Root size="sm" variant="line">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Relationship</Table.ColumnHeader>
            <Table.ColumnHeader>Share</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell>
                <Badge bg={row.group === "Primary" ? "brand.background.primaryLight" : "neutral.surface.layer02"} color={row.group === "Primary" ? "brand.text.primaryDefault" : "neutral.text.subtle"}>
                  {row.group}
                </Badge>
              </Table.Cell>
              <Table.Cell fontWeight="600" color="brand.text.primaryDefault">
                {row.name}
              </Table.Cell>
              <Table.Cell>{row.relationship || "—"}</Table.Cell>
              <Table.Cell>{row.share}%</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

function BeneficiaryForm({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: any;
  onChange: (patch: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [key]: e.target.value });
  return (
    <Box bg="neutral.surface.layer02" borderRadius="md" p="16" mb="16">
      <Heading fontSize="sm" fontWeight="700" color="neutral.text.default" mb="12">
        Add beneficiary
      </Heading>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap="12" mb="12">
        <Field label="Name" required>
          <Input value={draft.name || ""} onChange={set("name")} />
        </Field>
        <Field label="Relationship" required>
          <FormSelect
            value={draft.relationship || "Non-Spouse"}
            onChange={(v) => onChange({ relationship: v })}
            options={RELATIONSHIPS.map((r: string) => ({ label: r, value: r }))}
          />
        </Field>
        <Field label="Share %" required>
          <Input type="number" min={1} max={100} value={draft.share ?? ""} onChange={set("share")} />
        </Field>
      </Grid>
      <Field label="Type" mb="12">
        <FormSelect
          value={draft.type || "Primary"}
          onChange={(v) => onChange({ type: v })}
          options={[
            { label: "Primary", value: "Primary" },
            { label: "Contingent", value: "Contingent" },
          ]}
        />
      </Field>
      <EditActions onSave={onSave} onCancel={onCancel} />
    </Box>
  );
}

export default function Profile() {
  const { participant } = useParticipant();
  const [params, setParams] = useSearchParams();
  const section = PROFILE_SECTIONS.some((s: any) => s.id === params.get("section")) ? params.get("section")! : "personal";
  const [record, setRecord] = useState(() => loadProfile(participant));
  const [showSsn, setShowSsn] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [addingBene, setAddingBene] = useState(false);
  const [beneDraft, setBeneDraft] = useState<any>(() => emptyBeneficiary());

  useEffect(() => {
    setRecord(loadProfile(participant));
    setShowSsn(false);
    setEditing(null);
    setDraft(null);
    setAddingBene(false);
  }, [participant.id]);

  useEffect(() => {
    if (section === "beneficiary" && params.get("add") === "1") {
      setAddingBene(true);
      setBeneDraft({ ...emptyBeneficiary(), share: "" });
      const next = new URLSearchParams(params);
      next.delete("add");
      setParams(next, { replace: true });
    }
  }, [section, params, setParams]);

  const go = (id: string) => {
    setEditing(null);
    setDraft(null);
    setAddingBene(false);
    const next = new URLSearchParams();
    next.set("section", id);
    setParams(next, { replace: true });
  };

  const startEdit = () => {
    if (!EDITABLE.has(section)) return;
    setDraft({ ...record[section as keyof typeof record] });
    setEditing(section);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft(null);
    setRecord(loadProfile(participant));
  };

  const saveEdit = () => {
    if (!editing || !draft) return;
    saveProfileSection(participant.id, editing, draft);
    setRecord(loadProfile(participant));
    setEditing(null);
    setDraft(null);
  };

  const saveBene = () => {
    const name = String(beneDraft.name || "").trim();
    const share = Math.max(0, Math.min(100, Number(beneDraft.share) || 0));
    if (!name || share <= 0) return;
    const entry = {
      id: `new-${Date.now()}`,
      name,
      relationship: beneDraft.relationship || "Non-Spouse",
      share,
      order: (beneDraft.type === "Contingent" ? record.beneficiaries.contingent : record.beneficiaries.primary).length + 1,
      type: beneDraft.type || "Primary",
    };
    const next =
      entry.type === "Contingent"
        ? { primary: record.beneficiaries.primary, contingent: [...record.beneficiaries.contingent, entry] }
        : { primary: [...record.beneficiaries.primary, entry], contingent: record.beneficiaries.contingent };
    saveBeneficiaries(participant.id, next);
    setRecord(loadProfile(participant));
    setAddingBene(false);
    setBeneDraft(emptyBeneficiary());
  };

  const fullName = [record.personal.firstName, record.personal.middleName, record.personal.lastName].filter(Boolean).join(" ");
  const isEditing = editing === section;

  return (
    <>
      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="4">
        Profile details
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="16">
        Manage personal, employment, bank and beneficiary details
      </Text>

      <Grid templateColumns={{ base: "1fr", md: "240px 1fr" }} gap="16" alignItems="start">
        <Box
          as="nav"
          aria-label="Profile sections"
          bg="neutral.surface.layer01"
          borderWidth="1px"
          borderColor="neutral.border.subtle"
          borderRadius="xl"
          p="10"
          display="flex"
          flexDirection="column"
          gap="4"
        >
          {NAV.map((item) => {
            const IconCmp = item.icon;
            const active = section === item.id;
            return (
              <Flex
                as="button"
                key={item.id}
                onClick={() => go(item.id)}
                align="center"
                gap="10"
                w="full"
                p="12"
                borderRadius="md"
                bg={active ? "brand.background.primarySubtle" : "transparent"}
                color={active ? "brand.text.primaryDefault" : "neutral.text.subtle"}
                fontWeight={active ? "600" : "500"}
                fontSize="sm"
                textAlign="left"
              >
                <IconCmp size={16} />
                {item.label}
              </Flex>
            );
          })}
        </Box>

        <Box>
          <Box bg="neutral.surface.layer01" borderWidth="1px" borderColor="neutral.border.subtle" borderRadius="lg" p="16">
            {section === "personal" && (
              <Flex gap="16" align="center" wrap="wrap" mb="16" pb="16" borderBottomWidth="1px" borderColor="neutral.border.subtle">
                <Image src={participant.avatar} alt="" boxSize="56px" borderRadius="full" />
                <Box flex="1">
                  <Flex align="center" gap="8">
                    <Heading fontSize="lg" color="neutral.text.default">
                      {fullName}
                    </Heading>
                    <Badge bg="semantics.success.backgroundLight" color="semantics.success.text">
                      <Check size={12} /> Active
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" color="neutral.text.subtle">
                    {record.personal.company}
                  </Text>
                  <Text fontSize="xs" color="neutral.text.subtle">
                    Employee ID {record.personal.employeeId} · {ageLabel(record.personal.dob)}
                  </Text>
                </Box>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={startEdit}>
                    Edit
                  </Button>
                )}
              </Flex>
            )}
            {section !== "personal" && (
              <Flex justify="space-between" align="center" mb="16">
                <Heading fontSize="lg" color="neutral.text.default">
                  {NAV.find((n) => n.id === section)?.label}
                </Heading>
                {section === "beneficiary" ? (
                  !addingBene && (
                    <Button
                      size="sm"
                      bg="brand.background.primaryStrong"
                      color="brand.text.primaryOncolor"
                      _hover={{ bg: "brand.background.primaryHover" }}
                      onClick={() => {
                        setBeneDraft({ ...emptyBeneficiary(), share: "" });
                        setAddingBene(true);
                      }}
                    >
                      Add Beneficiary
                    </Button>
                  )
                ) : EDITABLE.has(section) && !isEditing ? (
                  <Button variant="outline" size="sm" onClick={startEdit}>
                    Edit
                  </Button>
                ) : null}
              </Flex>
            )}

            {section === "personal" &&
              (isEditing && draft ? (
                <>
                  <PersonalEdit draft={draft} onChange={(patch) => setDraft((d: any) => ({ ...d, ...patch }))} />
                  <EditActions onSave={saveEdit} onCancel={cancelEdit} />
                </>
              ) : (
                <PersonalView data={record.personal} showSsn={showSsn} onToggleSsn={() => setShowSsn((v) => !v)} />
              ))}
            {section === "bank" &&
              (isEditing && draft ? (
                <>
                  <BankEdit draft={draft} onChange={(patch) => setDraft((d: any) => ({ ...d, ...patch, hasBank: true }))} />
                  <EditActions onSave={saveEdit} onCancel={cancelEdit} />
                </>
              ) : (
                <BankView data={record.bank} />
              ))}
            {section === "employment" &&
              (isEditing && draft ? (
                <>
                  <EmploymentEdit draft={draft} onChange={(patch) => setDraft((d: any) => ({ ...d, ...patch }))} />
                  <EditActions onSave={saveEdit} onCancel={cancelEdit} />
                </>
              ) : (
                <EmploymentView data={record.employment} />
              ))}
            {section === "classification" && <ClassificationView data={record.classifications} />}
            {section === "beneficiary" && (
              <>
                {addingBene && (
                  <BeneficiaryForm
                    draft={beneDraft}
                    onChange={(patch) => setBeneDraft((d: any) => ({ ...d, ...patch }))}
                    onSave={saveBene}
                    onCancel={() => {
                      setAddingBene(false);
                      setBeneDraft(emptyBeneficiary());
                    }}
                  />
                )}
                <BeneficiaryTable primary={record.beneficiaries.primary} contingent={record.beneficiaries.contingent} />
              </>
            )}
          </Box>
        </Box>
      </Grid>
    </>
  );
}
