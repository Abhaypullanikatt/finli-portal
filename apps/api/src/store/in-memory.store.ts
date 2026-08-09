import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  ConsentPurposeSchema,
  InvestmentCategorySchema,
  LessonSchema,
  type AssessmentResult,
  type BudgetSummary,
  type ConfirmedTransaction,
  type ConsentPurpose,
  type ConsentRecord,
  type ConsultationRequest,
  type FinancialProfileInput,
  type FinancialProfileSnapshot,
  type InvestmentCategory,
  type InvestmentExplorerRequest,
  type InvestmentExplorerResult,
  type InvestmentPreferenceSnapshot,
  type Lesson,
  type ProposedTransaction,
  type Roadmap,
  type TransactionCategory,
} from "@financial-companion/contracts";
import {
  calculateAssessment,
  generateInvestmentExplorerResult,
  generateRoadmap,
} from "@financial-companion/financial-engine";
import { randomInt, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const categories: TransactionCategory[] = [
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
];

const loadLessons = (): Lesson[] => {
  const candidates = [
    resolve(process.cwd(), "content/lessons/lessons.json"),
    resolve(process.cwd(), "../../content/lessons/lessons.json"),
  ];
  for (const file of candidates) {
    try {
      const input: unknown = JSON.parse(readFileSync(file, "utf8"));
      return LessonSchema.array().parse(input);
    } catch {
      // Try the next workspace-relative location.
    }
  }
  return [];
};

const loadInvestmentCategories = (): InvestmentCategory[] => {
  const candidates = [
    resolve(process.cwd(), "content/investments/categories.json"),
    resolve(process.cwd(), "../../content/investments/categories.json"),
  ];
  for (const file of candidates) {
    try {
      const input: unknown = JSON.parse(readFileSync(file, "utf8"));
      return InvestmentCategorySchema.array().parse(input);
    } catch {
      // Try the next workspace-relative location.
    }
  }
  return [];
};

@Injectable()
export class InMemoryStore {
  private readonly codes = new Map<string, string>();
  private readonly sessions = new Map<string, string>();
  private readonly profiles = new Map<string, FinancialProfileSnapshot[]>();
  private readonly assessments = new Map<string, AssessmentResult[]>();
  private readonly roadmaps = new Map<string, Roadmap[]>();
  private readonly consents = new Map<string, ConsentRecord[]>();
  private readonly transactions = new Map<string, ConfirmedTransaction[]>();
  private readonly proposals = new Map<string, ProposedTransaction>();
  private readonly idempotency = new Map<string, ConfirmedTransaction>();
  private readonly investmentPreferences = new Map<
    string,
    InvestmentPreferenceSnapshot[]
  >();
  private readonly investmentResults = new Map<
    string,
    InvestmentExplorerResult[]
  >();
  private readonly investmentIdempotency = new Map<
    string,
    { fingerprint: string; result: InvestmentExplorerResult }
  >();
  private readonly consultations = new Map<string, ConsultationRequest[]>();
  private readonly auditEvents: Array<Record<string, unknown>> = [];
  private readonly lessons = loadLessons();
  private readonly investmentCategories = loadInvestmentCategories();

  requestCode(email: string) {
    const code =
      process.env.NODE_ENV === "production"
        ? randomInt(100000, 999999).toString()
        : "123456";
    this.codes.set(email.toLowerCase(), code);
    return {
      accepted: true,
      expiresInSeconds: 600,
      ...(process.env.NODE_ENV === "production" ? {} : { previewCode: code }),
    };
  }

  verifyCode(email: string, code: string) {
    const normalized = email.toLowerCase();
    if (this.codes.get(normalized) !== code) {
      throw new BadRequestException({
        code: "INVALID_CODE",
        message: "The verification code is incorrect or expired.",
      });
    }
    const token = randomUUID();
    const userId = `user-${Buffer.from(normalized).toString("base64url")}`;
    this.sessions.set(token, userId);
    this.codes.delete(normalized);
    return { accessToken: token, tokenType: "Bearer", userId };
  }

  resolveSession(token: string) {
    return this.sessions.get(token);
  }

  listConsents(userId: string) {
    return this.consents.get(userId) ?? [];
  }

  recordConsent(
    userId: string,
    input: {
      purpose: ConsentPurpose;
      disclosureVersion: string;
      granted: boolean;
      retentionPolicy: string;
    },
  ): ConsentRecord {
    const record: ConsentRecord = {
      id: randomUUID(),
      userId,
      ...input,
      decidedAt: new Date().toISOString(),
    };
    const current = this.consents.get(userId) ?? [];
    current.push(record);
    this.consents.set(userId, current);
    this.audit(userId, "consent.decided", "ConsentRecord", record.id, {
      purpose: input.purpose,
      granted: input.granted,
    });
    return record;
  }

  withdrawConsent(userId: string, purposeInput: string) {
    const purpose = ConsentPurposeSchema.parse(purposeInput);
    const current = [...(this.consents.get(userId) ?? [])].reverse();
    const latest = current.find(
      (record) => record.purpose === purpose && !record.withdrawnAt,
    );
    if (!latest) {
      throw new NotFoundException({
        code: "CONSENT_NOT_FOUND",
        message: "No active consent was found for this purpose.",
      });
    }
    latest.withdrawnAt = new Date().toISOString();
    latest.granted = false;
    this.audit(userId, "consent.withdrawn", "ConsentRecord", latest.id, {
      purpose,
    });
    return latest;
  }

  hasConsent(userId: string, purpose: ConsentPurpose) {
    const records = (this.consents.get(userId) ?? []).filter(
      (record) => record.purpose === purpose,
    );
    const latest = records.at(-1);
    return latest?.granted === true && !latest.withdrawnAt;
  }

  private activeConsent(userId: string, purpose: ConsentPurpose) {
    const records = (this.consents.get(userId) ?? []).filter(
      (record) => record.purpose === purpose,
    );
    const latest = records.at(-1);
    return latest?.granted === true && !latest.withdrawnAt ? latest : undefined;
  }

  createProfile(userId: string, input: FinancialProfileInput) {
    if (!this.hasConsent(userId, "financial_profile")) {
      throw new BadRequestException({
        code: "FINANCIAL_PROFILE_CONSENT_REQUIRED",
        message:
          "Financial profile consent must be granted before saving this information.",
      });
    }
    const history = this.profiles.get(userId) ?? [];
    const profile: FinancialProfileSnapshot = {
      ...input,
      id: randomUUID(),
      userId,
      version: history.length + 1,
      createdAt: new Date().toISOString(),
    };
    history.push(profile);
    this.profiles.set(userId, history);
    this.audit(
      userId,
      "profile.created",
      "FinancialProfileSnapshot",
      profile.id,
      {
        version: profile.version,
      },
    );
    return profile;
  }

  currentProfile(userId: string) {
    const profile = this.profiles.get(userId)?.at(-1);
    if (!profile) {
      throw new NotFoundException({
        code: "PROFILE_NOT_FOUND",
        message: "Complete financial onboarding first.",
      });
    }
    return profile;
  }

  generateAssessment(userId: string) {
    const profile = this.currentProfile(userId);
    const assessment = calculateAssessment(profile, { id: randomUUID() });
    const assessmentHistory = this.assessments.get(userId) ?? [];
    assessmentHistory.push(assessment);
    this.assessments.set(userId, assessmentHistory);
    const roadmap = generateRoadmap(profile, assessment, { id: randomUUID() });
    const roadmapHistory = this.roadmaps.get(userId) ?? [];
    roadmapHistory.push(roadmap);
    this.roadmaps.set(userId, roadmapHistory);
    this.audit(
      userId,
      "assessment.generated",
      "AssessmentResult",
      assessment.id,
      {
        ruleSetVersion: assessment.ruleSetVersion,
      },
    );
    return { assessment, roadmap };
  }

  currentAssessment(userId: string) {
    const assessment = this.assessments.get(userId)?.at(-1);
    if (!assessment) {
      throw new NotFoundException({
        code: "ASSESSMENT_NOT_FOUND",
        message: "Generate a financial assessment first.",
      });
    }
    return assessment;
  }

  currentRoadmap(userId: string) {
    const roadmap = this.roadmaps.get(userId)?.at(-1);
    if (!roadmap) {
      throw new NotFoundException({
        code: "ROADMAP_NOT_FOUND",
        message: "Generate a financial assessment first.",
      });
    }
    return roadmap;
  }

  listTransactions(userId: string) {
    return (this.transactions.get(userId) ?? []).sort((left, right) =>
      right.occurredOn.localeCompare(left.occurredOn),
    );
  }

  createTransaction(
    userId: string,
    input: Omit<
      ConfirmedTransaction,
      "id" | "userId" | "createdAt" | "source"
    > & {
      idempotencyKey: string;
    },
  ) {
    const idempotencyKey = `${userId}:${input.idempotencyKey}`;
    const existing = this.idempotency.get(idempotencyKey);
    if (existing) return existing;
    const { idempotencyKey: _, ...transactionInput } = input;
    const transaction: ConfirmedTransaction = {
      ...transactionInput,
      id: randomUUID(),
      userId,
      source: "manual",
      createdAt: new Date().toISOString(),
    };
    const current = this.transactions.get(userId) ?? [];
    current.push(transaction);
    this.transactions.set(userId, current);
    this.idempotency.set(idempotencyKey, transaction);
    return transaction;
  }

  createVoiceProposals(userId: string, transcript: string) {
    if (!this.hasConsent(userId, "voice_processing")) {
      throw new BadRequestException({
        code: "VOICE_CONSENT_REQUIRED",
        message: "Voice-processing consent is required.",
      });
    }
    const segments = transcript
      .split(/\s+(?:and|,)\s+/i)
      .map((segment) => segment.trim())
      .filter(Boolean);
    const proposals = segments.flatMap((segment) => {
      const amountMatch = segment.match(
        /(?:₹|rs\.?|rupees?)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:rupees?|rs\.?)|(?:spent|paid|cost(?:s)?|bought|for)\s*(?:₹|rs\.?|rupees?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
      );
      const amountText =
        amountMatch?.[1] ?? amountMatch?.[2] ?? amountMatch?.[3];
      if (!amountText) return [];
      const amountRupees = Number(amountText.replaceAll(",", ""));
      if (!Number.isFinite(amountRupees) || amountRupees <= 0) return [];
      const lowered = segment.toLowerCase();
      const category: TransactionCategory =
        lowered.includes("lunch") || lowered.includes("food")
          ? "food"
          : lowered.includes("auto") ||
              lowered.includes("cab") ||
              lowered.includes("bus") ||
              lowered.includes("taxi") ||
              lowered.includes("metro")
            ? "transport"
            : lowered.includes("shoe") ||
                lowered.includes("cloth") ||
                lowered.includes("shopping")
              ? "shopping"
              : lowered.includes("rent") || lowered.includes("housing")
                ? "housing"
                : lowered.includes("electric") ||
                    lowered.includes("water") ||
                    lowered.includes("utility")
                  ? "utilities"
                  : lowered.includes("doctor") ||
                      lowered.includes("medicine") ||
                      lowered.includes("health")
                    ? "health"
                    : "other";
      const now = new Date();
      const proposal: ProposedTransaction = {
        id: randomUUID(),
        userId,
        source: "voice",
        amount: {
          amountPaise: Math.round(amountRupees * 100),
          currency: "INR",
        },
        occurredOn: now.toISOString().slice(0, 10),
        description: segment.slice(0, 160),
        category,
        confidence: category === "other" ? 0.62 : 0.88,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
      this.proposals.set(proposal.id, proposal);
      return [proposal];
    });
    if (proposals.length === 0) {
      throw new BadRequestException({
        code: "NO_TRANSACTIONS_DETECTED",
        message:
          "No amount was detected. Try a phrase such as “₹250 for lunch”.",
      });
    }
    return proposals;
  }

  confirmProposal(
    userId: string,
    proposalId: string,
    corrections?: Partial<
      Pick<
        ConfirmedTransaction,
        "amount" | "occurredOn" | "description" | "category"
      >
    >,
  ) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.userId !== userId) {
      throw new NotFoundException({
        code: "PROPOSAL_NOT_FOUND",
        message: "The proposed transaction was not found.",
      });
    }
    if (new Date(proposal.expiresAt) <= new Date()) {
      this.proposals.delete(proposalId);
      throw new ConflictException({
        code: "PROPOSAL_EXPIRED",
        message: "This proposed transaction has expired.",
      });
    }
    const transaction: ConfirmedTransaction = {
      id: randomUUID(),
      userId,
      amount: corrections?.amount ?? proposal.amount,
      occurredOn: corrections?.occurredOn ?? proposal.occurredOn,
      description: corrections?.description ?? proposal.description,
      category: corrections?.category ?? proposal.category,
      source: "voice",
      proposalId,
      createdAt: new Date().toISOString(),
    };
    const current = this.transactions.get(userId) ?? [];
    current.push(transaction);
    this.transactions.set(userId, current);
    this.proposals.delete(proposalId);
    return transaction;
  }

  budget(userId: string, month: string): BudgetSummary {
    const profile = this.currentProfile(userId);
    const monthTransactions = this.listTransactions(userId).filter(
      (transaction) => transaction.occurredOn.slice(0, 7) === month,
    );
    const byCategory = Object.fromEntries(
      categories.map((category) => [
        category,
        { amountPaise: 0, currency: "INR" as const },
      ]),
    ) as BudgetSummary["byCategory"];
    for (const transaction of monthTransactions) {
      byCategory[transaction.category].amountPaise +=
        transaction.amount.amountPaise;
    }
    const spent = monthTransactions.reduce(
      (sum, transaction) => sum + transaction.amount.amountPaise,
      0,
    );
    const income = profile.monthlyIncome.amountPaise;
    const remaining = Math.max(0, income - spent);
    const largest = categories.reduce((left, right) =>
      byCategory[left].amountPaise >= byCategory[right].amountPaise
        ? left
        : right,
    );
    return {
      month,
      income: profile.monthlyIncome,
      spent: { amountPaise: spent, currency: "INR" },
      remaining: { amountPaise: remaining, currency: "INR" },
      byCategory,
      insight:
        spent === 0
          ? "Record a transaction to receive a contextual spending insight."
          : `${largest[0]?.toUpperCase()}${largest.slice(1)} is currently your largest recorded category. Review it in context before changing your budget.`,
    };
  }

  listLessons() {
    return this.lessons;
  }

  getLesson(id: string) {
    const lesson = this.lessons.find(
      (candidate) => candidate.id === id || candidate.slug === id,
    );
    if (!lesson) {
      throw new NotFoundException({
        code: "LESSON_NOT_FOUND",
        message: "The lesson was not found.",
      });
    }
    return lesson;
  }

  private assertInvestmentExplorerAvailable() {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.INVESTMENT_EXPLORER_ENABLED !== "true"
    ) {
      throw new NotFoundException({
        code: "INVESTMENT_EXPLORER_NOT_AVAILABLE",
        message: "The Investment Explorer is not enabled for this release.",
      });
    }
    if (this.investmentCategories.length === 0) {
      throw new ServiceUnavailableException({
        code: "INVESTMENT_CATEGORY_CONTENT_UNAVAILABLE",
        message: "Investment education content is unavailable.",
      });
    }
    if (
      process.env.NODE_ENV === "production" &&
      this.investmentCategories.some(
        (category) =>
          category.review.status !== "approved" ||
          category.matching.review.status !== "approved",
      )
    ) {
      throw new ServiceUnavailableException({
        code: "INVESTMENT_EXPLORER_CONTENT_NOT_APPROVED",
        message:
          "Investment education content requires qualified financial approval before release.",
      });
    }
  }

  listInvestmentCategories() {
    this.assertInvestmentExplorerAvailable();
    return this.investmentCategories;
  }

  getInvestmentCategory(keyOrSlug: string) {
    this.assertInvestmentExplorerAvailable();
    const category = this.investmentCategories.find(
      (candidate) =>
        candidate.key === keyOrSlug || candidate.slug === keyOrSlug,
    );
    if (!category) {
      throw new NotFoundException({
        code: "INVESTMENT_CATEGORY_NOT_FOUND",
        message: "The investment education category was not found.",
      });
    }
    return category;
  }

  createInvestmentExplorerResult(
    userId: string,
    idempotencyKey: string,
    input: InvestmentExplorerRequest,
  ) {
    this.assertInvestmentExplorerAvailable();
    if (idempotencyKey.length < 8) {
      throw new BadRequestException({
        code: "IDEMPOTENCY_KEY_REQUIRED",
        message: "An idempotency key of at least eight characters is required.",
      });
    }
    const consent = this.activeConsent(userId, "investment_exploration");
    if (!consent) {
      throw new BadRequestException({
        code: "INVESTMENT_EXPLORATION_CONSENT_REQUIRED",
        message:
          "Investment-exploration consent is required before using financial profile information for this result.",
      });
    }

    const fingerprint = JSON.stringify(input);
    const idempotencyMapKey = `${userId}:${idempotencyKey}`;
    const prior = this.investmentIdempotency.get(idempotencyMapKey);
    if (prior) {
      if (prior.fingerprint !== fingerprint) {
        throw new ConflictException({
          code: "IDEMPOTENCY_KEY_REUSED",
          message:
            "This idempotency key was already used with different explorer selections.",
        });
      }
      return prior.result;
    }

    const profile = this.currentProfile(userId);
    const assessment = this.currentAssessment(userId);
    if (assessment.profileSnapshotId !== profile.id) {
      throw new ConflictException({
        code: "ASSESSMENT_STALE",
        message:
          "Your profile changed after the latest assessment. Generate a new assessment first.",
      });
    }
    if (
      input.mode === "goal" &&
      !profile.goals.some((goal) => goal.id === input.goalId)
    ) {
      throw new NotFoundException({
        code: "GOAL_NOT_FOUND",
        message: "The selected goal is not part of the current profile.",
      });
    }
    for (const key of input.selectedCategoryKeys) {
      if (!this.investmentCategories.some((category) => category.key === key)) {
        throw new NotFoundException({
          code: "INVESTMENT_CATEGORY_NOT_FOUND",
          message: "A selected investment education category was not found.",
        });
      }
    }

    const preferenceHistory = this.investmentPreferences.get(userId) ?? [];
    const preference: InvestmentPreferenceSnapshot = {
      id: randomUUID(),
      userId,
      version: preferenceHistory.length + 1,
      profileSnapshotId: profile.id,
      assessmentId: assessment.id,
      mode: input.mode,
      goalId: input.goalId,
      selectedCategoryKeys: input.selectedCategoryKeys,
      disclosureVersion: consent.disclosureVersion,
      createdAt: new Date().toISOString(),
    };
    const result = generateInvestmentExplorerResult(
      profile,
      assessment,
      preference,
      this.investmentCategories,
      { id: randomUUID(), createdAt: preference.createdAt },
    );

    preferenceHistory.push(preference);
    this.investmentPreferences.set(userId, preferenceHistory);
    const resultHistory = this.investmentResults.get(userId) ?? [];
    resultHistory.push(result);
    this.investmentResults.set(userId, resultHistory);
    this.investmentIdempotency.set(idempotencyMapKey, {
      fingerprint,
      result,
    });
    this.audit(
      userId,
      "investment_explorer.generated",
      "InvestmentExplorerResult",
      result.id,
      {
        ruleSetVersion: result.ruleSetVersion,
        categoryContentVersion: result.categoryContentVersion,
        reviewStatus: result.reviewStatus,
      },
    );
    return result;
  }

  currentInvestmentExplorerResult(userId: string) {
    this.assertInvestmentExplorerAvailable();
    const result = this.investmentResults.get(userId)?.at(-1);
    if (!result) {
      throw new NotFoundException({
        code: "INVESTMENT_EXPLORER_RESULT_NOT_FOUND",
        message: "Create an Investment Explorer result first.",
      });
    }
    const profile = this.currentProfile(userId);
    const assessment = this.currentAssessment(userId);
    if (
      result.profileSnapshotId !== profile.id ||
      result.assessmentId !== assessment.id ||
      assessment.profileSnapshotId !== profile.id
    ) {
      throw new ConflictException({
        code: "INVESTMENT_EXPLORER_RESULT_STALE",
        message:
          "Your financial context changed. Create a new Investment Explorer result.",
      });
    }
    return result;
  }

  requestConsultation(
    userId: string,
    input: Pick<ConsultationRequest, "topic" | "preferredWindow" | "context">,
  ) {
    if (!this.hasConsent(userId, "consultation")) {
      throw new BadRequestException({
        code: "CONSULTATION_CONSENT_REQUIRED",
        message: "Consultation consent is required before requesting a call.",
      });
    }
    if (input.topic === "investment_education") {
      if (!input.context) {
        throw new BadRequestException({
          code: "INVESTMENT_EDUCATION_CONTEXT_REQUIRED",
          message:
            "Select an Investment Explorer category before requesting this educational call.",
        });
      }
      const result = (this.investmentResults.get(userId) ?? []).find(
        (candidate) => candidate.id === input.context?.explorerResultId,
      );
      if (
        !result ||
        !result.entries.some(
          (entry) =>
            entry.category.key === input.context?.investmentCategoryKey,
        )
      ) {
        throw new NotFoundException({
          code: "INVESTMENT_EDUCATION_CONTEXT_NOT_FOUND",
          message:
            "The Investment Explorer context for this call was not found.",
        });
      }
    } else if (input.context) {
      throw new BadRequestException({
        code: "CONSULTATION_CONTEXT_NOT_ALLOWED",
        message:
          "Investment Explorer context is only accepted for investment education calls.",
      });
    }
    const request: ConsultationRequest = {
      id: randomUUID(),
      userId,
      ...input,
      status: "requested",
      createdAt: new Date().toISOString(),
    };
    const current = this.consultations.get(userId) ?? [];
    current.push(request);
    this.consultations.set(userId, current);
    this.audit(userId, "consultation.requested", "Consultation", request.id, {
      topic: request.topic,
      explorerResultId: request.context?.explorerResultId,
    });
    return request;
  }

  listConsultations(userId: string) {
    return this.consultations.get(userId) ?? [];
  }

  exportUser(userId: string) {
    return {
      exportedAt: new Date().toISOString(),
      userId,
      consents: this.listConsents(userId),
      profileSnapshots: this.profiles.get(userId) ?? [],
      assessments: this.assessments.get(userId) ?? [],
      roadmaps: this.roadmaps.get(userId) ?? [],
      investmentPreferenceSnapshots:
        this.investmentPreferences.get(userId) ?? [],
      investmentExplorerResults: this.investmentResults.get(userId) ?? [],
      transactions: this.transactions.get(userId) ?? [],
      consultations: this.consultations.get(userId) ?? [],
    };
  }

  deleteUser(userId: string) {
    this.profiles.delete(userId);
    this.assessments.delete(userId);
    this.roadmaps.delete(userId);
    this.investmentPreferences.delete(userId);
    this.investmentResults.delete(userId);
    this.consents.delete(userId);
    this.transactions.delete(userId);
    this.consultations.delete(userId);
    for (const key of this.investmentIdempotency.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.investmentIdempotency.delete(key);
      }
    }
    for (const [id, proposal] of this.proposals) {
      if (proposal.userId === userId) this.proposals.delete(id);
    }
    this.audit(userId, "account.deleted", "User", userId);
    return { deleted: true, completedAt: new Date().toISOString() };
  }

  adminOverview() {
    return {
      methodologyStatus: "draft-not-adviser-approved",
      profiles: [...this.profiles.values()].reduce(
        (sum, history) => sum + history.length,
        0,
      ),
      assessments: [...this.assessments.values()].reduce(
        (sum, history) => sum + history.length,
        0,
      ),
      investmentExplorerResults: [...this.investmentResults.values()].reduce(
        (sum, history) => sum + history.length,
        0,
      ),
      confirmedTransactions: [...this.transactions.values()].reduce(
        (sum, transactions) => sum + transactions.length,
        0,
      ),
      pendingConsultations: [...this.consultations.values()]
        .flat()
        .filter((request) => request.status === "requested").length,
      activeConsents: [...this.consents.values()]
        .flat()
        .filter((record) => record.granted && !record.withdrawnAt).length,
      auditEvents: this.auditEvents.length,
      content: {
        totalLessons: this.lessons.length,
        draftLessons: this.lessons.filter(
          (lesson) => lesson.reviewStatus === "draft",
        ).length,
        investmentCategories: this.investmentCategories.length,
        draftInvestmentCategories: this.investmentCategories.filter(
          (category) =>
            category.review.status === "draft" ||
            category.matching.review.status === "draft",
        ).length,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private audit(
    userId: string,
    action: string,
    targetType: string,
    targetId?: string,
    metadata?: Record<string, unknown>,
  ) {
    this.auditEvents.push({
      id: randomUUID(),
      userId,
      actorId: userId,
      action,
      targetType,
      targetId,
      metadata,
      createdAt: new Date().toISOString(),
    });
  }
}
