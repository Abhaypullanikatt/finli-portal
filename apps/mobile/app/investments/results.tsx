import type { InvestmentExplorerStatus } from "@financial-companion/contracts";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { RefreshControl, View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { InvestmentResultCard } from "@/components/investment-result-card";
import { Screen } from "@/components/screen";
import { SectionHeader } from "@/components/section-header";
import { ErrorState, LoadingState } from "@/components/status-state";
import { ApiClientError, api } from "@/lib/api";
import { explorerStatusUi, formatHorizon } from "@/lib/investment-explorer";
import { colors, radii } from "@/theme/colors";

const statusOrder: InvestmentExplorerStatus[] = [
  "ready_to_learn",
  "explore_with_caution",
  "foundation_first",
];

const groupCopy: Record<InvestmentExplorerStatus, string> = {
  ready_to_learn: "No extra warning from your current context.",
  explore_with_caution: "More care around risk, time or access.",
  foundation_first: "Strengthen the roadmap foundation alongside learning.",
};

export default function InvestmentExplorerResultsScreen() {
  const query = useQuery({
    queryKey: ["investment-explorer-result", "current"],
    queryFn: api.currentInvestmentExplorerResult,
  });

  if (query.isLoading) {
    return (
      <Screen>
        <LoadingState label="Building your learning view…" />
      </Screen>
    );
  }

  const missing =
    query.error instanceof ApiClientError && query.error.status === 404;
  if (missing) {
    return (
      <Screen>
        <Card style={{ gap: 18 }}>
          <View style={{ gap: 7 }}>
            <AppText variant="title">Choose what you want to learn.</AppText>
            <AppText variant="body" color={colors.muted}>
              Create a contextual view from your current profile, goal, and
              interests.
            </AppText>
          </View>
          <Link href="/investments" asChild>
            <ActionButton label="Open explorer" tone="lime" />
          </Link>
        </Card>
      </Screen>
    );
  }

  if (query.error && !query.data) {
    return (
      <Screen>
        <ErrorState
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      </Screen>
    );
  }

  const result = query.data;
  if (!result) return null;

  return (
    <Screen
      tint="mint"
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      <Card style={{ gap: 14 }}>
        <View style={{ gap: 0 }}>
          <AppText variant="title">Your learning view.</AppText>
          <AppText variant="body" color={colors.muted}>
            Why each selected category appears for you.
          </AppText>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[
            {
              label: result.goal ? "Goal" : "Context",
              value: result.goal?.name ?? "General learning",
            },
            { label: "Horizon", value: formatHorizon(result.horizonYears) },
            { label: "Risk", value: result.risk.combined },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                flex: 1,
                minHeight: 58,
                padding: 10,
                gap: 3,
                borderRadius: radii.small,
                backgroundColor: colors.surfaceStrong,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <AppText variant="caption" color={colors.muted}>
                {item.label}
              </AppText>
              <AppText
                variant="captionStrong"
                numberOfLines={2}
                style={{ textTransform: "capitalize" }}
              >
                {item.value}
              </AppText>
            </View>
          ))}
        </View>
        <AppText variant="caption" color={colors.muted}>
          {result.entries.length} selected · generated{" "}
          {new Date(result.createdAt).toLocaleDateString()}
        </AppText>
      </Card>

      {query.error ? (
        <Card tone="danger">
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AppIcon
              name="exclamationmark.triangle.fill"
              color={colors.danger}
            />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="bodyStrong" color={colors.danger}>
                Showing your last generated view
              </AppText>
              <AppText variant="caption" color={colors.danger}>
                {query.error.message} The saved explanation remains readable,
                but create a fresh result before relying on its context.
              </AppText>
            </View>
          </View>
        </Card>
      ) : null}

      {statusOrder.map((status) => {
        const entries = result.entries.filter(
          (entry) => entry.status === status,
        );
        if (entries.length === 0) return null;
        const statusStyle = explorerStatusUi[status];
        return (
          <View key={status} style={{ gap: 9 }}>
            <SectionHeader
              eyebrow={`${entries.length} ${entries.length === 1 ? "topic" : "topics"}`}
              title={statusStyle.label}
            />
            <AppText variant="caption" color={colors.muted}>
              {groupCopy[status]}
            </AppText>
            {entries.map((entry) => (
              <InvestmentResultCard
                key={entry.category.key}
                entry={entry}
                horizonYears={result.horizonYears}
                combinedRisk={result.risk.combined}
              />
            ))}
          </View>
        );
      })}

      <Card>
        <View style={{ flexDirection: "row", gap: 11 }}>
          <AppIcon
            name={
              result.reviewStatus === "approved"
                ? "checkmark.circle.fill"
                : "info.circle.fill"
            }
            color={
              result.reviewStatus === "approved"
                ? colors.limeDeep
                : colors.primaryDeep
            }
          />
          <View style={{ flex: 1, gap: 5 }}>
            <AppText variant="bodyStrong">
              {result.reviewStatus === "approved"
                ? "Reviewed learning methodology"
                : "Draft validation methodology"}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              Educational comparison only. No product or transaction.
            </AppText>
            <AppText variant="caption" color={colors.mutedLight}>
              Rules {result.ruleSetVersion} · Content{" "}
              {result.categoryContentVersion}
            </AppText>
          </View>
        </View>
      </Card>

      <Link href="/investments" asChild>
        <ActionButton
          label="Change goal or interests"
          tone="secondary"
          icon="arrow.right"
        />
      </Link>
    </Screen>
  );
}
