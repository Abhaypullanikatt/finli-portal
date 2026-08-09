import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { ProgressBar } from "@/components/progress-bar";
import { Screen } from "@/components/screen";
import { SectionHeader } from "@/components/section-header";
import { ErrorState, LoadingState } from "@/components/status-state";
import { ApiClientError, api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { colors, fonts, radii } from "@/theme/colors";

const quickLinks: Array<{
  href: "/investments" | "/transactions/voice" | "/transactions/new";
  label: string;
  detail: string;
  icon: AppIconName;
  accent: string;
}> = [
  {
    href: "/investments",
    label: "Explore",
    detail: "Investment paths",
    icon: "chart.line.uptrend.xyaxis",
    accent: colors.mint,
  },
  {
    href: "/transactions/voice",
    label: "Speak",
    detail: "Expense or budget",
    icon: "waveform",
    accent: colors.skySoft,
  },
  {
    href: "/transactions/new",
    label: "Add",
    detail: "Manual expense",
    icon: "plus",
    accent: colors.orangeSoft,
  },
];

export default function TodayScreen() {
  const assessmentQuery = useQuery({
    queryKey: ["assessment", "current"],
    queryFn: api.currentAssessment,
  });
  const roadmapQuery = useQuery({
    queryKey: ["roadmap", "current"],
    queryFn: api.currentRoadmap,
  });
  const profileQuery = useQuery({
    queryKey: ["profile", "current"],
    queryFn: api.currentProfile,
  });

  const missing =
    (assessmentQuery.error instanceof ApiClientError &&
      assessmentQuery.error.status === 404) ||
    (roadmapQuery.error instanceof ApiClientError &&
      roadmapQuery.error.status === 404) ||
    (profileQuery.error instanceof ApiClientError &&
      profileQuery.error.status === 404);

  if (
    assessmentQuery.isLoading ||
    roadmapQuery.isLoading ||
    profileQuery.isLoading
  ) {
    return (
      <Screen tab tint="peach">
        <LoadingState label="Loading your plan…" />
      </Screen>
    );
  }

  if (missing) {
    return (
      <Screen tab tint="peach">
        <View style={{ paddingVertical: 18, gap: 5 }}>
          <AppText variant="display">Welcome.</AppText>
          <AppText variant="body" color={colors.muted}>
            Four short steps create your first money roadmap.
          </AppText>
        </View>
        <Card style={{ gap: 0 }}>
          {[
            ["1", "Cash flow"],
            ["2", "Safety and debt"],
            ["3", "Risk and goals"],
            ["4", "Your next action"],
          ].map(([number, label], index) => (
            <View
              key={number}
              style={{
                minHeight: 58,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderBottomWidth: index === 3 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radii.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    index === 0 ? colors.black : colors.surfaceStrong,
                }}
              >
                <AppText
                  variant="captionStrong"
                  color={index === 0 ? colors.white : colors.muted}
                >
                  {number}
                </AppText>
              </View>
              <AppText variant="bodyStrong">{label}</AppText>
            </View>
          ))}
        </Card>
        <Link href="/onboarding" asChild>
          <ActionButton
            label="Build my money map"
            tone="dark"
            icon="arrow.right"
          />
        </Link>
      </Screen>
    );
  }

  if (assessmentQuery.error || roadmapQuery.error || profileQuery.error) {
    const error =
      assessmentQuery.error ?? roadmapQuery.error ?? profileQuery.error;
    return (
      <Screen tab tint="peach">
        <View style={{ paddingVertical: 22, gap: 5 }}>
          <AppText variant="title">We couldn’t refresh your plan.</AppText>
          <AppText variant="body" color={colors.muted}>
            Your connection may be unavailable.
          </AppText>
        </View>
        <ErrorState
          message={
            error instanceof Error ? error.message : "Unable to load your plan."
          }
          onRetry={() => {
            void assessmentQuery.refetch();
            void roadmapQuery.refetch();
            void profileQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const assessment = assessmentQuery.data;
  const roadmap = roadmapQuery.data;
  const profile = profileQuery.data;
  if (!assessment || !roadmap || !profile) return null;
  const currentAction = roadmap.actions.find(
    (action) => action.status === "recommended",
  );
  const actionHref = currentAction?.lessonId
    ? currentAction.kind === "learn_investing"
      ? "/investments"
      : (`/lessons/${currentAction.lessonId}` as const)
    : "/(tabs)/learn";
  const currentActionTitle =
    currentAction?.kind === "build_emergency_fund"
      ? "Build a safety fund"
      : currentAction?.title;
  const isSafetyFundAction =
    currentAction?.kind === "build_starter_buffer" ||
    currentAction?.kind === "build_emergency_fund";

  return (
    <Screen tab tint="peach">
      <View style={{ paddingVertical: 18, gap: 5 }}>
        <AppText variant="h1">Good Morning</AppText>
        <AppText variant="body" color={colors.muted}>
          One clear money move at a time.
        </AppText>
      </View>

      {currentAction ? (
        <Card style={{ padding: 20, gap: 16 }}>
          {isSafetyFundAction ? (
            <View style={{ gap: 14 }}>
              <View
                style={{
                  position: "relative",
                  minHeight: 148,
                  paddingRight: 134,
                  gap: 12,
                }}
              >
                <AppText
                  variant="label"
                  color={colors.success}
                  numberOfLines={1}
                  style={{
                    fontFamily: fonts.medium,
                    fontWeight: "500",
                    fontSize: 12,
                    lineHeight: 18,
                    letterSpacing: 0.35,
                  }}
                >
                  YOUR NEXT MOVE
                </AppText>
                <AppText
                  variant="title"
                  numberOfLines={2}
                  style={{
                    fontFamily: fonts.regular,
                    fontWeight: "400",
                    fontSize: 24,
                    lineHeight: 30,
                    letterSpacing: -0.4,
                  }}
                >
                  {currentActionTitle}
                </AppText>
                {currentAction.target ? (
                  <AppText
                    variant="title"
                    numberOfLines={1}
                    style={{
                      fontSize: 38,
                      lineHeight: 44,
                      letterSpacing: -0.8,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {formatMoney(currentAction.target)}
                  </AppText>
                ) : null}
                <Image
                  source={require("../../assets/financial-path.png")}
                  contentFit="contain"
                  transition={250}
                  style={{
                    position: "absolute",
                    width: 142,
                    height: 142,
                    right: -6,
                    top: 4,
                  }}
                />
              </View>
              <AppText
                variant="body"
                color={colors.muted}
                numberOfLines={2}
                style={{ fontSize: 14, lineHeight: 21 }}
              >
                {currentAction.rationale}
              </AppText>
            </View>
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View style={{ flex: 1, minWidth: 0, gap: 7 }}>
                <AppText variant="heading" numberOfLines={2}>
                  {currentActionTitle}
                </AppText>
                {currentAction.target ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 6,
                    }}
                  >
                    <AppText variant="title">
                      {formatMoney(currentAction.target)}
                    </AppText>
                    <AppText variant="captionStrong" color={colors.mutedLight}>
                      target
                    </AppText>
                  </View>
                ) : null}
              </View>
              <Image
                source={require("../../assets/financial-path.png")}
                contentFit="contain"
                transition={250}
                style={{ width: 112, height: 112 }}
              />
            </View>
          )}

          <Link href={actionHref} asChild>
            <ActionButton
              label={
                currentAction.kind === "learn_investing"
                  ? "Explore my options"
                  : "Start this step"
              }
              tone="dark"
              icon="arrow.right"
              style={isSafetyFundAction ? { minHeight: 62 } : undefined}
            />
          </Link>
        </Card>
      ) : null}

      <SectionHeader title="Money snapshot" />
      <Card style={{ gap: 14 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 1 }}>
            <AppText variant="caption" color={colors.muted}>
              Financial health
            </AppText>
            <AppText variant="metric">{assessment.healthScore}</AppText>
          </View>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: radii.pill,
              backgroundColor: colors.mint,
            }}
          >
            <AppText
              variant="captionStrong"
              style={{ textTransform: "capitalize" }}
            >
              {assessment.risk.combined} risk
            </AppText>
          </View>
        </View>
        <ProgressBar
          value={assessment.healthScore}
          color={colors.black}
          height={6}
        />
      </Card>

      <SectionHeader title="Quick start" />
      <View style={{ gap: 8 }}>
        {quickLinks.map((item) => (
          <Link key={item.label} href={item.href} asChild>
            <Pressable
              style={{
                minHeight: 62,
                paddingHorizontal: 14,
                borderRadius: radii.medium,
                borderCurve: "continuous",
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: radii.small,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: item.accent,
                }}
              >
                <AppIcon name={item.icon} size={17} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <AppText variant="bodyStrong">{item.label}</AppText>
                <AppText variant="caption" color={colors.muted}>
                  {item.detail}
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
      </View>

      <SectionHeader title="Health signals" />
      <Card style={{ gap: 0 }}>
        {assessment.dimensions.slice(0, 4).map((dimension, index) => (
          <View
            key={dimension.key}
            style={{
              minHeight: 54,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderBottomColor: colors.border,
              borderBottomWidth: index === 3 ? 0 : 1,
            }}
          >
            <AppText variant="body" style={{ flex: 1 }}>
              {dimension.label}
            </AppText>
            <View style={{ width: 72 }}>
              <ProgressBar value={dimension.score} height={4} />
            </View>
            <AppText
              variant="captionStrong"
              style={{ width: 26, textAlign: "right" }}
            >
              {dimension.score}
            </AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
