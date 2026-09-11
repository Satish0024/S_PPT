import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { FormSelect } from "../components/ui/form-select";
import { Download, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../components/ui/dialog";
import { toaster } from "../components/ui/toaster";
import { useParticipant } from "../context/ParticipantContext";
import { DOCUMENT_TYPES, PLAN_DOCS, STATEMENTS } from "../data/documents.js";
import { downloadDocumentFile } from "../lib/downloadDocument.js";
import { addGeneratedStatement, getGeneratedStatements } from "../lib/generatedStatements.js";

const PERIODS = ["Q1 2026", "Q4 2025", "Q3 2025", "Q2 2025"];

export default function Reports() {
  const { participant } = useParticipant();
  const location = useLocation();
  const navigate = useNavigate();
  const [generated, setGenerated] = useState(() => getGeneratedStatements(participant.id));
  const statements = (STATEMENTS as Record<string, any[]>)[participant.id] || [];
  const allDocs = useMemo(
    () => [...generated, ...PLAN_DOCS, ...statements],
    [generated, statements],
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const planOptions = useMemo(
    () => (participant.plans || []).map((p: { name: string }) => p.name).filter(Boolean),
    [participant.plans],
  );
  const [genPlan, setGenPlan] = useState(planOptions[0] || "");
  const [genPeriod, setGenPeriod] = useState(PERIODS[0]);

  useEffect(() => {
    setGenerated(getGeneratedStatements(participant.id));
  }, [participant.id]);

  useEffect(() => {
    if ((location.state as { openStatement?: boolean })?.openStatement) {
      setOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (planOptions.length && !planOptions.includes(genPlan)) {
      setGenPlan(planOptions[0]);
    }
  }, [planOptions, genPlan]);

  const plans = useMemo(() => [...new Set(allDocs.map((d: any) => d.plan))], [allDocs]);

  const rows = allDocs.filter((d: any) => {
    const typeOk = typeFilter === "all" || d.type === typeFilter;
    const planOk = planFilter === "all" || d.plan === planFilter;
    const searchOk = !search.trim() || d.name?.toLowerCase().includes(search.trim().toLowerCase());
    return typeOk && planOk && searchOk;
  });

  const handleDownload = (doc: any) => {
    try {
      downloadDocumentFile(doc);
      toaster.create({ title: "Download started", description: doc.name, type: "success" });
    } catch (err: any) {
      toaster.create({ title: "Download failed", description: err.message, type: "error" });
    }
  };

  const handleGenerate = () => {
    try {
      const doc = addGeneratedStatement(participant.id, {
        planName: genPlan,
        periodLabel: genPeriod,
      });
      setGenerated(getGeneratedStatements(participant.id));
      setOpen(false);
      toaster.create({
        title: "Statement generated",
        description: doc.name,
        type: "success",
      });
    } catch (err: any) {
      toaster.create({ title: "Could not generate", description: err.message, type: "error" });
    }
  };

  return (
    <>
      {/* Page header */}
      <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="4">
        Documents
      </Heading>
      <Text fontSize="sm" color="neutral.text.subtle" mb="20">
        Access, download, and generate important plan documents and disclosures
      </Text>

      {/* Single-row filter toolbar — matches live */}
      <Box
        bg="neutral.surface.layer01"
        borderWidth="1px"
        borderColor="neutral.border.subtle"
        borderRadius="lg"
        p="16"
        mb="0"
      >
        <Flex gap="10" align="center" wrap="wrap">
          {/* Search */}
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle" mb="4">Search</Text>
            <Input
              placeholder="Document name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="neutral.surface.layer01"
              borderColor="neutral.border.subtle"
              borderRadius="md"
              fontSize="sm"
              px="10"
              py="6"
              h="38px"
              w="178px"
              aria-label="Search"
            />
          </Box>

          {/* Plan Name/ID */}
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle" mb="4">Plan Name/ID</Text>
            <FormSelect
              aria-label="Filter by plan"
              size="sm"
              width="170px"
              value={planFilter}
              onChange={setPlanFilter}
              options={[
                { label: "All", value: "all" },
                ...plans.map((p) => ({ label: String(p), value: String(p) })),
              ]}
            />
          </Box>

          {/* Document Type */}
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle" mb="4">Document Type</Text>
            <FormSelect
              aria-label="Filter by document type"
              size="sm"
              width="170px"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { label: "All", value: "all" },
                ...DOCUMENT_TYPES.map((t: string) => ({ label: t, value: t })),
              ]}
            />
          </Box>

          {/* Documented from */}
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle" mb="4">Documented from</Text>
            <Input
              type="date"
              bg="neutral.surface.layer01"
              borderColor="neutral.border.subtle"
              borderRadius="md"
              fontSize="sm"
              px="10"
              py="6"
              h="38px"
              w="150px"
              aria-label="Documented from"
            />
          </Box>

          {/* Documented to */}
          <Box>
            <Text fontSize="xs" color="neutral.text.subtle" mb="4">Documented to</Text>
            <Input
              type="date"
              bg="neutral.surface.layer01"
              borderColor="neutral.border.subtle"
              borderRadius="md"
              fontSize="sm"
              px="10"
              py="6"
              h="38px"
              w="150px"
              aria-label="Documented to"
            />
          </Box>

          {/* Reset */}
          <Box pt="20">
            <Box
              as="button"
              onClick={() => { setSearch(""); setTypeFilter("all"); setPlanFilter("all"); }}
              fontSize="sm"
              fontWeight="600"
              color="brand.text.primaryDefault"
              px="14"
              py="8"
              borderRadius="full"
              borderWidth="1px"
              borderColor="neutral.border.subtle"
              bg="neutral.surface.layer01"
            >
              Reset
            </Box>
          </Box>
        </Flex>

        {/* Results count + generate button row */}
        <Flex justify="space-between" align="center" mt="16" pt="16" borderTopWidth="1px" borderColor="neutral.border.subtle">
          <Text fontSize="sm" color="neutral.text.subtle">
            {`${String(rows.length).padStart(2, "0")} · Record${rows.length !== 1 ? "s" : ""} found`}
          </Text>
          <Button
            variant="outline"
            size="md"
            borderColor="neutral.border.subtle"
            onClick={() => setOpen(true)}
          >
            Generate new statement
          </Button>
        </Flex>

        {/* Document rows — card list, not a table */}
        <Box mt="8">
          {!rows.length ? (
            <Flex direction="column" align="center" py="32" gap="8" color="neutral.text.subtle">
              <FileText size={28} />
              <Text fontSize="sm">No documents match these filters.</Text>
            </Flex>
          ) : (
            rows.map((d: any) => (
              <Flex
                key={d.id}
                align="center"
                gap="12"
                py="14"
                borderBottomWidth="1px"
                borderColor="neutral.border.subtle"
                _last={{ borderBottomWidth: 0 }}
              >
                {/* Doc icon */}
                <Flex
                  align="center"
                  justify="center"
                  w="36px"
                  h="36px"
                  borderRadius="md"
                  bg="brand.background.primarySubtle"
                  flexShrink={0}
                >
                  <FileText size={16} color="var(--core-colors-brand-text-primary-default)" />
                </Flex>

                {/* Name + subtitle */}
                <Box flex="1" minW="0">
                  <Text fontWeight="700" fontSize="sm" color="neutral.text.default" truncate>
                    {d.name}
                  </Text>
                  <Text fontSize="xs" color="neutral.text.subtle">
                    {d.type} · {d.date}
                  </Text>
                </Box>

                {/* Plan name */}
                <Text
                  fontSize="sm"
                  color="neutral.text.subtle"
                  display={{ base: "none", md: "block" }}
                  maxW="300px"
                  truncate
                  flexShrink={0}
                >
                  {d.plan}
                </Text>

                {/* Download button — outline style */}
                <Button
                  variant="outline"
                  size="sm"
                  borderColor="neutral.border.subtle"
                  onClick={() => handleDownload(d)}
                  flexShrink={0}
                >
                  <Download size={14} />
                  Download
                </Button>
              </Flex>
            ))
          )}
        </Box>
      </Box>

      <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate statement</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text fontSize="sm" color="neutral.text.subtle" mb="16">
              Create a new statement for the selected plan and period. It will appear at the top of your Document
              Center list.
            </Text>
            <Box mb="12">
              <Text fontSize="sm" fontWeight="600" mb="6">
                Plan
              </Text>
              <FormSelect
                size="sm"
                value={genPlan}
                onChange={setGenPlan}
                options={planOptions.map((name: string) => ({ label: name, value: name }))}
              />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="600" mb="6">
                Period
              </Text>
              <FormSelect
                size="sm"
                value={genPeriod}
                onChange={setGenPeriod}
                options={PERIODS.map((p) => ({ label: p, value: p }))}
              />
            </Box>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              bg="brand.background.primaryStrong"
              color="brand.text.primaryOncolor"
              _hover={{ bg: "brand.background.primaryHover" }}
              onClick={handleGenerate}
              disabled={!genPlan}
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}
