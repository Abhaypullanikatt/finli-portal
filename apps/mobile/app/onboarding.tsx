import type {
  EmploymentStability,
  FinancialProfileInput,
} from "@financial-companion/contracts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { ProgressBar } from "@/components/progress-bar";
import { Screen } from "@/components/screen";
import { SegmentedChoice } from "@/components/segmented-choice";
import { ErrorState } from "@/components/status-state";
import { TextField } from "@/components/text-field";
import { api } from "@/lib/api";
import { rupeesToMoney } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import { colors, radii } from "@/theme/colors";

const stepCopy = [
  {
    eyebrow: "Cash flow",
    title: "What comes in each month?",
    detail: "Approximate figures are completely fine.",
  },
  {
    eyebrow: "Debt & savings",
    title: "What is already committed?",
    detail: "This helps us prioritize your next action.",
  },
  {
    eyebrow: "Stability",
    title: "Build your safety picture.",
    detail: "Dependants and protection affect financial capacity.",
  },
  {
    eyebrow: "Risk & time",
    title: "Tell us how money uncertainty feels to you.",
    detail: "There is no right answer—only what fits your life today.",
  },
  {
    eyebrow: "Direction",
    title: "Add a goal, then review how your data is used.",
    detail: "A goal is optional. Clear consent is not.",
  },
] as const;

