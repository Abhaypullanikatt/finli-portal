import type {
  AssessmentResult,
  FinancialProfileSnapshot,
  InvestmentCategory,
  InvestmentExplorerEntry,
  InvestmentExplorerResult,
  InvestmentPreferenceSnapshot,
  MoneyAmount,
  RiskClass,
  Roadmap,
  RoadmapActionKind,
} from "@financial-companion/contracts";

export const FINANCIAL_RULE_SET_VERSION = "2026-07-draft.1";
export const INVESTMENT_EXPLORER_RULE_SET_VERSION = "2026-07-draft.1";
export const METHODOLOGY_WARNING =
  "This beta result is educational financial guidance, not investment advice. The draft methodology requires approval by a qualified financial reviewer before use with real users.";
export const INVESTMENT_EXPLORER_DISCLAIMER =
  "This explorer personalizes what to learn. It does not recommend a security, fund, deposit, property, allocation, or transaction.";

const money = (amountPaise: number): MoneyAmount => ({
  amountPaise: Math.max(0, Math.round(amountPaise)),
  currency: "INR",
});

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const ratioScore = (
  ratio: number,
  bands: ReadonlyArray<readonly [number, number]>,
) => {
  for (const [upperBound, score] of bands) {
    if (ratio < upperBound) return score;
  }
  return 100;
};

const riskIndex = (risk: RiskClass) =>
  ["conservative", "moderate", "growth", "aggressive"].indexOf(risk);

const riskFromScore = (score: number): RiskClass => {
  if (score < 30) return "conservative";
  if (score < 55) return "moderate";
  if (score < 80) return "growth";
  return "aggressive";
};

const scoreProfile = (profile: FinancialProfileSnapshot) => {
  const income = profile.monthlyIncome.amountPaise;
  const essential = profile.essentialExpenses.amountPaise;
  const lifestyle = profile.lifestyleExpenses.amountPaise;
  const debtPayment = profile.monthlyDebtPayments.amountPaise;
  const totalOutflow = essential + lifestyle + debtPayment;
  const monthlySurplus = income - totalOutflow;
  const surplusRatio = income > 0 ? monthlySurplus / income : -1;
  const debtRatio = income > 0 ? debtPayment / income : 1;
  const emergencyMonths =
    essential > 0 ? profile.liquidSavings.amountPaise / essential : 6;

  const cashFlow = ratioScore(surplusRatio, [
    [0, 0],
    [0.05, 25],
    [0.15, 50],
    [0.25, 75],
  ]);
  const debt =
    profile.highCostDebtBalance.amountPaise === 0
      ? debtRatio < 0.2
        ? 100
        : 70
      : ratioScore(debtRatio, [
          [0.1, 55],
          [0.2, 35],
          [0.35, 15],
        ]);
  const emergencyFund = clamp((emergencyMonths / 6) * 100);
  const savingsConsistency = clamp((profile.monthsSavedInLastSix / 6) * 100);
  const protection =
    profile.dependants > 0
      ? (profile.hasHealthInsurance ? 50 : 0) +
        (profile.hasLifeInsurance ? 50 : 0)
      : profile.hasHealthInsurance
        ? 100
        : 40;
  const goalReadiness =
    profile.goals.length === 0
      ? 25
      : clamp(
          (profile.goals.reduce((sum, goal) => {
            const target = goal.target.amountPaise;
            return sum + (target > 0 ? goal.saved.amountPaise / target : 1);
          }, 0) /
            profile.goals.length) *
            100,
        );
  const knowledge = profile.knowledgeScore;

  const dimensions = [
    {
      key: "cashFlow" as const,
      score: cashFlow,
      label: "Monthly cash flow",
      explanation:
        monthlySurplus >= 0
          ? `Your current monthly surplus is about ₹${Math.round(monthlySurplus / 100).toLocaleString("en-IN")}.`
          : `Your current spending and debt payments exceed income by about ₹${Math.round(Math.abs(monthlySurplus) / 100).toLocaleString("en-IN")}.`,
    },
    {
      key: "debt" as const,
      score: debt,
      label: "Debt pressure",
      explanation:
        profile.highCostDebtBalance.amountPaise > 0
          ? "High-cost debt reduces the money available for savings and resilience."
          : "No high-cost debt was reported.",
    },
    {
      key: "emergencyFund" as const,
      score: emergencyFund,
      label: "Emergency fund",
      explanation: `Liquid savings cover approximately ${emergencyMonths.toFixed(1)} months of essential expenses.`,
    },
    {
      key: "savingsConsistency" as const,
      score: savingsConsistency,
      label: "Savings consistency",
      explanation: `You saved in ${profile.monthsSavedInLastSix} of the last 6 months.`,
    },
    {
      key: "protection" as const,
      score: protection,
      label: "Protection awareness",
      explanation:
        "This dimension checks reported health and life protection; it does not assess policy suitability.",
    },
    {
      key: "goalReadiness" as const,
      score: goalReadiness,
      label: "Goal readiness",
      explanation:
        profile.goals.length > 0
          ? `${profile.goals.length} financial goal${profile.goals.length === 1 ? "" : "s"} supplied.`
          : "No financial goal has been defined yet.",
    },
    {
      key: "knowledge" as const,
      score: knowledge,
      label: "Financial knowledge",
      explanation:
        "This is based on the onboarding knowledge check and is not a measure of intelligence.",
    },
  ];

  const healthScore = clamp(
    cashFlow * 0.25 +
      debt * 0.2 +
      emergencyFund * 0.2 +
      savingsConsistency * 0.1 +
      protection * 0.1 +
      goalReadiness * 0.1 +
      knowledge * 0.05,
  );

  return {
    dimensions,
    healthScore,
    monthlySurplus,
    emergencyMonths,
    debtRatio,
  };
};

