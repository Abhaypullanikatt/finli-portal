import {
  InvestmentCategoryKeySchema,
  type ConsultationRequest,
} from "@financial-companion/contracts";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { SegmentedChoice } from "@/components/segmented-choice";
import { ErrorState } from "@/components/status-state";
import { TextField } from "@/components/text-field";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { colors, radii } from "@/theme/colors";

export default function ConsultationScreen() {
  const params = useLocalSearchParams<{
    topic?: string;
    categoryKey?: string;
    explorerResultId?: string;
  }>();
  const parsedCategory = InvestmentCategoryKeySchema.safeParse(
    params.categoryKey,
  );
  const investmentContext =
    params.topic === "investment_education" &&
    parsedCategory.success &&
    typeof params.explorerResultId === "string" &&
    params.explorerResultId.length > 0
      ? {
          investmentCategoryKey: parsedCategory.data,
          explorerResultId: params.explorerResultId,
        }
      : undefined;
  const [topic, setTopic] = useState<ConsultationRequest["topic"]>(
    investmentContext ? "investment_education" : "roadmap_orientation",
  );
  const [window, setWindow] = useState("Weekday evening, 6–8 PM IST");
  const mutation = useMutation({
    mutationFn: async () => {
      await api.grantConsent(
        "consultation",
        "Retain booking details and operational notes until account deletion or the approved consultation retention period.",
      );
      return api.requestConsultation(
        topic,
        window,
        topic === "investment_education" ? investmentContext : undefined,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });

  if (mutation.data) {
    return (
      <Screen
        tint="mint"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <Card style={{ alignItems: "center", gap: 18 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radii.pill,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.lime,
              boxShadow: "0 0 30px rgba(217,255,105,0.28)",
            }}
          >
            <AppIcon name="checkmark" size={28} />
          </View>
          <View style={{ alignItems: "center", gap: 7 }}>
            <AppText variant="title" style={{ textAlign: "center" }}>
              Request received.
            </AppText>
            <AppText
              variant="body"
              color={colors.muted}
              style={{ textAlign: "center" }}
            >
              A team member will manually confirm a time in your preferred
              window.
            </AppText>
          </View>
          <Card
            style={{
              alignSelf: "stretch",
              backgroundColor: colors.surfaceStrong,
              boxShadow: "none",
            }}
          >
            <AppText variant="caption" color={colors.muted}>
              Preferred time
            </AppText>
            <AppText variant="bodyStrong">
              {mutation.data.preferredWindow}
            </AppText>
          </Card>
          <ActionButton
            label="Done"
            tone="dark"
            style={{ alignSelf: "stretch" }}
            onPress={() => router.back()}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen tint="mint">
      <Card tone="purple">
        <View style={{ flexDirection: "row", gap: 13 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.small,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.white,
            }}
          >
            <AppIcon name="phone.fill" color={colors.primaryDeep} />
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <AppText variant="subheading">A human orientation</AppText>
            <AppText variant="caption" color={colors.primaryDeep}>
              {investmentContext
                ? "Ask questions about the category explanation in your learning view. No products or transactions."
                : "Understand your roadmap and ask questions about general financial concepts."}
            </AppText>
          </View>
        </View>
      </Card>

      <SegmentedChoice
        label="What would you like to discuss?"
        value={topic}
        options={
          investmentContext
            ? [
                { value: "roadmap_orientation", label: "Roadmap" },
                { value: "budget_coaching", label: "Budget" },
                { value: "debt_education", label: "Debt" },
                { value: "investment_education", label: "Investing" },
              ]
            : [
                { value: "roadmap_orientation", label: "Roadmap" },
                { value: "budget_coaching", label: "Budget" },
                { value: "debt_education", label: "Debt" },
              ]
        }
        onChange={setTopic}
      />
      <TextField
        label="Preferred time"
        value={window}
        onChangeText={setWindow}
        hint="Share a few options; confirmation is handled manually."
      />
      {mutation.error ? <ErrorState message={mutation.error.message} /> : null}
      <ActionButton
        label="Request orientation"
        tone="dark"
        icon="arrow.right"
        pending={mutation.isPending}
        disabled={
          window.trim().length < 3 ||
          (topic === "investment_education" && !investmentContext)
        }
        onPress={() => mutation.mutate()}
      />

      <Card tone="lime">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <AppIcon name="shield.fill" />
          <AppText variant="caption" color="#4A541B" style={{ flex: 1 }}>
            This call is educational, is not recorded, and does not include a
            product or security recommendation.
          </AppText>
        </View>
      </Card>
    </Screen>
  );
}
