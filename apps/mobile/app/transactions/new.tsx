import type { TransactionCategory } from "@financial-companion/contracts";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { ErrorState } from "@/components/status-state";
import { TextField } from "@/components/text-field";
import { api } from "@/lib/api";
import { rupeesToMoney, today } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import { colors, fonts, radii } from "@/theme/colors";

const choices: Array<{
  value: TransactionCategory;
  label: string;
  icon: AppIconName;
}> = [
  { value: "food", label: "Food", icon: "fork.knife" },
  { value: "transport", label: "Travel", icon: "car.fill" },
  { value: "shopping", label: "Shopping", icon: "bag.fill" },
  { value: "housing", label: "Home", icon: "house.fill" },
  { value: "utilities", label: "Bills", icon: "bolt.fill" },
  { value: "health", label: "Health", icon: "cross.case.fill" },
  { value: "debt", label: "Debt", icon: "creditcard.fill" },
  { value: "education", label: "Learning", icon: "book.closed.fill" },
  { value: "entertainment", label: "Fun", icon: "popcorn.fill" },
  { value: "other", label: "Other", icon: "ellipsis" },
];

export default function NewTransactionScreen() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState<TransactionCategory>("food");
  const mutation = useMutation({
    mutationFn: () =>
      api.createTransaction({
        amount: rupeesToMoney(amount),
        occurredOn: date,
        description: description.trim(),
        category,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["budget"] });
      router.back();
    },
  });

  return (
    <Screen tint="peach">
      <Card style={{ alignItems: "center", gap: 8 }}>
        <AppText
          variant="captionStrong"
          color={colors.success}
          style={{ textTransform: "uppercase", letterSpacing: 1.1 }}
        >
          Amount
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AppText variant="title" color={colors.muted}>
            ₹
          </AppText>
          <TextInput
            accessibilityLabel="Expense amount in rupees"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
            placeholder="0"
            placeholderTextColor={colors.mutedLight}
            style={{
              minWidth: 120,
              color: colors.ink,
              fontFamily: fonts.extraBold,
              fontWeight: "800",
              fontSize: 48,
              lineHeight: 56,
              letterSpacing: -2,
              textAlign: "center",
              fontVariant: ["tabular-nums"],
            }}
          />
        </View>
        <AppText variant="caption" color={colors.muted}>
          Stored precisely in paise
        </AppText>
      </Card>

      <TextField
        label="What was it for?"
        value={description}
        onChangeText={setDescription}
        placeholder="Lunch, auto, rent…"
      />
      <TextField
        label="Date"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />

      <View style={{ gap: 10 }}>
        <AppText variant="label">Choose a category</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {choices.map((choice) => {
            const selected = category === choice.value;
            return (
              <Pressable
                key={choice.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setCategory(choice.value)}
                style={({ pressed }) => ({
                  minHeight: 44,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 7,
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                  borderRadius: radii.pill,
                  backgroundColor: selected
                    ? colors.primaryDeep
                    : colors.surfaceStrong,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <AppIcon
                  name={choice.icon}
                  size={15}
                  color={selected ? colors.lime : colors.ink}
                />
                <AppText
                  variant="captionStrong"
                  color={selected ? colors.white : colors.ink}
                >
                  {choice.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {mutation.error ? <ErrorState message={mutation.error.message} /> : null}
      <ActionButton
        label="Save expense"
        tone="dark"
        icon="checkmark"
        pending={mutation.isPending}
        disabled={!amount || Number(amount) <= 0 || !description.trim()}
        onPress={() => mutation.mutate()}
      />
    </Screen>
  );
}
