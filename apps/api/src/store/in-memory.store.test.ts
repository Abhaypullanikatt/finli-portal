import type {
  ConsentPurpose,
  FinancialProfileInput,
  InvestmentExplorerRequest,
} from "@financial-companion/contracts";
import { describe, expect, it } from "vitest";
import { InMemoryStore } from "./in-memory.store.js";

const money = (rupees: number) => ({
  amountPaise: rupees * 100,
  currency: "INR" as const,
});

const profile: FinancialProfileInput = {
  monthlyIncome: money(45_000),
  essentialExpenses: money(24_000),
  lifestyleExpenses: money(10_000),
  monthlyDebtPayments: money(2_000),
  highCostDebtBalance: money(35_000),
  liquidSavings: money(20_000),
  dependants: 0,
  hasHealthInsurance: false,
  hasLifeInsurance: false,
  employmentStability: "stable",
  monthsSavedInLastSix: 2,
  knowledgeScore: 25,
  needForLiquidity: "medium",
  investmentHorizonYears: 5,
  willingnessAnswers: [1, 1, 2],
  goals: [],
};

const grant = (store: InMemoryStore, userId: string, purpose: ConsentPurpose) =>
  store.recordConsent(userId, {
    purpose,
    disclosureVersion: "beta-guidance-v1",
    granted: true,
    retentionPolicy: "test-only",
  });

