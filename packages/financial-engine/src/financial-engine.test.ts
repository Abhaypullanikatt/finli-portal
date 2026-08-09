import type {
  FinancialProfileInput,
  FinancialProfileSnapshot,
  InvestmentCategory,
  InvestmentPreferenceSnapshot,
} from "@financial-companion/contracts";
import { describe, expect, it } from "vitest";
import {
  calculateAssessment,
  FINANCIAL_RULE_SET_VERSION,
  generateInvestmentExplorerResult,
  generateRoadmap,
  INVESTMENT_EXPLORER_RULE_SET_VERSION,
} from "./index.js";

const rupees = (value: number) => ({
  amountPaise: value * 100,
  currency: "INR" as const,
});

const baseProfile: FinancialProfileInput = {
  monthlyIncome: rupees(45_000),
  essentialExpenses: rupees(24_000),
  lifestyleExpenses: rupees(10_000),
  monthlyDebtPayments: rupees(2_000),
  highCostDebtBalance: rupees(0),
  liquidSavings: rupees(72_000),
  dependants: 0,
  hasHealthInsurance: true,
  hasLifeInsurance: false,
  employmentStability: "stable",
  monthsSavedInLastSix: 5,
  knowledgeScore: 45,
  needForLiquidity: "medium",
  investmentHorizonYears: 7,
  willingnessAnswers: [1, 2, 2, 1],
  goals: [
    {
      id: "goal-vehicle",
      name: "Vehicle",
      target: rupees(400_000),
      saved: rupees(40_000),
      targetDate: "2029-07-01",
      priority: "medium",
    },
  ],
};

const scenarios: ReadonlyArray<
  Readonly<{
    name: string;
    patch: Partial<FinancialProfileInput>;
    expectedFirst:
      | "stabilize_cash_flow"
      | "repay_high_cost_debt"
      | "build_starter_buffer"
      | "build_emergency_fund"
      | "learn_protection"
      | "define_goals"
      | "learn_investing";
  }>
> = [
  {
    name: "negative cash flow",
    patch: { lifestyleExpenses: rupees(25_000) },
    expectedFirst: "stabilize_cash_flow",
  },
  {
    name: "credit card debt",
    patch: { highCostDebtBalance: rupees(35_000) },
    expectedFirst: "repay_high_cost_debt",
  },
  {
    name: "no liquid savings",
    patch: { liquidSavings: rupees(0) },
    expectedFirst: "build_starter_buffer",
  },
  {
    name: "one month saved",
    patch: { liquidSavings: rupees(24_000) },
    expectedFirst: "build_emergency_fund",
  },
  {
    name: "no protection",
    patch: { hasHealthInsurance: false, liquidSavings: rupees(180_000) },
    expectedFirst: "learn_protection",
  },
  {
    name: "no goals",
    patch: { goals: [], liquidSavings: rupees(180_000) },
    expectedFirst: "define_goals",
  },
  {
    name: "strong foundation",
    patch: { liquidSavings: rupees(200_000) },
    expectedFirst: "learn_investing",
  },
  {
    name: "unstable income",
    patch: { employmentStability: "unstable" },
    expectedFirst: "build_emergency_fund",
  },
  {
    name: "two dependants without life cover",
    patch: {
      dependants: 2,
      hasLifeInsurance: false,
      liquidSavings: rupees(180_000),
    },
    expectedFirst: "learn_protection",
  },
  {
    name: "high debt payment",
    patch: {
      monthlyDebtPayments: rupees(18_000),
      highCostDebtBalance: rupees(120_000),
    },
    expectedFirst: "stabilize_cash_flow",
  },
  {
    name: "low income and tight cash flow",
    patch: {
      monthlyIncome: rupees(20_000),
      essentialExpenses: rupees(17_000),
      lifestyleExpenses: rupees(3_500),
    },
    expectedFirst: "stabilize_cash_flow",
  },
  {
    name: "variable income and small buffer",
    patch: {
      employmentStability: "variable",
      liquidSavings: rupees(10_000),
    },
    expectedFirst: "build_starter_buffer",
  },
  {
    name: "high liquidity need",
    patch: { needForLiquidity: "high" },
    expectedFirst: "build_emergency_fund",
  },
  {
    name: "short horizon",
    patch: { investmentHorizonYears: 1 },
    expectedFirst: "build_emergency_fund",
  },
  {
    name: "very conservative willingness",
    patch: { willingnessAnswers: [0, 0, 0] },
    expectedFirst: "build_emergency_fund",
  },
  {
    name: "aggressive willingness constrained by capacity",
    patch: {
      willingnessAnswers: [3, 3, 3],
      employmentStability: "unstable",
      dependants: 3,
      liquidSavings: rupees(0),
    },
    expectedFirst: "build_starter_buffer",
  },
  {
    name: "incomplete financial preparation",
    patch: {
      monthsSavedInLastSix: 0,
      knowledgeScore: 10,
      goals: [],
      liquidSavings: rupees(180_000),
    },
    expectedFirst: "define_goals",
  },
  {
    name: "large emergency savings",
    patch: { liquidSavings: rupees(500_000) },
    expectedFirst: "learn_investing",
  },
  {
    name: "conflicting goal with debt",
    patch: {
      highCostDebtBalance: rupees(80_000),
      goals: [
        {
          id: "goal-travel",
          name: "Travel",
          target: rupees(150_000),
          saved: rupees(100_000),
          targetDate: "2027-02-01",
          priority: "high",
        },
      ],
    },
    expectedFirst: "repay_high_cost_debt",
  },
  {
    name: "family with adequate protection",
    patch: {
      dependants: 2,
      hasLifeInsurance: true,
      liquidSavings: rupees(180_000),
    },
    expectedFirst: "learn_investing",
  },
];

