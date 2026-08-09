import { InvestmentCategoryKeySchema } from "@financial-companion/contracts";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { SectionHeader } from "@/components/section-header";
import { ErrorState, LoadingState } from "@/components/status-state";
import { api } from "@/lib/api";
import { categoryUi, explorerStatusUi } from "@/lib/investment-explorer";
import { colors, radii } from "@/theme/colors";

export default function InvestmentCategoryScreen() {
  const params = useLocalSearchParams<{ key?: string }>();
  const parsedKey = InvestmentCategoryKeySchema.safeParse(params.key);
  const key = parsedKey.success ? parsedKey.data : undefined;
  const categoryQuery = useQuery({
    queryKey: ["investment-category", key],
    queryFn: () => api.investmentCategory(key!),
    enabled: Boolean(key),
    staleTime: 24 * 60 * 60 * 1_000,
  });
  const resultQuery = useQuery({
    queryKey: ["investment-explorer-result", "current"],
    queryFn: api.currentInvestmentExplorerResult,
  });

  if (!key) {
    return (
      <Screen>
        <ErrorState message="This investment education category is not available." />
      </Screen>
    );
  }

  if (categoryQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Opening category guide…" />
      </Screen>
    );
  }

  if (categoryQuery.error) {
    return (
      <Screen>
        <ErrorState
          message={categoryQuery.error.message}
          onRetry={() => void categoryQuery.refetch()}
        />
      </Screen>
    );
  }

  const category = categoryQuery.data;
  if (!category) return null;
  const entry = resultQuery.data?.entries.find(
    (candidate) => candidate.category.key === category.key,
  );
  const categoryStyle = categoryUi[category.key];
  const statusStyle = entry ? explorerStatusUi[entry.status] : undefined;

  const facts = [
    { label: "Purpose", value: category.purpose },
    { label: "Risk context", value: category.riskLabel },
    { label: "Variability", value: category.variability },
    { label: "Typical horizon", value: category.typicalHorizon },
    { label: "Liquidity", value: category.liquidity },
    {
      label: "Practical starting point",
      value: category.minimumPracticalAmount,
    },
    { label: "Costs to inspect", value: category.costs },
    { label: "Tax caveat", value: category.taxCaveat },
  ];

  return (
    <Screen>
      <Card
        style={{
          gap: 18,
          paddingTop: 24,
          backgroundColor: categoryStyle.soft,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radii.medium,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.white,
              boxShadow: `0 10px 24px ${categoryStyle.soft}`,
            }}
          >
            <AppIcon
              name={categoryStyle.icon}
              color={categoryStyle.accent}
              size={23}
            />
          </View>
          {statusStyle ? (
            <View
              style={{
                paddingHorizontal: 11,
                paddingVertical: 7,
                borderRadius: radii.pill,
                backgroundColor: colors.white,
              }}
            >
              <AppText variant="captionStrong" color={statusStyle.accent}>
                {statusStyle.label}
              </AppText>
            </View>
          ) : (
            <View
              style={{
                paddingHorizontal: 11,
                paddingVertical: 7,
                borderRadius: radii.pill,
                backgroundColor: colors.white,
              }}
            >
              <AppText variant="captionStrong" color={categoryStyle.accent}>
                Category education
              </AppText>
            </View>
          )}
        </View>
        <View style={{ gap: 7 }}>
          <AppText variant="display">{category.title}</AppText>
          <AppText variant="body" color={colors.muted}>
            {category.summary}
          </AppText>
        </View>
        {entry ? (
          <View
            style={{
              padding: 14,
              gap: 6,
              borderRadius: radii.medium,
              backgroundColor: colors.white,
            }}
          >
            <AppText variant="captionStrong" color={categoryStyle.accent}>
              Why it appears in your view
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              {entry.rationale}
            </AppText>
          </View>
        ) : null}
      </Card>

      {entry ? (
        <Card tone={entry.status === "foundation_first" ? "purple" : "lime"}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AppIcon
              name="exclamationmark.triangle.fill"
              color={statusStyle?.accent}
            />
            <View style={{ flex: 1, gap: 6 }}>
              <AppText variant="bodyStrong">Your current context</AppText>
              {entry.warnings.map((warning) => (
                <AppText key={warning} variant="caption" color={colors.muted}>
                  {warning}
                </AppText>
              ))}
            </View>
          </View>
        </Card>
      ) : null}

      <SectionHeader
        eyebrow="The essentials"
        title="Understand the structure"
      />
      <Card style={{ gap: 0 }}>
        {facts.map((fact, index) => (
          <View
            key={fact.label}
            style={{
              paddingVertical: 15,
              gap: 5,
              borderBottomWidth: index === facts.length - 1 ? 0 : 1,
              borderBottomColor: colors.border,
            }}
          >
            <AppText variant="captionStrong" color={categoryStyle.accent}>
              {fact.label}
            </AppText>
            <AppText variant="body" color={colors.muted}>
              {fact.value}
            </AppText>
          </View>
        ))}
      </Card>

      {[
        {
          title: "What it can help explain",
          items: category.advantages,
          tone: "lime" as const,
          icon: "checkmark.circle.fill" as const,
        },
        {
          title: "Limitations to keep visible",
          items: category.limitations,
          tone: "pink" as const,
          icon: "exclamationmark.triangle.fill" as const,
        },
        {
          title: "Common learning mistakes",
          items: category.commonMistakes,
          tone: "purple" as const,
          icon: "info.circle.fill" as const,
        },
      ].map((section) => (
        <Card key={section.title} tone={section.tone}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AppIcon name={section.icon} />
            <View style={{ flex: 1, gap: 8 }}>
              <AppText variant="bodyStrong">{section.title}</AppText>
              {section.items.map((item) => (
                <View
                  key={item}
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <AppText variant="bodyStrong">•</AppText>
                  <AppText
                    variant="caption"
                    color={colors.muted}
                    style={{ flex: 1 }}
                  >
                    {item}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </Card>
      ))}

      <Link href={`/lessons/${category.lessonId}`} asChild>
        <ActionButton
          label={`Read the ${category.shortTitle} lesson`}
          tone="dark"
          icon="book.closed.fill"
        />
      </Link>

      {entry && resultQuery.data ? (
        <Link
          href={{
            pathname: "/consultation",
            params: {
              topic: "investment_education",
              categoryKey: category.key,
              explorerResultId: resultQuery.data.id,
            },
          }}
          asChild
        >
          <ActionButton
            label="Talk to an educator"
            tone="secondary"
            icon="phone.fill"
          />
        </Link>
      ) : (
        <Link href="/investments" asChild>
          <ActionButton
            label="Add to my learning view"
            tone="secondary"
            icon="arrow.right"
          />
        </Link>
      )}

      <Card tone="dark">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AppIcon name="shield.fill" color={colors.lime} />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="bodyStrong" color={colors.white}>
              Category, not product
            </AppText>
            <AppText variant="caption" color="#BDB9B4">
              This guide contains no named product, allocation, transaction, or
              return promise. Review status: {category.review.status}.
            </AppText>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
