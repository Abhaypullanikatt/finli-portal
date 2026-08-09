import { z } from "zod";

export const CurrencySchema = z.literal("INR");

export const MoneyAmountSchema = z.object({
  amountPaise: z.number().int().safe().nonnegative(),
  currency: CurrencySchema.default("INR"),
});
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;

export const EmploymentStabilitySchema = z.enum([
  "unstable",
  "variable",
  "stable",
]);
export type EmploymentStability = z.infer<typeof EmploymentStabilitySchema>;

export const GoalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  target: MoneyAmountSchema,
  saved: MoneyAmountSchema,
  targetDate: z.string().date(),
  priority: z.enum(["low", "medium", "high"]),
});
export type Goal = z.infer<typeof GoalSchema>;

export const FinancialProfileInputSchema = z.object({
  monthlyIncome: MoneyAmountSchema,
  essentialExpenses: MoneyAmountSchema,
  lifestyleExpenses: MoneyAmountSchema,
  monthlyDebtPayments: MoneyAmountSchema,
  highCostDebtBalance: MoneyAmountSchema,
  liquidSavings: MoneyAmountSchema,
  dependants: z.number().int().min(0).max(20),
  hasHealthInsurance: z.boolean(),
  hasLifeInsurance: z.boolean(),
  employmentStability: EmploymentStabilitySchema,
  monthsSavedInLastSix: z.number().int().min(0).max(6),
  knowledgeScore: z.number().int().min(0).max(100),
  needForLiquidity: z.enum(["low", "medium", "high"]),
  investmentHorizonYears: z.number().min(0).max(60),
  willingnessAnswers: z.array(z.number().int().min(0).max(3)).min(3).max(12),
  goals: z.array(GoalSchema).max(20),
});
export type FinancialProfileInput = z.infer<typeof FinancialProfileInputSchema>;

export const FinancialProfileSnapshotSchema =
  FinancialProfileInputSchema.extend({
    id: z.string().min(1),
    userId: z.string().min(1),
    version: z.number().int().positive(),
    createdAt: z.string().datetime(),
  });
export type FinancialProfileSnapshot = z.infer<
  typeof FinancialProfileSnapshotSchema
>;

export const RiskClassSchema = z.enum([
  "conservative",
  "moderate",
  "growth",
  "aggressive",
]);
export type RiskClass = z.infer<typeof RiskClassSchema>;

export const AssessmentDimensionSchema = z.object({
  key: z.enum([
    "cashFlow",
    "debt",
    "emergencyFund",
    "savingsConsistency",
    "protection",
    "goalReadiness",
    "knowledge",
  ]),
  score: z.number().int().min(0).max(100),
  label: z.string(),
  explanation: z.string(),
});

export const AssessmentResultSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  profileSnapshotId: z.string().min(1),
  healthScore: z.number().int().min(0).max(100),
  dimensions: z.array(AssessmentDimensionSchema),
  risk: z.object({
    willingness: RiskClassSchema,
    capacity: RiskClassSchema,
    combined: RiskClassSchema,
    explanation: z.string(),
  }),
  ruleSetVersion: z.string().min(1),
  rationale: z.array(z.string()),
  warnings: z.array(z.string()),
  createdAt: z.string().datetime(),
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

export const RoadmapActionKindSchema = z.enum([
  "stabilize_cash_flow",
  "repay_high_cost_debt",
  "build_starter_buffer",
  "build_emergency_fund",
  "learn_protection",
  "define_goals",
  "learn_investing",
]);
export type RoadmapActionKind = z.infer<typeof RoadmapActionKindSchema>;

export const RoadmapActionSchema = z.object({
  id: z.string().min(1),
  kind: RoadmapActionKindSchema,
  position: z.number().int().positive(),
  title: z.string(),
  rationale: z.string(),
  status: z.enum(["recommended", "in_progress", "complete", "blocked"]),
  target: MoneyAmountSchema.optional(),
  lessonId: z.string().optional(),
});

export const RoadmapSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  assessmentId: z.string().min(1),
  ruleSetVersion: z.string(),
  actions: z.array(RoadmapActionSchema),
  createdAt: z.string().datetime(),
});
export type Roadmap = z.infer<typeof RoadmapSchema>;