const assessRisk = (
  profile: FinancialProfileSnapshot,
  emergencyMonths: number,
  debtRatio: number,
) => {
  const willingnessAverage =
    profile.willingnessAnswers.reduce((sum, value) => sum + value, 0) /
    profile.willingnessAnswers.length;
  const willingness = riskFromScore((willingnessAverage / 3) * 100);

  let capacityScore = 50;
  capacityScore += profile.employmentStability === "stable" ? 15 : -15;
  capacityScore += emergencyMonths >= 6 ? 15 : emergencyMonths >= 3 ? 5 : -15;
  capacityScore += debtRatio < 0.1 ? 10 : debtRatio > 0.3 ? -15 : 0;
  capacityScore +=
    profile.dependants === 0 ? 5 : -Math.min(15, profile.dependants * 5);
  capacityScore +=
    profile.investmentHorizonYears >= 7
      ? 10
      : profile.investmentHorizonYears < 3
        ? -15
        : 0;
  capacityScore +=
    profile.needForLiquidity === "low"
      ? 5
      : profile.needForLiquidity === "high"
        ? -15
        : 0;
  const capacity = riskFromScore(clamp(capacityScore));
  const combined =
    riskIndex(willingness) <= riskIndex(capacity) ? willingness : capacity;

  return {
    willingness,
    capacity,
    combined,
    explanation:
      willingness === capacity
        ? `Your willingness and financial capacity both indicate a ${combined} risk profile.`
        : `Your willingness is ${willingness}, while your financial capacity is ${capacity}; the more conservative ${combined} result is used.`,
  };
};

export const calculateAssessment = (
  profile: FinancialProfileSnapshot,
  options?: { id?: string; createdAt?: string },
): AssessmentResult => {
  const {
    dimensions,
    healthScore,
    monthlySurplus,
    emergencyMonths,
    debtRatio,
  } = scoreProfile(profile);
  const risk = assessRisk(profile, emergencyMonths, debtRatio);
  const rationale = dimensions
    .filter((dimension) => dimension.score < 60)
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map((dimension) => `${dimension.label}: ${dimension.explanation}`);
  const warnings = [METHODOLOGY_WARNING];
  if (monthlySurplus < 0) {
    warnings.push(
      "Your reported monthly outflows are higher than income. Stabilizing cash flow is prioritized.",
    );
  }
  if (profile.highCostDebtBalance.amountPaise > 0) {
    warnings.push(
      "High-cost debt is prioritized before taking substantial investment risk.",
    );
  }

  return {
    id: options?.id ?? `assessment-${profile.id}`,
    userId: profile.userId,
    profileSnapshotId: profile.id,
    healthScore,
    dimensions,
    risk,
    ruleSetVersion: FINANCIAL_RULE_SET_VERSION,
    rationale,
    warnings,
    createdAt: options?.createdAt ?? new Date().toISOString(),
  };
};

type RoadmapCandidate = {
  kind: RoadmapActionKind;
  title: string;
  rationale: string;
  target?: MoneyAmount;
  lessonId?: string;
};

