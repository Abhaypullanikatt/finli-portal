const baseUrl =
  process.env.FINANCIAL_COMPANION_API_URL ?? "http://127.0.0.1:4000/v1";
const email = `mobile-smoke-${Date.now()}@example.com`;
let token = "";

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path}: ${response.status}`);
  }
  return body;
};

const post = (path, body, headers) =>
  request(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

const run = async () => {
  const codeResponse = await post("/auth/request-code", { email });
  const auth = await post("/auth/verify-code", {
    email,
    code: codeResponse.previewCode,
  });
  token = auth.accessToken;

  await post("/consents", {
    purpose: "financial_profile",
    disclosureVersion: "beta-guidance-v1",
    granted: true,
    retentionPolicy: "Smoke-test data is removed before the test exits.",
  });
  await post("/profiles", {
    monthlyIncome: { amountPaise: 4500000, currency: "INR" },
    essentialExpenses: { amountPaise: 2400000, currency: "INR" },
    lifestyleExpenses: { amountPaise: 1000000, currency: "INR" },
    monthlyDebtPayments: { amountPaise: 0, currency: "INR" },
    highCostDebtBalance: { amountPaise: 0, currency: "INR" },
    liquidSavings: { amountPaise: 2500000, currency: "INR" },
    dependants: 0,
    hasHealthInsurance: true,
    hasLifeInsurance: false,
    employmentStability: "stable",
    monthsSavedInLastSix: 3,
    knowledgeScore: 25,
    needForLiquidity: "medium",
    investmentHorizonYears: 5,
    willingnessAnswers: [1, 1, 1],
    goals: [],
  });
  await post("/assessments", {});
  await request("/assessments/current");
  await request("/roadmaps/current");

  await post(
    "/transactions",
    {
      amount: { amountPaise: 25000, currency: "INR" },
      occurredOn: new Date().toISOString().slice(0, 10),
      description: "Smoke test expense",
      category: "food",
      idempotencyKey: `smoke-${Date.now()}`,
    },
    { "Idempotency-Key": `smoke-header-${Date.now()}` },
  );

  await post("/consents", {
    purpose: "voice_processing",
    disclosureVersion: "beta-guidance-v1",
    granted: true,
    retentionPolicy: "Smoke-test data is removed before the test exits.",
  });
  const proposals = await post("/transactions/voice/proposals", {
    transcript: "₹80 for an auto",
  });
  await post(`/transactions/voice/proposals/${proposals[0].id}/confirm`, {
    description: "Corrected smoke test expense",
    category: "transport",
  });

  await request(`/budgets/${new Date().toISOString().slice(0, 7)}`);
  const lessons = await request("/lessons");
  await request(`/lessons/${lessons[0].id}`);

  await post("/consents", {
    purpose: "consultation",
    disclosureVersion: "beta-guidance-v1",
    granted: true,
    retentionPolicy: "Smoke-test data is removed before the test exits.",
  });
  await post("/consultations", {
    topic: "roadmap_orientation",
    preferredWindow: "Weekday evening",
  });
  await request("/privacy/export");
  await request("/privacy/account?confirm=DELETE", { method: "DELETE" });

  process.stdout.write("Mobile API smoke test passed: 18 flows verified.\n");
};

run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