export const ConsentPurposeSchema = z.enum([
  "financial_profile",
  "voice_processing",
  "service_communications",
  "consultation",
  "investment_exploration",
]);
export type ConsentPurpose = z.infer<typeof ConsentPurposeSchema>;

export const ConsentRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  purpose: ConsentPurposeSchema,
  disclosureVersion: z.string(),
  granted: z.boolean(),
  decidedAt: z.string().datetime(),
  withdrawnAt: z.string().datetime().optional(),
  retentionPolicy: z.string(),
});
export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

export const TransactionCategorySchema = z.enum([
  "housing",
  "food",
  "transport",
  "shopping",
  "health",
  "debt",
  "entertainment",
  "education",
  "utilities",
  "other",
]);
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;

const TransactionBaseSchema = z.object({
  amount: MoneyAmountSchema,
  occurredOn: z.string().date(),
  description: z.string().min(1).max(160),
  category: TransactionCategorySchema,
});

export const ProposedTransactionSchema = TransactionBaseSchema.extend({
  id: z.string().min(1),
  userId: z.string().min(1),
  source: z.literal("voice"),
  confidence: z.number().min(0).max(1),
  expiresAt: z.string().datetime(),
});
export type ProposedTransaction = z.infer<typeof ProposedTransactionSchema>;

export const ConfirmedTransactionSchema = TransactionBaseSchema.extend({
  id: z.string().min(1),
  userId: z.string().min(1),
  source: z.enum(["manual", "voice"]),
  proposalId: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type ConfirmedTransaction = z.infer<typeof ConfirmedTransactionSchema>;

export const CreateTransactionSchema = TransactionBaseSchema.extend({
  idempotencyKey: z.string().min(8),
});

export const BudgetSummarySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  income: MoneyAmountSchema,
  spent: MoneyAmountSchema,
  remaining: MoneyAmountSchema,
  byCategory: z.record(TransactionCategorySchema, MoneyAmountSchema),
  insight: z.string(),
});
export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

export const LessonSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  body: z.array(z.string()),
  minutes: z.number().int().positive(),
  classification: z.literal("FINANCIAL-EDUCATION"),
  contentVersion: z.string(),
  reviewStatus: z.enum(["draft", "approved"]),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const InvestmentCategoryKeySchema = z.enum([
  "fixed_deposits",
  "government_savings",
  "bonds",
  "diversified_mutual_funds",
  "equity_stock_learning",
  "gold",
  "reits",
  "direct_real_estate",
]);
export type InvestmentCategoryKey = z.infer<typeof InvestmentCategoryKeySchema>;

export const InvestmentReviewSchema = z.object({
  status: z.enum(["draft", "approved"]),
  reviewerRole: z.literal("qualified_financial_reviewer"),
  reviewerName: z.string().min(1).nullable(),
  reviewerCredential: z.string().min(1).nullable(),
  reviewedAt: z.string().datetime().nullable(),
});
export type InvestmentReview = z.infer<typeof InvestmentReviewSchema>;

export const InvestmentCategorySchema = z.object({
  key: InvestmentCategoryKeySchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  summary: z.string().min(1),
  purpose: z.string().min(1),
  riskLabel: z.string().min(1),
  variability: z.string().min(1),
  typicalHorizon: z.string().min(1),
  liquidity: z.string().min(1),
  minimumPracticalAmount: z.string().min(1),
  costs: z.string().min(1),
  taxCaveat: z.string().min(1),
  advantages: z.array(z.string().min(1)).min(1),
  limitations: z.array(z.string().min(1)).min(1),
  commonMistakes: z.array(z.string().min(1)).min(1),
  lessonId: z.string().min(1),
  classification: z.literal("FINANCIAL-EDUCATION"),
  contentVersion: z.string().min(1),
  matching: z.object({
    variabilityRank: z.number().int().min(0).max(3),
    minimumLearningHorizonYears: z.number().min(0).max(60),
    liquidityBand: z.enum(["high", "medium", "low"]),
    ruleSetVersion: z.string().min(1),
    review: InvestmentReviewSchema,
  }),
  review: InvestmentReviewSchema,
});
export type InvestmentCategory = z.infer<typeof InvestmentCategorySchema>;

