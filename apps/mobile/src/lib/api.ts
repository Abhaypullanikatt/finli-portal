import type {
  AssessmentResult,
  BudgetSummary,
  ConfirmedTransaction,
  ConsentRecord,
  ConsultationRequest,
  FinancialProfileInput,
  FinancialProfileSnapshot,
  InvestmentCategory,
  InvestmentExplorerRequest,
  InvestmentExplorerResult,
  Lesson,
  ProposedTransaction,
  Roadmap,
} from "@financial-companion/contracts";
import Constants from "expo-constants";
import { fetch } from "expo/fetch";
import { Platform } from "react-native";
import { getAccessToken } from "./auth";

const devServerHost = Constants.expoConfig?.hostUri;
const devServerApiUrl =
  process.env.EXPO_PUBLIC_USE_DEV_SERVER_API === "true"
    ? Platform.OS === "web"
      ? "/v1"
      : devServerHost
        ? `${devServerHost.endsWith(".exp.direct") ? "https" : "http"}://${devServerHost}/v1`
        : undefined
    : undefined;
const API_URL =
  devServerApiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:4000/v1";

type ApiRequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const request = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const token = await getAccessToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const data = (await response.json().catch(() => undefined)) as
      { message?: string; code?: string } | undefined;
    if (!response.ok) {
      throw new ApiClientError(
        data?.message ?? "The request could not be completed.",
        response.status,
        data?.code ?? "REQUEST_FAILED",
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError(
      error instanceof Error && error.name === "AbortError"
        ? "The request timed out. Try again."
        : "Unable to reach the service. Check your connection and API URL.",
      0,
      "NETWORK_ERROR",
    );
  } finally {
    clearTimeout(timeout);
  }
};

const json = (value: unknown) => JSON.stringify(value);

export const api = {
  requestCode: (email: string) =>
    request<{ accepted: boolean; previewCode?: string }>("/auth/request-code", {
      method: "POST",
      body: json({ email }),
    }),
  verifyCode: (email: string, code: string) =>
    request<{ accessToken: string; userId: string }>("/auth/verify-code", {
      method: "POST",
      body: json({ email, code }),
    }),
  consents: () => request<ConsentRecord[]>("/consents"),
  grantConsent: (
    purpose: ConsentRecord["purpose"],
    retentionPolicy: string,
    disclosureVersion = "beta-guidance-v1",
  ) =>
    request<ConsentRecord>("/consents", {
      method: "POST",
      body: json({
        purpose,
        disclosureVersion,
        granted: true,
        retentionPolicy,
      }),
    }),
  withdrawConsent: (purpose: ConsentRecord["purpose"]) =>
    request<ConsentRecord>(`/consents/${purpose}`, { method: "DELETE" }),
  currentProfile: () => request<FinancialProfileSnapshot>("/profiles/current"),
  createProfile: (profile: FinancialProfileInput) =>
    request<FinancialProfileSnapshot>("/profiles", {
      method: "POST",
      body: json(profile),
    }),
  generateAssessment: () =>
    request<{ assessment: AssessmentResult; roadmap: Roadmap }>(
      "/assessments",
      { method: "POST", body: "{}" },
    ),
  currentAssessment: () => request<AssessmentResult>("/assessments/current"),
  currentRoadmap: () => request<Roadmap>("/roadmaps/current"),
  transactions: () => request<ConfirmedTransaction[]>("/transactions"),
  createTransaction: (
    transaction: Pick<
      ConfirmedTransaction,
      "amount" | "occurredOn" | "description" | "category"
    >,
  ) => {
    const idempotencyKey = `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return request<ConfirmedTransaction>("/transactions", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: json({ ...transaction, idempotencyKey }),
    });
  },
  voiceProposals: (transcript: string) =>
    request<ProposedTransaction[]>("/transactions/voice/proposals", {
      method: "POST",
      body: json({ transcript }),
    }),
  confirmProposal: (
    proposalId: string,
    corrections?: Partial<
      Pick<
        ConfirmedTransaction,
        "amount" | "occurredOn" | "description" | "category"
      >
    >,
  ) =>
    request<ConfirmedTransaction>(
      `/transactions/voice/proposals/${proposalId}/confirm`,
      { method: "POST", body: json(corrections ?? {}) },
    ),
  budget: (month: string) => request<BudgetSummary>(`/budgets/${month}`),
  lessons: () => request<Lesson[]>("/lessons"),
  lesson: (id: string) => request<Lesson>(`/lessons/${id}`),
  investmentCategories: () =>
    request<InvestmentCategory[]>("/investment-categories"),
  investmentCategory: (key: InvestmentCategory["key"]) =>
    request<InvestmentCategory>(`/investment-categories/${key}`),
  createInvestmentExplorerResult: (input: InvestmentExplorerRequest) => {
    const idempotencyKey = `investment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return request<InvestmentExplorerResult>("/investment-explorer/results", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: json(input),
    });
  },
  currentInvestmentExplorerResult: () =>
    request<InvestmentExplorerResult>("/investment-explorer/results/current"),
  consultations: () => request<ConsultationRequest[]>("/consultations"),
  requestConsultation: (
    topic: ConsultationRequest["topic"],
    preferredWindow: string,
    context?: ConsultationRequest["context"],
  ) =>
    request<ConsultationRequest>("/consultations", {
      method: "POST",
      body: json({ topic, preferredWindow, context }),
    }),
  exportData: () => request<Record<string, unknown>>("/privacy/export"),
  deleteAccount: () =>
    request<{ deleted: boolean; completedAt: string }>(
      "/privacy/account?confirm=DELETE",
      { method: "DELETE" },
    ),
};