const snapshot = (
  profile: FinancialProfileInput,
  index: number,
): FinancialProfileSnapshot => ({
  ...profile,
  id: `profile-${index}`,
  userId: `user-${index}`,
  version: 1,
  createdAt: "2026-07-30T00:00:00.000Z",
});

const draftReview = {
  status: "draft" as const,
  reviewerRole: "qualified_financial_reviewer" as const,
  reviewerName: null,
  reviewerCredential: null,
  reviewedAt: null,
};

const category = (
  key: InvestmentCategory["key"],
  variabilityRank: number,
  minimumLearningHorizonYears: number,
  liquidityBand: "low" | "medium" | "high",
): InvestmentCategory => ({
  key,
  slug: key.replaceAll("_", "-"),
  title: "Learning category",
  shortTitle: "Category",
  summary: "A reviewed educational summary.",
  purpose: "Learn a financial concept.",
  riskLabel: "Risk varies.",
  variability: "Values can change.",
  typicalHorizon: "Depends on the context.",
  liquidity: "Access varies.",
  minimumPracticalAmount: "Varies.",
  costs: "Costs vary.",
  taxCaveat: "Verify current tax rules.",
  advantages: ["Explains a concept."],
  limitations: ["Outcomes remain uncertain."],
  commonMistakes: ["Ignoring risk."],
  lessonId: `lesson-${key}`,
  classification: "FINANCIAL-EDUCATION",
  contentVersion: "2026-07-draft.1",
  matching: {
    variabilityRank,
    minimumLearningHorizonYears,
    liquidityBand,
    ruleSetVersion: "2026-07-draft.1",
    review: draftReview,
  },
  review: draftReview,
});

const preference = (
  profile: FinancialProfileSnapshot,
  assessmentId: string,
  input?: Partial<InvestmentPreferenceSnapshot>,
): InvestmentPreferenceSnapshot => ({
  id: "preference-1",
  userId: profile.userId,
  version: 1,
  profileSnapshotId: profile.id,
  assessmentId,
  mode: "general",
  selectedCategoryKeys: ["fixed_deposits", "equity_stock_learning"],
  disclosureVersion: "investment-exploration-v1",
  createdAt: "2026-07-30T00:00:00.000Z",
  ...input,
});