describe("in-memory beta adapter", () => {
  it("creates versioned profiles, assessments, and prioritized roadmaps", () => {
    const store = new InMemoryStore();
    grant(store, "user-1", "financial_profile");

    const first = store.createProfile("user-1", profile);
    const second = store.createProfile("user-1", {
      ...profile,
      liquidSavings: money(30_000),
    });
    const result = store.generateAssessment("user-1");

    expect(first.version).toBe(1);
    expect(second.version).toBe(2);
    expect(result.assessment.profileSnapshotId).toBe(second.id);
    expect(result.roadmap.actions[0]?.kind).toBe("repay_high_cost_debt");
    expect(result.roadmap.ruleSetVersion).toBe(
      result.assessment.ruleSetVersion,
    );
  });

  it("makes manual transaction writes idempotent and builds a monthly budget", () => {
    const store = new InMemoryStore();
    grant(store, "user-2", "financial_profile");
    store.createProfile("user-2", profile);
    const input = {
      amount: money(250),
      occurredOn: "2026-07-30",
      description: "Lunch",
      category: "food" as const,
      idempotencyKey: "same-request-123",
    };

    const first = store.createTransaction("user-2", input);
    const second = store.createTransaction("user-2", input);
    const budget = store.budget("user-2", "2026-07");

    expect(second.id).toBe(first.id);
    expect(store.listTransactions("user-2")).toHaveLength(1);
    expect(budget.spent.amountPaise).toBe(25_000);
    expect(budget.byCategory.food.amountPaise).toBe(25_000);
  });

  it("keeps voice outputs proposed until explicit confirmation", () => {
    const store = new InMemoryStore();
    grant(store, "user-3", "voice_processing");

    const proposals = store.createVoiceProposals(
      "user-3",
      "I spent ₹250 on lunch and ₹80 on an auto",
    );

    expect(proposals).toHaveLength(2);
    expect(
      store.createVoiceProposals("user-3", "I spent 325 on groceries")[0]
        ?.amount.amountPaise,
    ).toBe(32_500);
    expect(store.listTransactions("user-3")).toHaveLength(0);
    const confirmed = store.confirmProposal("user-3", proposals[0]!.id);
    expect(confirmed.source).toBe("voice");
    expect(store.listTransactions("user-3")).toHaveLength(1);
  });

  it("exports and deletes all active beta data", () => {
    const store = new InMemoryStore();
    grant(store, "user-4", "financial_profile");
    grant(store, "user-4", "investment_exploration");
    store.createProfile("user-4", {
      ...profile,
      highCostDebtBalance: money(0),
      liquidSavings: money(180_000),
    });
    store.generateAssessment("user-4");
    store.createInvestmentExplorerResult("user-4", "export-test-123", {
      mode: "general",
      selectedCategoryKeys: ["fixed_deposits"],
    });
    const before = store.exportUser("user-4");

    expect(before.profileSnapshots).toHaveLength(1);
    expect(before.investmentPreferenceSnapshots).toHaveLength(1);
    expect(before.investmentExplorerResults).toHaveLength(1);
    expect(store.deleteUser("user-4").deleted).toBe(true);
    const after = store.exportUser("user-4");
    expect(after.profileSnapshots).toHaveLength(0);
    expect(after.assessments).toHaveLength(0);
    expect(after.investmentPreferenceSnapshots).toHaveLength(0);
    expect(after.investmentExplorerResults).toHaveLength(0);
  });

  it("requires consent and a current assessment for investment exploration", () => {
    const store = new InMemoryStore();
    grant(store, "user-5", "financial_profile");
    store.createProfile("user-5", profile);
    store.generateAssessment("user-5");

    expect(() =>
      store.createInvestmentExplorerResult("user-5", "missing-consent", {
        mode: "general",
        selectedCategoryKeys: ["gold"],
      }),
    ).toThrow();

    grant(store, "user-5", "investment_exploration");
    store.createProfile("user-5", {
      ...profile,
      liquidSavings: money(50_000),
    });
    expect(() =>
      store.createInvestmentExplorerResult("user-5", "stale-assessment", {
        mode: "general",
        selectedCategoryKeys: ["gold"],
      }),
    ).toThrow();
  });

  it("creates idempotent, explainable explorer results without hiding selections", () => {
    const store = new InMemoryStore();
    grant(store, "user-6", "financial_profile");
    grant(store, "user-6", "investment_exploration");
    store.createProfile("user-6", {
      ...profile,
      highCostDebtBalance: money(0),
      liquidSavings: money(180_000),
      investmentHorizonYears: 8,
    });
    store.generateAssessment("user-6");
    const input: InvestmentExplorerRequest = {
      mode: "general",
      selectedCategoryKeys: ["fixed_deposits", "equity_stock_learning"],
    };

    const first = store.createInvestmentExplorerResult(
      "user-6",
      "same-explorer-request",
      input,
    );
    const second = store.createInvestmentExplorerResult(
      "user-6",
      "same-explorer-request",
      input,
    );

    expect(second.id).toBe(first.id);
    expect(first.entries).toHaveLength(2);
    expect(first.entries.every((entry) => entry.rationale.length > 0)).toBe(
      true,
    );
    expect(first.entries.every((entry) => entry.warnings.length > 0)).toBe(
      true,
    );
    expect(() =>
      store.createInvestmentExplorerResult("user-6", "same-explorer-request", {
        mode: "general",
        selectedCategoryKeys: ["bonds"],
      }),
    ).toThrow();

    store.createProfile("user-6", {
      ...profile,
      highCostDebtBalance: money(0),
      liquidSavings: money(200_000),
    });
    expect(() => store.currentInvestmentExplorerResult("user-6")).toThrow();
  });

  it("guards educational content against transaction language and product links", () => {
    const store = new InMemoryStore();
    const categories = store.listInvestmentCategories();
    const serialized = JSON.stringify(categories);

    expect(categories).toHaveLength(8);
    expect(serialized).not.toMatch(
      /\b(?:buy now|invest now|sell now|guaranteed returns?|best stock|top fund)\b/i,
    );
    expect(serialized).not.toMatch(/https?:\/\//i);
    expect(
      categories.every(
        (category) =>
          category.review.status === "draft" &&
          category.matching.review.status === "draft",
      ),
    ).toBe(true);
  });

  it("links an investment-education call to an owned explorer result", () => {
    const store = new InMemoryStore();
    grant(store, "user-7", "financial_profile");
    grant(store, "user-7", "investment_exploration");
    grant(store, "user-7", "consultation");
    store.createProfile("user-7", {
      ...profile,
      highCostDebtBalance: money(0),
      liquidSavings: money(180_000),
    });
    store.generateAssessment("user-7");
    const result = store.createInvestmentExplorerResult(
      "user-7",
      "consultation-context",
      {
        mode: "general",
        selectedCategoryKeys: ["gold"],
      },
    );
    const request = store.requestConsultation("user-7", {
      topic: "investment_education",
      preferredWindow: "Weekday evening",
      context: {
        explorerResultId: result.id,
        investmentCategoryKey: "gold",
      },
    });

    expect(request.context?.explorerResultId).toBe(result.id);
  });
});
