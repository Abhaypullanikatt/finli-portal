import type { MoneyAmount } from "@financial-companion/contracts";

export const formatMoney = (money: MoneyAmount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amountPaise / 100);

export const rupeesToMoney = (value: string): MoneyAmount => {
  const rupees = Number(value.replaceAll(",", ""));
  return {
    amountPaise: Number.isFinite(rupees) ? Math.round(rupees * 100) : 0,
    currency: "INR",
  };
};

const dateParts = (date: Date) => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return { year, month, day };
};

export const currentMonth = () => {
  const { year, month } = dateParts(new Date());
  return `${year}-${month}`;
};

export const today = () => {
  const { year, month, day } = dateParts(new Date());
  return `${year}-${month}-${day}`;
};
