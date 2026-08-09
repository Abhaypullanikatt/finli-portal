import type {
  InvestmentCategoryKey,
  InvestmentExplorerMode,
} from "@financial-companion/contracts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { SegmentedChoice } from "@/components/segmented-choice";
import { ErrorState, LoadingState } from "@/components/status-state";
import { ApiClientError, api } from "@/lib/api";
import {
  categoryUi,
  investmentExplorerEnabled,
} from "@/lib/investment-explorer";
import { queryClient } from "@/lib/query-client";
import { colors, radii } from "@/theme/colors";

const disclosureVersion = "investment-exploration-v1";
const retentionPolicy =
  "Retain explorer preferences and educational results until account deletion or an approved legal requirement.";

const steps = ["Purpose", "Context", "Interests"] as const;

export default function InvestmentExplorerScreen() {
  const params = useLocalSearchParams<{ categories?: string }>();
  const categoriesQuery = useQuery({
    queryKey: ["investment-categories"],
    queryFn: api.investmentCategories,
    staleTime: 24 * 60 * 60 * 1_000,
  });
  const profileQuery = useQuery({
    queryKey: ["profile", "current"],
    queryFn: api.currentProfile,
  });
  const assessmentQuery = useQuery({
    queryKey: ["assessment", "current"],
    queryFn: api.currentAssessment,
  });
  const consentsQuery = useQuery({
    queryKey: ["consents"],
    queryFn: api.consents,
  });
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<InvestmentExplorerMode>("general");
  const [goalId, setGoalId] = useState<string>();
  const [selected, setSelected] = useState<InvestmentCategoryKey[]>([]);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [appliedShortcut, setAppliedShortcut] = useState(false);

  const latestConsent = consentsQuery.data
    ?.filter((record) => record.purpose === "investment_exploration")
    .at(-1);
  const activeConsent =
    latestConsent?.granted === true && !latestConsent.withdrawnAt;

  useEffect(() => {
    if (activeConsent) setConsentAccepted(true);
  }, [activeConsent]);

  useEffect(() => {
    if (mode === "goal" && !goalId && profileQuery.data?.goals[0]) {
      setGoalId(profileQuery.data.goals[0].id);
    }
  }, [goalId, mode, profileQuery.data]);

  useEffect(() => {
    if (appliedShortcut || !categoriesQuery.data || !params.categories) return;
    const requested = params.categories.split(",");
    setSelected(
      categoriesQuery.data
        .map((category) => category.key)
        .filter((key) => requested.includes(key)),
    );
    setAppliedShortcut(true);
  }, [appliedShortcut, categoriesQuery.data, params.categories]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!activeConsent) {
        await api.grantConsent(
          "investment_exploration",
          retentionPolicy,
          disclosureVersion,
        );
      }
      return api.createInvestmentExplorerResult({
        mode,
        goalId: mode === "goal" ? goalId : undefined,
        selectedCategoryKeys: selected,
      });
    },
    onSuccess: async (result) => {
      queryClient.setQueryData(
        ["investment-explorer-result", "current"],
        result,
      );
      await queryClient.invalidateQueries({ queryKey: ["consents"] });
      router.push("/investments/results");
    },
  });

  if (!investmentExplorerEnabled) {
    return (
      <Screen tint="mint">
        <ErrorState message="Investment Explorer is not enabled." />
      </Screen>
    );
  }

  if (
    categoriesQuery.isLoading ||
    profileQuery.isLoading ||
    assessmentQuery.isLoading ||
    consentsQuery.isLoading
  ) {
    return (
      <Screen tint="mint">
        <LoadingState label="Loading options…" />
      </Screen>
    );
  }

  const missingProfile =
    (profileQuery.error instanceof ApiClientError &&
      profileQuery.error.status === 404) ||
    (assessmentQuery.error instanceof ApiClientError &&
      assessmentQuery.error.status === 404);
  if (missingProfile) {
    return (
      <Screen tint="mint">
        <Card>
          <AppText variant="title">Start with your money map.</AppText>
          <AppText variant="body" color={colors.muted}>
            Your horizon and risk context make these explanations useful.
          </AppText>
          <Link href="/onboarding" asChild>
            <ActionButton label="Create my profile" tone="dark" />
          </Link>
        </Card>
      </Screen>
    );
  }

  const error =
    categoriesQuery.error ??
    profileQuery.error ??
    assessmentQuery.error ??
    consentsQuery.error;
  if (error) {
    return (
      <Screen tint="mint">
        <ErrorState
          message={error instanceof Error ? error.message : "Unable to load."}
          onRetry={() => {
            void categoriesQuery.refetch();
            void profileQuery.refetch();
            void assessmentQuery.refetch();
            void consentsQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const profile = profileQuery.data;
  const assessment = assessmentQuery.data;
  const categories = categoriesQuery.data;
  if (!profile || !assessment || !categories) return null;

  const toggleCategory = (key: InvestmentCategoryKey) => {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((candidate) => candidate !== key)
        : [...current, key],
    );
  };

  return (
    <Screen tint="mint">
      <View style={{ gap: 14, paddingVertical: 8 }}>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {steps.map((label, index) => (
            <View
              key={label}
              style={{
                flex: 1,
                height: 5,
                borderRadius: radii.pill,
                backgroundColor:
                  index <= step ? colors.black : "rgba(28,28,27,0.12)",
              }}
            />
          ))}
        </View>
        <AppText variant="captionStrong" color={colors.success}>
          {steps[step].toUpperCase()} · {step + 1} OF {steps.length}
        </AppText>
        <AppText variant="title">
          {step === 0
            ? "Understand what this does."
            : step === 1
              ? "Choose your context."
              : "What interests you?"}
        </AppText>
        <AppText variant="body" color={colors.muted}>
          {step === 0
            ? "We personalize education—not products or transactions."
            : step === 1
              ? "Use general learning or connect this view to a goal."
              : "Select every category you want to compare."}
        </AppText>
      </View>

      {step === 0 ? (
        <View style={{ gap: 12 }}>
          <Card style={{ gap: 0 }}>
            {[
              [
                "person.text.rectangle",
                "Reuses your current profile and assessment",
              ],
              [
                "book.closed.fill",
                "Changes explanations and learning order only",
              ],
              ["lock.shield.fill", "Exportable, correctable and deletable"],
            ].map(([icon, label], index) => (
              <View
                key={label}
                style={{
                  minHeight: 62,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderBottomWidth: index === 2 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: radii.small,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      index === 0
                        ? colors.skySoft
                        : index === 1
                          ? colors.mint
                          : colors.orangeSoft,
                  }}
                >
                  <AppIcon name={icon as never} size={17} />
                </View>
                <AppText variant="bodyStrong" style={{ flex: 1 }}>
                  {label}
                </AppText>
              </View>
            ))}
          </Card>
          <View
            style={{
              minHeight: 66,
              paddingHorizontal: 4,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Switch
              accessibilityLabel="Consent to personalized investment education"
              value={consentAccepted}
              disabled={activeConsent}
              onValueChange={setConsentAccepted}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.white}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong">Use my financial context</AppText>
              <AppText variant="caption" color={colors.muted}>
                Education only. No named products or buy actions.
              </AppText>
            </View>
          </View>
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ gap: 14 }}>
          <SegmentedChoice
            label="Compare for"
            value={mode}
            options={
              profile.goals.length
                ? [
                    { value: "general", label: "General" },
                    { value: "goal", label: "A goal" },
                  ]
                : [{ value: "general", label: "General" }]
            }
            onChange={setMode}
          />
          {mode === "goal" ? (
            <Card style={{ gap: 0 }}>
              {profile.goals.map((goal, index) => {
                const chosen = goal.id === goalId;
                return (
                  <Pressable
                    key={goal.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: chosen }}
                    onPress={() => setGoalId(goal.id)}
                    style={({ pressed }) => ({
                      minHeight: 62,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderBottomWidth:
                        index === profile.goals.length - 1 ? 0 : 1,
                      borderBottomColor: colors.border,
                      opacity: pressed ? 0.65 : 1,
                    })}
                  >
                    <AppIcon
                      name={chosen ? "checkmark.circle.fill" : "circle"}
                      color={chosen ? colors.success : colors.mutedLight}
                    />
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyStrong">{goal.name}</AppText>
                      <AppText variant="caption" color={colors.muted}>
                        {goal.targetDate}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </Card>
          ) : null}
          <Card tone="sky">
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <AppIcon name="gauge.with.dots.needle.50percent" size={18} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color={colors.muted}>
                  Current risk context
                </AppText>
                <AppText
                  variant="bodyStrong"
                  style={{ textTransform: "capitalize" }}
                >
                  {assessment.risk.combined}
                </AppText>
              </View>
              <AppText variant="caption" color={colors.muted}>
                Read-only
              </AppText>
            </View>
          </Card>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
          {categories.map((category) => {
            const chosen = selected.includes(category.key);
            const ui = categoryUi[category.key];
            return (
              <Pressable
                key={category.key}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: chosen }}
                accessibilityLabel={category.title}
                onPress={() => toggleCategory(category.key)}
                style={({ pressed }) => ({
                  width: "48.6%",
                  minHeight: 82,
                  padding: 13,
                  borderRadius: radii.medium,
                  borderCurve: "continuous",
                  borderWidth: 1.5,
                  borderColor: chosen ? colors.black : colors.border,
                  backgroundColor: colors.surface,
                  gap: 9,
                  opacity: pressed ? 0.65 : 1,
                })}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <AppIcon name={ui.icon} size={17} />
                  {chosen ? (
                    <AppIcon
                      name="checkmark.circle.fill"
                      size={17}
                      color={colors.success}
                    />
                  ) : null}
                </View>
                <AppText variant="bodyStrong" numberOfLines={2}>
                  {category.shortTitle}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {mutation.error ? <ErrorState message={mutation.error.message} /> : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {step > 0 ? (
          <ActionButton
            label="Back"
            tone="secondary"
            style={{ flex: 0.42 }}
            onPress={() => setStep((current) => Math.max(0, current - 1))}
          />
        ) : null}
        {step < 2 ? (
          <ActionButton
            label="Continue"
            tone="dark"
            icon="arrow.right"
            style={{ flex: 1 }}
            disabled={
              !consentAccepted || (step === 1 && mode === "goal" && !goalId)
            }
            onPress={() => setStep((current) => Math.min(2, current + 1))}
          />
        ) : (
          <ActionButton
            label={
              selected.length
                ? `Compare ${selected.length} options`
                : "Select an option"
            }
            tone="dark"
            icon="arrow.right"
            style={{ flex: 1 }}
            pending={mutation.isPending}
            disabled={selected.length === 0}
            onPress={() => mutation.mutate()}
          />
        )}
      </View>
    </Screen>
  );
}