export const InvestmentExplorerModeSchema = z.enum(["general", "goal"]);
export type InvestmentExplorerMode = z.infer<
  typeof InvestmentExplorerModeSchema
>;

export const InvestmentExplorerRequestSchema = z
  .object({
    mode: InvestmentExplorerModeSchema,
    goalId: z.string().min(1).optional(),
    selectedCategoryKeys: z.array(InvestmentCategoryKeySchema).min(1).max(8),
  })
  .superRefine((value, context) => {
    if (value.mode === "goal" && !value.goalId) {
      context.addIssue({
        code: "custom",
        path: ["goalId"],
        message: "Select a goal for goal-based exploration.",
      });
    }
    if (value.mode === "general" && value.goalId) {
      context.addIssue({
        code: "custom",
        path: ["goalId"],
        message: "General exploration must not include a goal.",
      });
    }
    if (
      new Set(value.selectedCategoryKeys).size !==
      value.selectedCategoryKeys.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["selectedCategoryKeys"],
        message: "Investment categories must be unique.",
      });
    }
  });
export type InvestmentExplorerRequest = z.infer<
  typeof InvestmentExplorerRequestSchema
>;

export const InvestmentPreferenceSnapshotSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  version: z.number().int().positive(),
  profileSnapshotId: z.string().min(1),
  assessmentId: z.string().min(1),
  mode: InvestmentExplorerModeSchema,
  goalId: z.string().min(1).optional(),
  selectedCategoryKeys: z.array(InvestmentCategoryKeySchema).min(1).max(8),
  disclosureVersion: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type InvestmentPreferenceSnapshot = z.infer<
  typeof InvestmentPreferenceSnapshotSchema
>;

export const InvestmentExplorerStatusSchema = z.enum([
  "ready_to_learn",
  "explore_with_caution",
  "foundation_first",
]);
export type InvestmentExplorerStatus = z.infer<
  typeof InvestmentExplorerStatusSchema
>;

export const InvestmentExplorerEntrySchema = z.object({
  category: InvestmentCategorySchema,
  status: InvestmentExplorerStatusSchema,
  rationale: z.string().min(1),
  warnings: z.array(z.string().min(1)),
  foundationActionKind: RoadmapActionKindSchema.optional(),
});
export type InvestmentExplorerEntry = z.infer<
  typeof InvestmentExplorerEntrySchema
>;

export const InvestmentExplorerResultSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  preferenceSnapshotId: z.string().min(1),
  profileSnapshotId: z.string().min(1),
  assessmentId: z.string().min(1),
  mode: InvestmentExplorerModeSchema,
  goal: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
      horizonYears: z.number().min(0).max(60),
    })
    .optional(),
  horizonYears: z.number().min(0).max(60),
  risk: z.object({
    willingness: RiskClassSchema,
    capacity: RiskClassSchema,
    combined: RiskClassSchema,
    explanation: z.string().min(1),
  }),
  ruleSetVersion: z.string().min(1),
  categoryContentVersion: z.string().min(1),
  reviewStatus: z.enum(["draft", "approved"]),
  entries: z.array(InvestmentExplorerEntrySchema).min(1).max(8),
  disclaimer: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type InvestmentExplorerResult = z.infer<
  typeof InvestmentExplorerResultSchema
>;

export const ConsultationContextSchema = z.object({
  investmentCategoryKey: InvestmentCategoryKeySchema,
  explorerResultId: z.string().min(1),
});
export type ConsultationContext = z.infer<typeof ConsultationContextSchema>;

export const ConsultationRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  topic: z.enum([
    "roadmap_orientation",
    "budget_coaching",
    "debt_education",
    "investment_education",
  ]),
  preferredWindow: z.string().min(1),
  context: ConsultationContextSchema.optional(),
  status: z.enum(["requested", "confirmed", "completed", "cancelled"]),
  createdAt: z.string().datetime(),
});
export type ConsultationRequest = z.infer<typeof ConsultationRequestSchema>;

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  code: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
});
export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;
