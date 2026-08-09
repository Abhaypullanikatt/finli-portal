import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { SectionHeader } from "@/components/section-header";
import { ErrorState, LoadingState } from "@/components/status-state";
import { api } from "@/lib/api";
import { investmentExplorerEnabled } from "@/lib/investment-explorer";
import { colors, radii } from "@/theme/colors";

const investmentPaths: Array<{
  title: string;
  detail: string;
  categories: string;
  icon: AppIconName;
}> = [
  {
    title: "Deposits",
    detail: "Lower variability",
    categories: "fixed_deposits,government_savings",
    icon: "lock.fill",
  },
  {
    title: "Funds & bonds",
    detail: "Diversified routes",
    categories: "bonds,diversified_mutual_funds",
    icon: "square.stack.3d.up.fill",
  },
  {
    title: "Stocks",
    detail: "Growth learning",
    categories: "equity_stock_learning",
    icon: "chart.line.uptrend.xyaxis",
  },
  {
    title: "Real assets",
    detail: "Gold & property",
    categories: "gold,reits,direct_real_estate",
    icon: "building.2.fill",
  },
];

export default function LearnScreen() {
  const query = useQuery({ queryKey: ["lessons"], queryFn: api.lessons });

  if (query.isLoading) {
    return (
      <Screen tab>
        <LoadingState label="Loading…" />
      </Screen>
    );
  }
  if (query.error) {
    return (
      <Screen tab>
        <ErrorState
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen tab tint="mint">
      <View style={{ paddingVertical: 18, gap: 5 }}>
        <AppText variant="h1">Learn and Explore</AppText>
        <AppText variant="body" color={colors.muted}>
          Begin with the question you want answered.
        </AppText>
      </View>

      {investmentExplorerEnabled ? (
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="captionStrong" color={colors.success}>
                INVESTMENT EXPLORER
              </AppText>
              <AppText variant="title">What could I invest in?</AppText>
              <AppText variant="caption" color={colors.muted}>
                Compare categories using your goal, time and risk context.
              </AppText>
            </View>
            <Image
              source={require("../../assets/financial-path.png")}
              contentFit="contain"
              style={{ width: 94, height: 94 }}
            />
          </View>

          <View style={{ gap: 8 }}>
            {[0, 2].map((startIndex) => (
              <View
                key={startIndex}
                style={{ flexDirection: "row", gap: 8 }}
              >
                {investmentPaths
                  .slice(startIndex, startIndex + 2)
                  .map((item) => (
                    <Link
                      key={item.title}
                      href={{
                        pathname: "/investments",
                        params: { categories: item.categories },
                      }}
                      asChild
                    >
                      <Pressable
                        style={{
                          flex: 1,
                          minWidth: 0,
                          minHeight: 86,
                          padding: 11,
                          justifyContent: "space-between",
                          gap: 9,
                          borderRadius: radii.medium,
                          borderCurve: "continuous",
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.surfaceStrong,
                        }}
                      >
                        <AppIcon name={item.icon} size={16} />
                        <View style={{ gap: 1 }}>
                          <AppText variant="bodyStrong" numberOfLines={1}>
                            {item.title}
                          </AppText>
                          <AppText
                            variant="caption"
                            color={colors.muted}
                            numberOfLines={1}
                          >
                            {item.detail}
                          </AppText>
                        </View>
                      </Pressable>
                    </Link>
                  ))}
              </View>
            ))}
          </View>

          <Link href="/investments" asChild>
            <Pressable
              style={{
                minHeight: 48,
                paddingHorizontal: 16,
                borderRadius: radii.pill,
                backgroundColor: colors.black,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <AppText variant="button" color={colors.white}>
                Compare all options
              </AppText>
              <AppIcon name="arrow.right" color={colors.white} size={16} />
            </Pressable>
          </Link>
        </Card>
      ) : null}

      <SectionHeader
        title="Short lessons"
        action={`${query.data?.length ?? 0}`}
      />
      <Card style={{ gap: 0 }}>
        {query.data?.map((lesson, index) => (
          <Link key={lesson.id} href={`/lessons/${lesson.id}`} asChild>
            <Pressable
              style={{
                minHeight: 68,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderBottomWidth:
                  index === (query.data?.length ?? 0) - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {lesson.title}
                </AppText>
                <AppText
                  variant="caption"
                  color={colors.muted}
                  numberOfLines={1}
                >
                  {lesson.minutes} min · {lesson.summary}
                </AppText>
              </View>
              <AppIcon
                name="chevron.right"
                size={14}
                color={colors.mutedLight}
              />
            </Pressable>
          </Link>
        ))}
      </Card>

      <AppText
        variant="caption"
        color={colors.mutedLight}
        style={{ paddingHorizontal: 4 }}
      >
        Education only—no products, rankings or transactions.
      </AppText>
    </Screen>
  );
}
