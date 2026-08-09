import type {
  ProposedTransaction,
  TransactionCategory,
} from "@financial-companion/contracts";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Pressable, Switch, TextInput, View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { ErrorState } from "@/components/status-state";
import { TextField } from "@/components/text-field";
import { api } from "@/lib/api";
import { currentMonth, formatMoney, rupeesToMoney } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import {
  createTodayBudgetGuide,
  isTodayBudgetIntent,
} from "@/lib/voice-intent";
import { colors, radii } from "@/theme/colors";

type ProposalDraft = {
  amount: string;
  description: string;
  occurredOn: string;
  category: TransactionCategory;
};

type BudgetGuide = ReturnType<typeof createTodayBudgetGuide>;

const categories: TransactionCategory[] = [
  "food",
  "transport",
  "shopping",
  "housing",
  "utilities",
  "health",
  "debt",
  "education",
  "entertainment",
  "other",
];

const examples = ["₹250 for lunch", "What is my budget today?"];

export default function VoiceTransactionScreen() {
  const inputRef = useRef<TextInput>(null);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [budgetGuide, setBudgetGuide] = useState<BudgetGuide>();
  const [proposals, setProposals] = useState<ProposedTransaction[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProposalDraft>>({});

  const grantVoiceConsent = () =>
    api.grantConsent(
      "voice_processing",
      "Retain only confirmed financial records. Dictated text and unconfirmed proposals expire within 24 hours.",
    );

  const interpretationMutation = useMutation({
    mutationFn: async () => {
      await grantVoiceConsent();
      if (isTodayBudgetIntent(transcript)) {
        const [budget, transactions] = await Promise.all([
          api.budget(currentMonth()),
          api.transactions(),
        ]);
        return {
          kind: "budget" as const,
          guide: createTodayBudgetGuide(budget, transactions),
        };
      }
      return {
        kind: "expenses" as const,
        proposals: await api.voiceProposals(transcript),
      };
    },
    onSuccess: (result) => {
      if (result.kind === "budget") {
        setBudgetGuide(result.guide);
        setProposals([]);
        setDrafts({});
        return;
      }
      setBudgetGuide(undefined);
      setProposals(result.proposals);
      setDrafts(
        Object.fromEntries(
          result.proposals.map((proposal) => [
            proposal.id,
            {
              amount: String(proposal.amount.amountPaise / 100),
              description: proposal.description,
              occurredOn: proposal.occurredOn,
              category: proposal.category,
            },
          ]),
        ),
      );
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({
      proposalId,
      draft,
    }: {
      proposalId: string;
      draft: ProposalDraft;
    }) =>
      api.confirmProposal(proposalId, {
        amount: rupeesToMoney(draft.amount),
        description: draft.description.trim(),
        occurredOn: draft.occurredOn,
        category: draft.category,
      }),
    onSuccess: async (_, variables) => {
      setProposals((current) =>
        current.filter((proposal) => proposal.id !== variables.proposalId),
      );
      setDrafts((current) => {
        const next = { ...current };
        delete next[variables.proposalId];
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });

  const updateDraft = (proposalId: string, update: Partial<ProposalDraft>) => {
    setDrafts((current) => ({
      ...current,
      [proposalId]: { ...current[proposalId]!, ...update },
    }));
  };

  return (
    <Screen tint="sky">
      <Card tone="sky" style={{ minHeight: 160 }}>
        <View style={{ gap: 0 }}>
          <AppText variant="title">Say it naturally.</AppText>
          <AppText variant="body" color={colors.muted}>
            Use keyboard dictation, then review before saving.
          </AppText>
        </View>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {examples.map((example) => (
            <Pressable
              key={example}
              onPress={() => {
                setTranscript(example);
                inputRef.current?.focus();
              }}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 42,
                paddingHorizontal: 10,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.white,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <AppText
                variant="captionStrong"
                color={colors.ink}
                numberOfLines={1}
                style={{ textAlign: "center" }}
              >
                {example}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <TextField
          ref={inputRef}
          label="Dictation"
          value={transcript}
          onChangeText={setTranscript}
          multiline
          autoFocus
          placeholder="Example: I spent ₹250 on lunch"
          style={{ minHeight: 96, textAlignVertical: "top" }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open keyboard for dictation"
          onPress={() => inputRef.current?.focus()}
          style={({ pressed }) => ({
            minHeight: 46,
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <AppIcon name="mic.fill" color={colors.primary} size={17} />
          <AppText variant="button" color={colors.primaryDeep}>
            Tap the mic on your iPhone keyboard
          </AppText>
        </Pressable>
      </Card>

      <View
        style={{
          minHeight: 56,
          paddingHorizontal: 4,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Switch
          value={voiceConsent}
          onValueChange={setVoiceConsent}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">Process dictated text</AppText>
          <AppText variant="caption" color={colors.muted}>
            Nothing is saved until you confirm.
          </AppText>
        </View>
      </View>

      {interpretationMutation.error ? (
        <ErrorState message={interpretationMutation.error.message} />
      ) : null}
      <ActionButton
        label="Understand"
        tone="dark"
        icon="sparkles"
        pending={interpretationMutation.isPending}
        disabled={!voiceConsent || transcript.trim().length < 3}
        onPress={() => interpretationMutation.mutate()}
      />

      {budgetGuide ? (
        <Card tone="dark">
          <AppText variant="captionStrong" color={colors.primarySoft}>
            TODAY
          </AppText>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="caption" color="#A7A9A6">
                Spent today
              </AppText>
              <AppText variant="heading" color={colors.white}>
                {formatMoney(budgetGuide.spentToday)}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="caption" color="#A7A9A6">
                Daily guide
              </AppText>
              <AppText variant="heading" color={colors.white}>
                {formatMoney(budgetGuide.dailyGuide)}
              </AppText>
            </View>
          </View>
          <AppText variant="caption" color="#A7A9A6">
            Monthly amount left ÷ {budgetGuide.daysRemaining} remaining days.
          </AppText>
        </Card>
      ) : null}

      {proposals.length ? (
        <AppText variant="heading">Review expenses</AppText>
      ) : null}

      {proposals.map((proposal, index) => {
        const draft = drafts[proposal.id];
        if (!draft) return null;
        return (
          <Card key={proposal.id} style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText variant="heading">
                {formatMoney(proposal.amount)}
              </AppText>
              <AppText variant="caption" color={colors.muted}>
                {Math.round(proposal.confidence * 100)}% match
              </AppText>
            </View>
            <TextField
              label="Amount (₹)"
              value={draft.amount}
              onChangeText={(amount) => updateDraft(proposal.id, { amount })}
              keyboardType="decimal-pad"
            />
            <TextField
              label="Description"
              value={draft.description}
              onChangeText={(description) =>
                updateDraft(proposal.id, { description })
              }
            />
            <TextField
              label="Date"
              value={draft.occurredOn}
              onChangeText={(occurredOn) =>
                updateDraft(proposal.id, { occurredOn })
              }
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {categories.map((category) => {
                const selected = draft.category === category;
                return (
                  <Pressable
                    key={category}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => updateDraft(proposal.id, { category })}
                    style={({ pressed }) => ({
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: radii.pill,
                      backgroundColor: selected
                        ? colors.primaryDeep
                        : colors.canvas,
                      opacity: pressed ? 0.65 : 1,
                    })}
                  >
                    <AppText
                      variant="captionStrong"
                      color={selected ? colors.white : colors.ink}
                    >
                      {category}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <ActionButton
              label={`Save expense ${index + 1}`}
              tone="dark"
              icon="checkmark"
              pending={
                confirmMutation.isPending &&
                confirmMutation.variables?.proposalId === proposal.id
              }
              disabled={
                !draft.description.trim() ||
                !draft.amount ||
                Number(draft.amount) <= 0
              }
              onPress={() =>
                confirmMutation.mutate({ proposalId: proposal.id, draft })
              }
            />
          </Card>
        );
      })}

      {confirmMutation.error ? (
        <ErrorState message={confirmMutation.error.message} />
      ) : null}

      <AppText
        variant="caption"
        color={colors.mutedLight}
        style={{ paddingHorizontal: 4 }}
      >
        Expo Go receives dictated text from the iPhone keyboard; this app does
        not upload an audio recording.
      </AppText>
    </Screen>
  );
}