function ToggleRow({
  label,
  detail,
  value,
  onValueChange,
  last = false,
}: {
  label: string;
  detail: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="bodyStrong">{label}</AppText>
        <AppText variant="caption" color={colors.muted}>
          {detail}
        </AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState("45000");
  const [essential, setEssential] = useState("24000");
  const [lifestyle, setLifestyle] = useState("10000");
  const [debtPayment, setDebtPayment] = useState("0");
  const [debtBalance, setDebtBalance] = useState("0");
  const [savings, setSavings] = useState("25000");
  const [dependants, setDependants] = useState("0");
  const [employment, setEmployment] = useState<EmploymentStability>("stable");
  const [hasHealth, setHasHealth] = useState(false);
  const [hasLife, setHasLife] = useState(false);
  const [savedMonths, setSavedMonths] = useState("3");
  const [knowledge, setKnowledge] = useState<"new" | "some" | "comfortable">(
    "new",
  );
  const [riskComfort, setRiskComfort] = useState<"low" | "medium" | "high">(
    "low",
  );
  const [liquidity, setLiquidity] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [horizon, setHorizon] = useState("5");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalSaved, setGoalSaved] = useState("0");
  const [goalDate, setGoalDate] = useState("2029-07-01");
  const [consent, setConsent] = useState(false);
  const [hydratedExistingProfile, setHydratedExistingProfile] = useState(false);
  const existingProfileQuery = useQuery({
    queryKey: ["profile", "current"],
    queryFn: api.currentProfile,
    retry: false,
  });

  useEffect(() => {
    const profile = existingProfileQuery.data;
    if (!profile || hydratedExistingProfile) return;
    const rupees = (amountPaise: number) => String(amountPaise / 100);
    setIncome(rupees(profile.monthlyIncome.amountPaise));
    setEssential(rupees(profile.essentialExpenses.amountPaise));
    setLifestyle(rupees(profile.lifestyleExpenses.amountPaise));
    setDebtPayment(rupees(profile.monthlyDebtPayments.amountPaise));
    setDebtBalance(rupees(profile.highCostDebtBalance.amountPaise));
    setSavings(rupees(profile.liquidSavings.amountPaise));
    setDependants(String(profile.dependants));
    setEmployment(profile.employmentStability);
    setHasHealth(profile.hasHealthInsurance);
    setHasLife(profile.hasLifeInsurance);
    setSavedMonths(String(profile.monthsSavedInLastSix));
    setKnowledge(
      profile.knowledgeScore >= 70
        ? "comfortable"
        : profile.knowledgeScore >= 40
          ? "some"
          : "new",
    );
    const willingnessAverage =
      profile.willingnessAnswers.reduce((sum, value) => sum + value, 0) /
      profile.willingnessAnswers.length;
    setRiskComfort(
      willingnessAverage >= 2.5
        ? "high"
        : willingnessAverage >= 1
          ? "medium"
          : "low",
    );
    setLiquidity(profile.needForLiquidity);
    setHorizon(String(profile.investmentHorizonYears));
    const goal = profile.goals[0];
    if (goal) {
      setGoalName(goal.name);
      setGoalTarget(rupees(goal.target.amountPaise));
      setGoalSaved(rupees(goal.saved.amountPaise));
      setGoalDate(goal.targetDate);
    }
    setHydratedExistingProfile(true);
  }, [existingProfileQuery.data, hydratedExistingProfile]);

  const mutation = useMutation({
    mutationFn: async () => {
      const riskScore =
        riskComfort === "low" ? 0 : riskComfort === "medium" ? 1 : 3;
      const profile: FinancialProfileInput = {
        monthlyIncome: rupeesToMoney(income),
        essentialExpenses: rupeesToMoney(essential),
        lifestyleExpenses: rupeesToMoney(lifestyle),
        monthlyDebtPayments: rupeesToMoney(debtPayment),
        highCostDebtBalance: rupeesToMoney(debtBalance),
        liquidSavings: rupeesToMoney(savings),
        dependants: Math.max(0, Number(dependants) || 0),
        hasHealthInsurance: hasHealth,
        hasLifeInsurance: hasLife,
        employmentStability: employment,
        monthsSavedInLastSix: Math.max(
          0,
          Math.min(6, Number(savedMonths) || 0),
        ),
        knowledgeScore:
          knowledge === "new" ? 25 : knowledge === "some" ? 50 : 75,
        needForLiquidity: liquidity,
        investmentHorizonYears: Math.max(0, Number(horizon) || 0),
        willingnessAnswers: [riskScore, riskScore, riskScore],
        goals:
          goalName.trim() && Number(goalTarget) > 0
            ? [
                {
                  id: `goal-${Date.now()}`,
                  name: goalName.trim(),
                  target: rupeesToMoney(goalTarget),
                  saved: rupeesToMoney(goalSaved),
                  targetDate: goalDate,
                  priority: "medium",
                },
              ]
            : [],
      };
      await api.grantConsent(
        "financial_profile",
        "Retain profile snapshots until account deletion or a legally required retention period.",
      );
      await api.createProfile(profile);
      return api.generateAssessment();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      router.replace("/(tabs)");
    },
  });

  const goToStep = (nextStep: number) => {
    setStep(Math.max(0, Math.min(stepCopy.length - 1, nextStep)));
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  return (
    <Screen ref={scrollRef} tint="peach">
      <View style={{ gap: 15, paddingVertical: 8 }}>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {stepCopy.map((item, index) => (
            <View
              key={item.eyebrow}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <AppText
            variant="captionStrong"
            color={colors.success}
            style={{ textTransform: "uppercase", letterSpacing: 1.2 }}
          >
            {stepCopy[step].eyebrow}
          </AppText>
          <AppText variant="caption" color={colors.muted}>
            {step + 1} of {stepCopy.length}
          </AppText>
        </View>
        <AppText variant="title">{stepCopy[step].title}</AppText>
        <AppText variant="body" color={colors.muted}>
          {stepCopy[step].detail}
        </AppText>
      </View>

      {step === 0 ? (
        <View style={{ gap: 16 }}>
          <TextField
            label="Take-home income (₹)"
            value={income}
            onChangeText={setIncome}
            keyboardType="number-pad"
          />
          <TextField
            label="Essential expenses (₹)"
            value={essential}
            onChangeText={setEssential}
            keyboardType="number-pad"
            hint="Housing, food, utilities, transport and other essentials."
          />
          <TextField
            label="Lifestyle expenses (₹)"
            value={lifestyle}
            onChangeText={setLifestyle}
            keyboardType="number-pad"
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ gap: 16 }}>
          <TextField
            label="Monthly debt payments (₹)"
            value={debtPayment}
            onChangeText={setDebtPayment}
            keyboardType="number-pad"
          />
          <TextField
            label="High-cost debt balance (₹)"
            value={debtBalance}
            onChangeText={setDebtBalance}
            keyboardType="number-pad"
            hint="For example, revolving credit-card or other expensive debt."
          />
          <TextField
            label="Liquid savings (₹)"
            value={savings}
            onChangeText={setSavings}
            keyboardType="number-pad"
          />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ gap: 16 }}>
          <SegmentedChoice
            label="Income stability"
            value={employment}
            options={[
              { value: "unstable", label: "Unstable" },
              { value: "variable", label: "Variable" },
              { value: "stable", label: "Stable" },
            ]}
            onChange={setEmployment}
          />
          <TextField
            label="People who depend on this income"
            value={dependants}
            onChangeText={setDependants}
            keyboardType="number-pad"
          />
          <TextField
            label="Months you saved in the last six"
            value={savedMonths}
            onChangeText={setSavedMonths}
            keyboardType="number-pad"
            hint="A number from 0 to 6."
          />
          <Card style={{ gap: 0 }}>
            <ToggleRow
              label="Health insurance"
              detail="You have current health coverage."
              value={hasHealth}
              onValueChange={setHasHealth}
            />
            <ToggleRow
              label="Life insurance"
              detail="You have cover for financial dependants."
              value={hasLife}
              onValueChange={setHasLife}
              last
            />
          </Card>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ gap: 18 }}>
          <SegmentedChoice
            label="Financial knowledge"
            value={knowledge}
            options={[
              { value: "new", label: "New" },
              { value: "some", label: "Some" },
              { value: "comfortable", label: "Confident" },
            ]}
            onChange={setKnowledge}
          />
          <SegmentedChoice
            label="Comfort with a temporary loss"
            value={riskComfort}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            onChange={setRiskComfort}
          />
          <SegmentedChoice
            label="Need for quick access to this money"
            value={liquidity}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            onChange={setLiquidity}
          />
          <TextField
            label="Investment horizon (years)"
            value={horizon}
            onChangeText={setHorizon}
            keyboardType="number-pad"
          />
          <Card tone="purple">
            <View style={{ flexDirection: "row", gap: 12 }}>
              <AppIcon
                name="gauge.with.dots.needle.50percent"
                color={colors.primaryDeep}
              />
              <AppText
                variant="caption"
                color={colors.primaryDeep}
                style={{ flex: 1 }}
              >
                We calculate willingness and capacity separately, then explain
                the more cautious combined result.
              </AppText>
            </View>
          </Card>
        </View>
      ) : null}

      {step === 4 ? (
        <View style={{ gap: 16 }}>
          <TextField
            label="Goal name (optional)"
            value={goalName}
            onChangeText={setGoalName}
            placeholder="Vehicle, travel, education…"
          />
          <TextField
            label="Target amount (₹)"
            value={goalTarget}
            onChangeText={setGoalTarget}
            keyboardType="number-pad"
          />
          <TextField
            label="Already saved (₹)"
            value={goalSaved}
            onChangeText={setGoalSaved}
            keyboardType="number-pad"
          />
          <TextField
            label="Target date"
            value={goalDate}
            onChangeText={setGoalDate}
            placeholder="YYYY-MM-DD"
          />
          <Card tone="lime">
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <Switch
                value={consent}
                onValueChange={setConsent}
                trackColor={{ false: "#B6C25F", true: colors.ink }}
                thumbColor={colors.white}
              />
              <View style={{ flex: 1, gap: 5 }}>
                <AppText variant="bodyStrong">Use my financial profile</AppText>
                <AppText variant="caption" color="#4A541B">
                  Store this as a versioned profile and use it to create an
                  educational health result and roadmap. You can export or
                  delete it later.
                </AppText>
              </View>
            </View>
          </Card>
        </View>
      ) : null}

      {mutation.error ? <ErrorState message={mutation.error.message} /> : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {step > 0 ? (
          <ActionButton
            label="Back"
            tone="secondary"
            style={{ flex: 0.42 }}
            onPress={() => goToStep(step - 1)}
          />
        ) : null}
        {step < stepCopy.length - 1 ? (
          <ActionButton
            label="Continue"
            tone="dark"
            icon="arrow.right"
            style={{ flex: 1 }}
            onPress={() => goToStep(step + 1)}
          />
        ) : (
          <ActionButton
            label="Create my roadmap"
            tone="dark"
            icon="sparkles"
            style={{ flex: 1 }}
            pending={mutation.isPending}
            disabled={!consent}
            onPress={() => mutation.mutate()}
          />
        )}
      </View>

      {step === 4 && !consent ? (
        <View
          style={{
            alignSelf: "center",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceStrong,
          }}
        >
          <AppText variant="caption" color={colors.muted}>
            Review and enable consent to continue
          </AppText>
        </View>
      ) : null}
    </Screen>
  );
}
