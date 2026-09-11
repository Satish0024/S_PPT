import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Dialog, Flex, Heading, Image, Input, Portal, Text } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faArrowRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../components/ui/button";
import { ARTICLES, CATS } from "../data/learning.js";

// ─── Tone → token mapping ──────────────────────────────────────────────────
// Each article has a `tone` field (t1–t4). Map these to semantic color tokens
// so no raw colours appear in component code.

const TONE_TOKENS: Record<
  string,
  { bg: string; color: string; iconBg: string; iconColor: string }
> = {
  t1: {
    bg: "brand.background.primarySubtle",
    color: "brand.text.primaryDefault",
    iconBg: "brand.background.primaryStrong",
    iconColor: "brand.text.primaryOncolor",
  },
  t2: {
    bg: "tertiaryBrand.background.primaryLight",
    color: "tertiaryBrand.text.primaryDefault",
    iconBg: "tertiaryBrand.background.strong",
    iconColor: "brand.text.primaryOncolor",
  },
  t3: {
    bg: "secondaryBrand.background.primaryLight",
    color: "secondaryBrand.text.primaryDefault",
    iconBg: "secondaryBrand.background.strong",
    iconColor: "brand.text.primaryOncolor",
  },
  t4: {
    bg: "semantics.success.backgroundLight",
    color: "semantics.success.text",
    iconBg: "semantics.success.backgroundStrong",
    iconColor: "brand.text.primaryOncolor",
  },
};

function toneTokens(tone: string) {
  return TONE_TOKENS[tone] ?? TONE_TOKENS.t1;
}

function tokenCssVar(token: string) {
  return `var(--core-colors-${token
    .replace(/\./g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()})`;
}