export const generateRoadmap = (
  profile: FinancialProfileSnapshot,
  assessment: AssessmentResult,
  options?: { id?: string; createdAt?: string },
): Roadmap => {
  const income = profile.monthlyIncome.amountPaise;
  const outflows =
    profile.essentialExpenses.amountPaise +
    profile.lifestyleExpenses.amountPaise +
    profile.monthlyDebtPayments.amountPaise;
  const surplus = income - outflows;
  const starterBuffer = profile.essentialExpenses.amountPaise;
  const fullEmergencyFund = profile.essentialExpenses.amountPaise * 6;
  const candidates: RoadmapCandidate[] = [];

  if (surplus < 0) {
    candidates.push({
      kind: "stabilize_cash_flow",
      title: "Bring monthly cash flow above zero",
      rationale: `Reported outflows exceed income by approximately ₹${Math.round(Math.abs(surplus) / 100).toLocaleString("en-IN")} each month.`,
      target: money(Math.abs(surplus)),
      lessonId: "lesson-cash-flow",
    });
  }
  if (profile.highCostDebtBalance.amountPaise > 0) {
    candidates.push({
      kind: "repay_high_cost_debt",
      title: "Reduce high-cost debt",
      rationale:
        "Reducing expensive debt can strengthen monthly cash flow before taking substantial investment risk.",
      target: profile.highCostDebtBalance,
      lessonId: "lesson-high-cost-debt",
    });
  }
  if (profile.liquidSavings.amountPaise < starterBuffer) {
    candidates.push({
      kind: "build_starter_buffer",
      title: "Build a starter emergency buffer",
      rationale:
        "A starter buffer can reduce the need to borrow for a routine unexpected expense.",
      target: money(starterBuffer),
      lessonId: "lesson-emergency-fund",
    });
  }
  if (profile.liquidSavings.amountPaise < fullEmergencyFund) {
    candidates.push({
      kind: "build_emergency_fund",
      title: "Build a safety fund",
      rationale:
        "The beta uses six months of reported essential expenses as an educational planning reference, not a universal prescription.",
      target: money(fullEmergencyFund),
      lessonId: "lesson-emergency-fund",
    });
  }
  if (
    !profile.hasHealthInsurance ||
    (profile.dependants > 0 && !profile.hasLifeInsurance)
  ) {
    candidates.push({
      kind: "learn_protection",
      title: "Understand essential protection",
      rationale:
        "Learn the purpose and limitations of health and life cover before comparing products.",
      lessonId: "lesson-protection",
    });
  }
  if (profile.goals.length === 0) {
    candidates.push({
      kind: "define_goals",
      title: "Define your first financial goal",
      rationale:
        "A target amount and date help separate short-term cash needs from long-term investing.",
      lessonId: "lesson-goals",
    });
  }
  candidates.push({
    kind: "learn_investing",
    title: "Learn investment categories",
    rationale: `Explore risk, liquidity, cost, and time horizon using your ${assessment.risk.combined} educational risk profile. This is not a product recommendation.`,
    lessonId: "lesson-investment-categories",
  });

  return {
    id: options?.id ?? `roadmap-${assessment.id}`,
    userId: profile.userId,
    assessmentId: assessment.id,
    ruleSetVersion: FINANCIAL_RULE_SET_VERSION,
    actions: candidates.map((candidate, index) => ({
      id: `action-${assessment.id}-${index + 1}`,
      ...candidate,
      position: index + 1,
      status: index === 0 ? "recommended" : "blocked",
    })),
    createdAt: options?.createdAt ?? new Date().toISOString(),
  };
};

const yearsUntil = (targetDate: string, fromDate: string) => {
  const milliseconds =
    new Date(`${targetDate}T00:00:00.000Z`).getTime() -
    new Date(fromDate).getTime();
  const years = milliseconds / (365.25 * 24 * 60 * 60 * 1_000);
  return Math.max(0, Math.round(years * 10) / 10);
};

const liquidityRank = (value: "low" | "medium" | "high") =>
  ({ low: 0, medium: 1, high: 2 })[value];

const foundationAction = (
  profile: FinancialProfileSnapshot,
): RoadmapActionKind | undefined => {
  const outflows =
    profile.essentialExpenses.amountPaise +
    profile.lifestyleExpenses.amountPaise +
    profile.monthlyDebtPayments.amountPaise;
  if (outflows > profile.monthlyIncome.amountPaise) {
    return "stabilize_cash_flow";
  }
  if (profile.highCostDebtBalance.amountPaise > 0) {
    return "repay_high_cost_debt";
  }
  if (
    profile.liquidSavings.amountPaise < profile.essentialExpenses.amountPaise
  ) {
    return "build_starter_buffer";
  }
  return undefined;
};

