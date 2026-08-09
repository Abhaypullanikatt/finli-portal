import type {
  InvestmentExplorerEntry,
  RiskClass,
} from "@financial-companion/contracts";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { Card } from "./card";
import {
  categoryUi,
  explorerStatusUi,
  formatHorizon,
} from "@/lib/investment-explorer";
import { colors, radii } from "@/theme/colors";

export function InvestmentResultCard({
  entry,
  horizonYears,
  combinedRisk,
}: {
  entry: InvestmentExplorerEntry;
  horizonYears: number;
  combinedRisk: RiskClass;
}) {
  const category = entry.category;
  const categoryStyle = categoryUi[category.key];
  const statusStyle = explorerStatusUi[entry.status];

  return (
    <Link
      href={{
        pathname: "/investments/[key]",
        params: { key: category.key },
      }}
      asChild
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${category.title} education`}
      >
        <Card style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: radii.small,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.primarySoft,
              }}
            >
              <AppIcon
                name={categoryStyle.icon}
                color={colors.primary}
                size={15}
              />
            </View>
            <AppText variant="heading" style={{ flex: 1 }}>
              {category.title}
            </AppText>
            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 5,
                borderRadius: radii.pill,
                backgroundColor: statusStyle.soft,
              }}
            >
              <AppText variant="captionStrong" color={statusStyle.accent}>
                {statusStyle.label}
              </AppText>
            </View>
          </View>

          <AppText variant="body" color={colors.muted} numberOfLines={2}>
            {entry.rationale}
          </AppText>

          <View style={{ flexDirection: "row", gap: 7 }}>
            {[
              { label: "Risk", value: combinedRisk },
              { label: "Horizon", value: formatHorizon(horizonYears) },
              { label: "Liquidity", value: category.matching.liquidityBand },
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  flex: 1,
                  minHeight: 46,
                  padding: 8,
                  gap: 3,
                  borderRadius: radii.small,
                  backgroundColor: colors.canvas,
                }}
              >
                <AppText variant="caption" color={colors.mutedLight}>
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

          <View
            style={{
              paddingTop: 10,
              gap: 5,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              <AppIcon
                name="exclamationmark.triangle.fill"
                size={15}
                color={statusStyle.accent}
              />
              <AppText
                variant="captionStrong"
                color={statusStyle.accent}
                style={{ flex: 1 }}
              >
                Downside to note
              </AppText>
            </View>
            <AppText variant="caption" color={colors.muted} numberOfLines={1}>
              {entry.warnings[0]}
            </AppText>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <AppText variant="caption" color={colors.mutedLight}>
              Education—not a suitability result.
            </AppText>
            <AppIcon name="arrow.right" size={16} color={colors.lavender} />
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
