import { describe, expect, it } from "vitest";
import { createTodayBudgetGuide, isTodayBudgetIntent } from "./voice-intent";

describe("voice intent", () => {
  it("recognizes common today-budget phrases", () => {
    expect(isTodayBudgetIntent("Tell me my today's budget")).toBe(true);
    expect(isTodayBudgetIntent("How much can I spend today?")).toBe(true);
    expect(isTodayBudgetIntent("I spent ₹250 on lunch")).toBe(false);
  });

  it("calculates a transparent daily guide", () => {
    const guide = createTodayBudgetGuide(
      {
        month: "2026-07",
        income: { amountPaise: 100_000, currency: "INR" },
        spent: { amountPaise: 40_000, currency: "INR" },
        remaining: { amountPaise: 60_000, currency: "INR" },
        byCategory: {
          food: { amountPaise: 0, currency: "INR" },
          transport: { amountPaise: 0, currency: "INR" },
          shopping: { amountPaise: 0, currency: "INR" },
          housing: { amountPaise: 0, currency: "INR" },
          utilities: { amountPaise: 0, currency: "INR" },
          health: { amountPaise: 0, currency: "INR" },
          debt: { amountPaise: 0, currency: "INR" },
          education: { amountPaise: 0, currency: "INR" },
          entertainment: { amountPaise: 0, currency: "INR" },
          other: { amountPaise: 0, currency: "INR" },
        },
        insight: "",
      },
      [
        {
          id: "transaction-1",
          userId: "user-1",
          amount: { amountPaise: 12_500, currency: "INR" },
          occurredOn: "2026-07-30",
          description: "Lunch",
          category: "food",
          source: "manual",
          createdAt: "2026-07-30T10:00:00.000Z",
        },
      ],
      new Date("2026-07-30T12:00:00.000Z"),
    );

    expect(guide.spentToday.amountPaise).toBe(12_500);
    expect(guide.dailyGuide.amountPaise).toBe(30_000);
    expect(guide.daysRemaining).toBe(2);
  });
});
