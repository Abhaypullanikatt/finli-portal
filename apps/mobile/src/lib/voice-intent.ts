import type {
  BudgetSummary,
  ConfirmedTransaction,
  MoneyAmount,
} from "@financial-companion/contracts";

export const isTodayBudgetIntent = (text: string) => {
  const normalized = text.toLowerCase().replaceAll("’", "'");
  return (
    /\b(today|today's|todays)\b.*\b(budget|left|spend|spending)\b/.test(
      normalized,
    ) ||
    /\b(budget|left|spend|spending)\b.*\b(today|today's|todays)\b/.test(
      normalized,
    )
  );
};

const money = (amountPaise: number): MoneyAmount => ({
  amountPaise: Math.max(0, Math.round(amountPaise)),
  currency: "INR",
});

export const createTodayBudgetGuide = (
  budget: BudgetSummary,
  transactions: ConfirmedTransaction[],
  now = new Date(),
) => {
  const today = now.toISOString().slice(0, 10);
  const spentToday = transactions
    .filter((transaction) => transaction.occurredOn === today)
    .reduce((total, transaction) => total + transaction.amount.amountPaise, 0);
  const lastDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const daysRemaining = Math.max(1, lastDay - now.getUTCDate() + 1);

  return {
    spentToday: money(spentToday),
    dailyGuide: money(budget.remaining.amountPaise / daysRemaining),
    daysRemaining,
  };
};