const foundationWarning: Record<RoadmapActionKind, string> = {
  stabilize_cash_flow:
    "Your reported monthly outflows are above income. Explore the category, while keeping cash-flow stability as the current roadmap priority.",
  repay_high_cost_debt:
    "High-cost debt is still present. Explore the category, while keeping expensive-debt reduction as the current roadmap priority.",
  build_starter_buffer:
    "Your liquid savings are below one month of essential expenses. Explore the category, while keeping a starter buffer as the current roadmap priority.",
  build_emergency_fund:
    "Continue learning while building deeper emergency savings.",
  learn_protection:
    "Continue learning while reviewing essential financial protection.",
  define_goals: "Define a goal to give this learning a clearer time context.",
  learn_investing:
    "This category is available for education, not as an investment recommendation.",
};

export const generateInvestmentExplorerResult = (
  profile: FinancialProfileSnapshot,
  assessment: AssessmentResult,
  preference: InvestmentPreferenceSnapshot,
  categories: InvestmentCategory[],
  options?: { id?: string; createdAt?: string },
): InvestmentExplorerResult => {
  if (assessment.profileSnapshotId !== profile.id) {
    throw new Error("ASSESSMENT_STALE");
  }
  if (
    preference.profileSnapshotId !== profile.id ||
    preference.assessmentId !== assessment.id
  ) {
    throw new Error("PREFERENCE_CONTEXT_MISMATCH");
  }

  const createdAt = options?.createdAt ?? new Date().toISOString();
  const goal =
    preference.mode === "goal"
      ? profile.goals.find((candidate) => candidate.id === preference.goalId)
      : undefined;
  if (preference.mode === "goal" && !goal) {
    throw new Error("GOAL_NOT_FOUND");
  }

  const horizonYears = goal
    ? yearsUntil(goal.targetDate, createdAt)
    : profile.investmentHorizonYears;
  const currentFoundationAction = foundationAction(profile);
  const byKey = new Map(categories.map((category) => [category.key, category]));
  const selected = preference.selectedCategoryKeys.map((key) => {
    const category = byKey.get(key);
    if (!category) throw new Error(`CATEGORY_NOT_FOUND:${key}`);
    return category;
  });

  const entries: InvestmentExplorerEntry[] = selected.map((category) => {
    if (currentFoundationAction) {
      return {
        category,
        status: "foundation_first",
        rationale: `You chose ${category.shortTitle}. This learning view keeps your current financial-foundation step visible before discussing longer-term uncertainty.`,
        warnings: [foundationWarning[currentFoundationAction]],
        foundationActionKind: currentFoundationAction,
      };
    }

    const warnings: string[] = [];
    if (
      riskIndex(assessment.risk.combined) < category.matching.variabilityRank
    ) {
      warnings.push(
        `This category can involve more variability than your ${assessment.risk.combined} educational risk profile currently indicates.`,
      );
    }
    if (horizonYears < category.matching.minimumLearningHorizonYears) {
      warnings.push(
        `Your ${horizonYears.toFixed(1)}-year learning context is shorter than the category’s draft ${category.matching.minimumLearningHorizonYears}-year reference.`,
      );
    }
    if (
      liquidityRank(profile.needForLiquidity) >
      liquidityRank(category.matching.liquidityBand)
    ) {
      warnings.push(
        `Your ${profile.needForLiquidity} need for liquidity may conflict with this category’s ${category.matching.liquidityBand} access profile.`,
      );
    }

    return {
      category,
      status: warnings.length > 0 ? "explore_with_caution" : "ready_to_learn",
      rationale: `You selected ${category.shortTitle}. The explanation uses your ${assessment.risk.combined} educational risk profile, ${horizonYears.toFixed(1)}-year context, and ${profile.needForLiquidity} liquidity need.`,
      warnings:
        warnings.length > 0
          ? warnings
          : [
              "Ready to learn describes the educational context only; it does not mean this category or any product is suitable for you.",
            ],
    };
  });

  const contentVersions = [
    ...new Set(selected.map((category) => category.contentVersion)),
  ].sort();
  const reviewStatus = selected.every(
    (category) =>
      category.review.status === "approved" &&
      category.matching.review.status === "approved",
  )
    ? "approved"
    : "draft";

  return {
    id: options?.id ?? `investment-result-${preference.id}`,
    userId: profile.userId,
    preferenceSnapshotId: preference.id,
    profileSnapshotId: profile.id,
    assessmentId: assessment.id,
    mode: preference.mode,
    goal: goal
      ? {
          id: goal.id,
          name: goal.name,
          horizonYears,
        }
      : undefined,
    horizonYears,
    risk: assessment.risk,
    ruleSetVersion: INVESTMENT_EXPLORER_RULE_SET_VERSION,
    categoryContentVersion:
      contentVersions.length === 1
        ? contentVersions[0]!
        : `mixed:${contentVersions.join(",")}`,
    reviewStatus,
    entries,
    disclaimer: INVESTMENT_EXPLORER_DISCLAIMER,
    createdAt,
  };
};
