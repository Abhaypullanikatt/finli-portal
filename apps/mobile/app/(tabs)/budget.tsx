import type { TransactionCategory } from "@financial-companion/contracts";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { View } from "react-native";
import { ActionTile } from "@/components/action-tile";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { ListRow } from "@/components/list-row";
import { ProgressBar } from "@/components/progress-bar";
import { Screen } from "@/components/screen";
import { SectionHeader } from "@/components/section-header";
import { ErrorState, LoadingState } from "@/components/status-state";
import { api } from "@/lib/api";
import { currentMonth, formatMoney } from "@/lib/format";
import { colors } from "@/theme/colors";

const categoryIcons: Record<TransactionCategory, AppIconName> = {
  food: "fork.knife",
  transport: "car.fill",
  shopping: "bag.fill",
  housing: "house.fill",
  utilities: "bolt.fill",
  health: "cross.case.fill",
  debt: "creditcard.fill",
  entertainment: "popcorn.fill",
  education: "book.closed.fill",
  other: "ellipsis",
};

export default function BudgetScreen() {
  const month = currentMonth();
  const budgetQuery = useQuery({
    queryKey: ["budget", month],
    queryFn: () => api.budget(month),
  });
  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: api.transactions,
  });

  if (budgetQuery.isLoading || transactionsQuery.isLoading) {
    return (
      <Screen tab>
        <LoadingState label="Loading spending…" />
      </Screen>
    );
  }
  const error = budgetQuery.error ?? transactionsQuery.error;
  if (error) {
    return (
      <Screen tab>
        <ErrorState
          message={
            error instanceof Error ? error.message : "Unable to load spending."
          }
          onRetry={() => {
            void budgetQuery.refetch();
            void transactionsQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const budget = budgetQuery.data;
  const transactions = transactionsQuery.data ?? [];
  if (!budget) return null;
  const total = budget.spent.amountPaise + budget.remaining.amountPaise;
  const used = total > 0 ? (budget.spent.amountPaise / total) * 100 : 0;

  return (
    <Screen tab tint="sky">
      <View style={{ paddingVertical: 18, gap: 5 }}>
        <AppText variant="h1">Spending</AppText>
        <AppText variant="body" color={colors.muted}>
          A simple view of this month.
        </AppText>
      </View>

      <Card style={{ gap: 15 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 1 }}>
            <AppText variant="captionStrong" color={colors.muted}>
              THIS MONTH
            </AppText>
            <AppText variant="metric">{formatMoney(budget.spent)}</AppText>
          </View>
          <AppText variant="bodyStrong">
            {formatMoney(budget.remaining)} left
          </AppText>
        </View>
        <ProgressBar
          value={used}
          color={colors.black}
          trackColor={colors.surfaceStrong}
          height={7}
        />
        <AppText variant="caption" color={colors.muted}>
          {Math.round(used)}% of monthly income recorded
        </AppText>
      </Card>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Link href="/transactions/new" asChild>
          <ActionTile icon="plus" title="Add" detail="Manual expense" />
        </Link>
        <Link href="/transactions/voice" asChild>
          <ActionTile
            icon="waveform"
            title="Dictate"
            detail="Expense or budget"
            tone="lime"
          />
        </Link>
      </View>

      {budget.insight ? (
        <View
          style={{
            paddingHorizontal: 4,
            flexDirection: "row",
            gap: 9,
            alignItems: "flex-start",
          }}
        >
          <AppIcon name="sparkles" color={colors.primary} size={15} />
          <AppText
            variant="caption"
            color={colors.muted}
            style={{ flex: 1 }}
            numberOfLines={2}
          >
            {budget.insight}
          </AppText>
        </View>
      ) : null}

      <SectionHeader title="Recent" action={`${transactions.length}`} />
      <Card style={{ gap: 0 }}>
        {transactions.length === 0 ? (
          <View style={{ paddingVertical: 18, alignItems: "center", gap: 4 }}>
            <AppText variant="bodyStrong">No expenses yet</AppText>
            <AppText variant="caption" color={colors.muted}>
              Add one manually or dictate it.
            </AppText>
          </View>
        ) : (
          transactions.map((transaction, index) => (
            <ListRow
              key={transaction.id}
              icon={categoryIcons[transaction.category]}
              title={transaction.description}
              detail={`${transaction.category} · ${transaction.occurredOn}`}
              value={formatMoney(transaction.amount)}
              accent={colors.primarySoft}
              last={index === transactions.length - 1}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