function FeaturedCard({ article, onOpen }: { article: any; onOpen: () => void }) {
  const t = toneTokens(article.tone);
  return (
    <Box
      as="button"
      onClick={onOpen}
      textAlign="left"
      w="full"
      bg={t.bg}
      borderRadius="xl"
      p={{ base: "20", md: "28" }}
      mb="28"
      position="relative"
      overflow="hidden"
      cursor="pointer"
    >
      <Flex direction={{ base: "column", md: "row" }} gap="20" align="start">
        <Flex w="52px" h="52px" borderRadius="lg" bg={t.iconBg} align="center" justify="center" flexShrink={0}>
          <FontAwesomeIcon icon={article.icon} color="var(--core-colors-brand-text-primary-oncolor)" size="lg" />
        </Flex>

        <Box flex="1">
          <Flex align="center" gap="8" mb="8">
            <Box
              as="span"
              bg={t.iconBg}
              color="brand.text.primaryOncolor"
              fontSize="xs"
              fontWeight="700"
              px="10"
              py="3"
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Featured
            </Box>
            <Text fontSize="xs" color={t.color} fontWeight="600">
              {article.tag}
            </Text>
          </Flex>
          <Heading fontSize="xl" fontWeight="800" color="neutral.text.default" mb="8">
            {article.title}
          </Heading>
          <Text fontSize="sm" color="neutral.text.subtle" mb="16" maxW="540px">
            {article.body}
          </Text>
          <Flex align="center" gap="6" fontSize="sm" fontWeight="700" color={t.color}>
            Read article
            <FontAwesomeIcon icon={faArrowRight} size="sm" />
          </Flex>
        </Box>

        <Box flexShrink={0} textAlign="right" display={{ base: "none", md: "block" }}>
          <Text fontSize="xs" color="neutral.text.subtle">
            {article.time}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

function ArticleCard({ article, onOpen }: { article: any; onOpen: () => void }) {
  const t = toneTokens(article.tone);
  return (
    <Box
      as="button"
      onClick={onOpen}
      textAlign="left"
      bg="neutral.surface.layer01"
      borderWidth="1px"
      borderColor="neutral.border.subtle"
      borderRadius="lg"
      p="18"
      display="flex"
      flexDirection="column"
      gap="12"
      _hover={{ borderColor: "brand.border.primaryDefault", boxShadow: "sm" }}
      transition="border-color 0.15s, box-shadow 0.15s"
      cursor="pointer"
      role="article"
    >
      <Flex align="center" gap="10">
        <Flex w="36px" h="36px" borderRadius="md" bg={t.bg} align="center" justify="center" flexShrink={0}>
          <FontAwesomeIcon icon={article.icon} color={tokenCssVar(t.color)} />
        </Flex>
        <Box as="span" bg={t.bg} color={t.color} fontSize="xs" fontWeight="700" px="8" py="2" borderRadius="full">
          {article.tag}
        </Box>
      </Flex>

      <Box flex="1">
        <Heading fontSize="base" fontWeight="700" color="neutral.text.default" mb="6">
          {article.title}
        </Heading>
        <Text fontSize="sm" color="neutral.text.subtle" lineClamp={3}>
          {article.body}
        </Text>
      </Box>

      <Flex justify="space-between" align="center" pt="8" borderTopWidth="1px" borderColor="neutral.border.subtle">
        <Text fontSize="xs" color="neutral.text.subtle">
          {article.time}
        </Text>
        <Flex align="center" gap="4" fontSize="xs" fontWeight="700" color={t.color}>
          Read
          <FontAwesomeIcon icon={faArrowRight} size="xs" />
        </Flex>
      </Flex>
    </Box>
  );
}

function ArticleDialog({ article, onClose }: { article: any; onClose: () => void }) {
  const t = toneTokens(article.tone);
  return (
    <Dialog.Root open onOpenChange={(d) => !d.open && onClose()} placement="center" size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Flex align="center" gap="8" mb="4">
                <Box as="span" bg={t.bg} color={t.color} fontSize="xs" fontWeight="700" px="8" py="2" borderRadius="full">
                  {article.tag}
                </Box>
                <Text fontSize="xs" color="neutral.text.subtle">
                  {article.time}
                </Text>
              </Flex>
              <Dialog.Title fontSize="lg" color="neutral.text.default">
                {article.title}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text fontSize="sm" color="neutral.text.subtle" lineHeight="tall">
                {article.body}
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button bg="brand.background.primaryStrong" color="brand.text.primaryOncolor" _hover={{ bg: "brand.background.primaryHover" }} onClick={onClose}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function CategoryTabs({ active, onChange }: { active: string; onChange: (cat: string) => void }) {
  return (
    <Flex gap="6" overflowX="auto" pb="4" role="tablist" aria-label="Filter by topic">
      {CATS.map((cat: string) => {
        const isActive = cat === active;
        return (
          <Box
            as="button"
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            px="16"
            py="8"
            borderRadius="full"
            fontSize="sm"
            fontWeight="600"
            bg={isActive ? "brand.background.primaryStrong" : "neutral.surface.layer02"}
            color={isActive ? "brand.text.primaryOncolor" : "neutral.text.subtle"}
            whiteSpace="nowrap"
            flexShrink={0}
            _hover={isActive ? {} : { bg: "neutral.surface.layer03", color: "neutral.text.default" }}
            transition="background 0.15s, color 0.15s"
          >
            {cat}
          </Box>
        );
      })}
    </Flex>
  );
}

export default function Enrich() {
  const [activeCategory, setActiveCategory] = useState<string>(CATS[0]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const featured = ARTICLES[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ARTICLES.filter((a: any) => {
      const matchesCat = activeCategory === CATS[0] || a.tag === activeCategory;
      const matchesSearch =
        !q || a.title.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, search]);

  const gridArticles = useMemo(() => {
    if (activeCategory === CATS[0] && !search.trim()) return filtered.slice(1);
    return filtered;
  }, [filtered, activeCategory, search]);

  const showFeatured = activeCategory === CATS[0] && !search.trim();

  return (
    // ── Standalone layout — no app sidebar ────────────────────────────────
    <Flex direction="column" minH="100dvh" bg="neutral.surface.layer02">
      {/* Topbar: logo + back link */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        h="headerHeight"
        px={{ base: "16", md: "24" }}
        bg="neutral.surface.layer01"
        borderBottomWidth="1px"
        borderColor="neutral.border.subtle"
        position="sticky"
        top="0"
        zIndex="sticky"
      >
        <Image src="/logo-lockup-light.svg" alt="LendGuard" h="logoHeight" />
        <RouterLink
          to="/"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", fontWeight: 600, color: "var(--core-colors-brand-text-primary-default)", textDecoration: "none" }}
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </RouterLink>
      </Flex>

      {/* Content area — max-width 960px, centred */}
      <Box as="main" flex="1" maxW="960px" w="full" mx="auto" px={{ base: "16", md: "24" }} pt="32" pb="48">
        {/* Page header */}
        <Box as="span" fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color="tertiaryBrand.text.primaryDefault" display="block" mb="8">
          Enrich
        </Box>
        <Heading as="h1" textStyle="h1" color="neutral.text.default" mb="8">
          Financial wellness library
        </Heading>
        <Text fontSize="sm" color="neutral.text.subtle" mb="24" maxW="540px">
          Guides and short lessons to help you make confident decisions about your plan and retirement.
        </Text>

        {/* Search */}
        <Box position="relative" mb="20">
          <Box position="absolute" left="12" top="50%" transform="translateY(-50%)" color="neutral.text.subtle" pointerEvents="none">
            <FontAwesomeIcon icon={faSearch} size="sm" />
          </Box>
          <Input
              pl="36"
              placeholder="Search Topics, Articles, And Tools…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="neutral.surface.layer01"
              borderColor="neutral.border.subtle"
              _placeholder={{ color: "neutral.text.subtle" }}
              aria-label="Search Enrich"
            />
          </Box>

          {/* Category tabs */}
          <Box mb="24">
            <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
          </Box>

          {/* Featured + grid */}
          {showFeatured && <FeaturedCard article={featured} onOpen={() => setSelected(featured)} />}

          {gridArticles.length > 0 ? (
            <>
              {showFeatured && (
                <Text fontSize="sm" fontWeight="700" color="neutral.text.subtle" textTransform="uppercase" letterSpacing="wider" mb="16">
                  More articles
                </Text>
              )}
              <Box display="grid" gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="16">
                {gridArticles.map((article: any) => (
                  <ArticleCard key={article.id} article={article} onOpen={() => setSelected(article)} />
                ))}
              </Box>
            </>
          ) : (
            <Box textAlign="center" py="48" color="neutral.text.subtle">
              <Box mb="12">
                <FontAwesomeIcon icon={faBookOpen} size="2x" />
              </Box>
              <Text fontSize="sm">No articles found for &ldquo;{search}&rdquo;.</Text>
            </Box>
          )}

          {selected && <ArticleDialog article={selected} onClose={() => setSelected(null)} />}
        </Box>
      </Flex>
  );
}
