import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import {
  ConsentPurposeSchema,
  ConsultationContextSchema,
  CreateTransactionSchema,
  FinancialProfileInputSchema,
  InvestmentExplorerRequestSchema,
  MoneyAmountSchema,
  TransactionCategorySchema,
} from "@financial-companion/contracts";
import { z } from "zod";
import type { AuthenticatedRequest } from "./auth/development-auth.guard.js";
import { parseBody } from "./platform/parse.js";
import { InMemoryStore } from "./store/in-memory.store.js";

const emailSchema = z.string().email();
const requestCodeSchema = z.object({ email: emailSchema });
const verifyCodeSchema = z.object({
  email: emailSchema,
  code: z.string().length(6),
});
const consentSchema = z.object({
  purpose: ConsentPurposeSchema,
  disclosureVersion: z.string().min(1),
  granted: z.boolean(),
  retentionPolicy: z.string().min(1),
});
const voiceTranscriptSchema = z.object({
  transcript: z.string().min(3).max(2_000),
});
const correctionSchema = z.object({
  amount: MoneyAmountSchema.optional(),
  occurredOn: z.string().date().optional(),
  description: z.string().min(1).max(160).optional(),
  category: TransactionCategorySchema.optional(),
});
const consultationSchema = z.object({
  topic: z.enum([
    "roadmap_orientation",
    "budget_coaching",
    "debt_education",
    "investment_education",
  ]),
  preferredWindow: z.string().min(3).max(160),
  context: ConsultationContextSchema.optional(),
});

@Controller()
export class AppController {
  constructor(private readonly store: InMemoryStore) {}

  private user(request: AuthenticatedRequest) {
    return request.userId ?? "demo-user";
  }

  @Get("health")
  health() {
    return {
      status: "ok",
      service: "financial-companion-api",
      methodologyStatus: "draft-not-adviser-approved",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("auth/request-code")
  requestCode(@Body() body: unknown) {
    const { email } = parseBody(requestCodeSchema, body);
    return this.store.requestCode(email);
  }

  @Post("auth/verify-code")
  verifyCode(@Body() body: unknown) {
    const { email, code } = parseBody(verifyCodeSchema, body);
    return this.store.verifyCode(email, code);
  }

  @Get("consents")
  listConsents(@Req() request: AuthenticatedRequest) {
    return this.store.listConsents(this.user(request));
  }

  @Post("consents")
  recordConsent(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.store.recordConsent(
      this.user(request),
      parseBody(consentSchema, body),
    );
  }

  @Delete("consents/:purpose")
  withdrawConsent(
    @Req() request: AuthenticatedRequest,
    @Param("purpose") purpose: string,
  ) {
    return this.store.withdrawConsent(this.user(request), purpose);
  }

  @Get("profiles/current")
  currentProfile(@Req() request: AuthenticatedRequest) {
    return this.store.currentProfile(this.user(request));
  }

  @Post("profiles")
  createProfile(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.store.createProfile(
      this.user(request),
      parseBody(FinancialProfileInputSchema, body),
    );
  }

  @Post("assessments")
  generateAssessment(@Req() request: AuthenticatedRequest) {
    return this.store.generateAssessment(this.user(request));
  }

  @Get("assessments/current")
  currentAssessment(@Req() request: AuthenticatedRequest) {
    return this.store.currentAssessment(this.user(request));
  }

  @Get("roadmaps/current")
  currentRoadmap(@Req() request: AuthenticatedRequest) {
    return this.store.currentRoadmap(this.user(request));
  }

  @Get("transactions")
  listTransactions(@Req() request: AuthenticatedRequest) {
    return this.store.listTransactions(this.user(request));
  }

  @Post("transactions")
  createTransaction(
    @Req() request: AuthenticatedRequest,
    @Headers("idempotency-key") idempotencyHeader: string | undefined,
    @Body() body: unknown,
  ) {
    const input = parseBody(
      CreateTransactionSchema,
      typeof body === "object" && body !== null
        ? {
            ...body,
            idempotencyKey:
              idempotencyHeader ??
              ("idempotencyKey" in body ? body.idempotencyKey : undefined),
          }
        : body,
    );
    return this.store.createTransaction(this.user(request), input);
  }

  @Post("transactions/voice/proposals")
  createVoiceProposals(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    const { transcript } = parseBody(voiceTranscriptSchema, body);
    return this.store.createVoiceProposals(this.user(request), transcript);
  }

  @Post("transactions/voice/proposals/:proposalId/confirm")
  confirmVoiceProposal(
    @Req() request: AuthenticatedRequest,
    @Param("proposalId") proposalId: string,
    @Body() body: unknown,
  ) {
    return this.store.confirmProposal(
      this.user(request),
      proposalId,
      parseBody(correctionSchema, body),
    );
  }

  @Get("budgets/:month")
  budget(@Req() request: AuthenticatedRequest, @Param("month") month: string) {
    return this.store.budget(this.user(request), month);
  }

  @Get("lessons")
  lessons() {
    return this.store.listLessons();
  }

  @Get("lessons/:id")
  lesson(@Param("id") id: string) {
    return this.store.getLesson(id);
  }

  @Get("investment-categories")
  investmentCategories() {
    return this.store.listInvestmentCategories();
  }

  @Get("investment-categories/:key")
  investmentCategory(@Param("key") key: string) {
    return this.store.getInvestmentCategory(key);
  }

  @Post("investment-explorer/results")
  createInvestmentExplorerResult(
    @Req() request: AuthenticatedRequest,
    @Headers("idempotency-key") idempotencyHeader: string | undefined,
    @Body() body: unknown,
  ) {
    const { idempotencyKey } = parseBody(
      z.object({
        idempotencyKey: z.string().min(8),
      }),
      { idempotencyKey: idempotencyHeader },
    );
    return this.store.createInvestmentExplorerResult(
      this.user(request),
      idempotencyKey,
      parseBody(InvestmentExplorerRequestSchema, body),
    );
  }

  @Get("investment-explorer/results/current")
  currentInvestmentExplorerResult(@Req() request: AuthenticatedRequest) {
    return this.store.currentInvestmentExplorerResult(this.user(request));
  }

  @Get("consultations")
  consultations(@Req() request: AuthenticatedRequest) {
    return this.store.listConsultations(this.user(request));
  }

  @Post("consultations")
  requestConsultation(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    return this.store.requestConsultation(
      this.user(request),
      parseBody(consultationSchema, body),
    );
  }

  @Get("privacy/export")
  exportData(@Req() request: AuthenticatedRequest) {
    return this.store.exportUser(this.user(request));
  }

  @Get("admin/overview")
  adminOverview(@Headers("x-admin-role") role: string | undefined) {
    const allowed =
      process.env.NODE_ENV !== "production" &&
      ["operations", "content", "compliance"].includes(role ?? "");
    if (!allowed) {
      return {
        available: false,
        code: "ADMIN_IDENTITY_PROVIDER_REQUIRED",
        message:
          "The development overview requires an approved role header. Production requires OIDC, MFA, and mapped staff roles.",
      };
    }
    return { available: true, ...this.store.adminOverview() };
  }

  @Delete("privacy/account")
  deleteAccount(
    @Req() request: AuthenticatedRequest,
    @Query("confirm") confirm: string | undefined,
  ) {
    if (confirm !== "DELETE") {
      return {
        deleted: false,
        code: "CONFIRMATION_REQUIRED",
        message: "Repeat the request with ?confirm=DELETE.",
      };
    }
    return this.store.deleteUser(this.user(request));
  }
}