describe("financial engine worked personas", () => {
  it.each(scenarios)("$name", ({ name, patch, expectedFirst }) => {
    const index = scenarios.findIndex((scenario) => scenario.name === name);
    const profile = snapshot({ ...baseProfile, ...patch }, index);
    const assessment = calculateAssessment(profile, {
      createdAt: "2026-07-30T00:00:00.000Z",
    });
    const roadmap = generateRoadmap(profile, assessment, {
      createdAt: "2026-07-30T00:00:00.000Z",
    });

    expect(assessment.healthScore).toBeGreaterThanOrEqual(0);
    expect(assessment.healthScore).toBeLessThanOrEqual(100);
    expect(assessment.ruleSetVersion).toBe(FINANCIAL_RULE_SET_VERSION);
    expect(assessment.dimensions).toHaveLength(7);
    expect(assessment.warnings[0]).toContain("not investment advice");
    expect(roadmap.actions[0]?.kind).toBe(expectedFirst);
    expect(roadmap.actions[0]?.status).toBe("recommended");
  });

  it("uses the more conservative willingness or capacity result", () => {
    const profile = snapshot(
      {
        ...baseProfile,
        willingnessAnswers: [3, 3, 3],
        employmentStability: "unstable",
        dependants: 4,
        liquidSavings: rupees(0),
        needForLiquidity: "high",
        investmentHorizonYears: 1,
      },
      99,
    );

    const result = calculateAssessment(profile);

    expect(result.risk.willingness).toBe("aggressive");
    expect(["conservative", "moderate"]).toContain(result.risk.capacity);
    expect(result.risk.combined).toBe(result.risk.capacity);
  });

  it("keeps all selected categories visible while financial foundations come first", () => {
    const profile = snapshot(
      {
        ...baseProfile,
        highCostDebtBalance: rupees(40_000),
        liquidSavings: rupees(200_000),
      },
      120,
    );
    const assessment = calculateAssessment(profile, { id: "assessment-120" });
    const result = generateInvestmentExplorerResult(
      profile,
      assessment,
      preference(profile, assessment.id),
      [
        category("fixed_deposits", 0, 0, "medium"),
        category("equity_stock_learning", 3, 7, "medium"),
      ],
      { createdAt: "2026-07-30T00:00:00.000Z" },
    );

    expect(result.entries).toHaveLength(2);
    expect(
      result.entries.every((entry) => entry.status === "foundation_first"),
    ).toBe(true);
    expect(result.entries[0]?.foundationActionKind).toBe(
      "repay_high_cost_debt",
    );
  });

  it("uses risk, goal horizon, and liquidity to add caution without hiding education", () => {
    const profile = snapshot(
      {
        ...baseProfile,
        liquidSavings: rupees(200_000),
        willingnessAnswers: [0, 0, 0],
        needForLiquidity: "high",
        goals: [
          {
            id: "goal-next-year",
            name: "Near-term goal",
            target: rupees(100_000),
            saved: rupees(25_000),
            targetDate: "2027-07-30",
            priority: "high",
          },
        ],
      },
      121,
    );
    const assessment = calculateAssessment(profile, { id: "assessment-121" });
    const result = generateInvestmentExplorerResult(
      profile,
      assessment,
      preference(profile, assessment.id, {
        mode: "goal",
        goalId: "goal-next-year",
        selectedCategoryKeys: ["equity_stock_learning"],
      }),
      [category("equity_stock_learning", 3, 7, "medium")],
      { createdAt: "2026-07-30T00:00:00.000Z" },
    );

    expect(result.ruleSetVersion).toBe(INVESTMENT_EXPLORER_RULE_SET_VERSION);
    expect(result.goal?.name).toBe("Near-term goal");
    expect(result.horizonYears).toBe(1);
    expect(result.entries[0]?.status).toBe("explore_with_caution");
    expect(result.entries[0]?.warnings).toHaveLength(3);
    expect(result.entries[0]?.category.key).toBe("equity_stock_learning");
  });

  it("retains the category and rule versions used to generate a result", () => {
    const profile = snapshot(
      { ...baseProfile, liquidSavings: rupees(200_000) },
      122,
    );
    const assessment = calculateAssessment(profile, { id: "assessment-122" });
    const result = generateInvestmentExplorerResult(
      profile,
      assessment,
      preference(profile, assessment.id, {
        selectedCategoryKeys: ["fixed_deposits"],
      }),
      [category("fixed_deposits", 0, 0, "high")],
      { createdAt: "2026-07-30T00:00:00.000Z" },
    );

    expect(result.categoryContentVersion).toBe("2026-07-draft.1");
    expect(result.reviewStatus).toBe("draft");
    expect(result.entries[0]?.category.contentVersion).toBe("2026-07-draft.1");
  });
});
