import type { ConsentPurpose } from "@financial-companion/contracts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { File, Paths } from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { SectionHeader } from "@/components/section-header";
import { ErrorState, LoadingState } from "@/components/status-state";
import { TextField } from "@/components/text-field";
import { api } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { colors, radii } from "@/theme/colors";

export default function PrivacyScreen() {
  const [confirmation, setConfirmation] = useState("");
  const [exportSummary, setExportSummary] = useState("");
  const consentQuery = useQuery({
    queryKey: ["consents"],
    queryFn: api.consents,
  });
  const exportMutation = useMutation({
    mutationFn: async () => {
      const data = await api.exportData();
      const file = new File(
        Paths.cache,
        `financial-companion-export-${Date.now()}.json`,
      );
      file.create({ overwrite: true });
      file.write(JSON.stringify(data, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Export Financial Companion data",
          UTI: "public.json",
        });
      }
      return { data, uri: file.uri };
    },
    onSuccess: ({ data }) => {
      setExportSummary(
        `Export ready with ${Object.keys(data).length} sections. A temporary copy was created for sharing.`,
      );
    },
  });
  const withdrawMutation = useMutation({
    mutationFn: (purpose: ConsentPurpose) => api.withdrawConsent(purpose),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consents"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: api.deleteAccount,
    onSuccess: async () => {
      await clearAccessToken();
      queryClient.clear();
      router.replace("/");
    },
  });

  if (consentQuery.isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  const error =
    consentQuery.error ??
    exportMutation.error ??
    withdrawMutation.error ??
    deleteMutation.error;

  return (
    <Screen tint="sky">
      <Card tone="sky" style={{ gap: 16 }}>
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: radii.medium,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.white,
          }}
        >
          <AppIcon name="lock.shield.fill" size={24} />
        </View>
        <View style={{ gap: 7 }}>
          <AppText variant="title">Your data stays yours.</AppText>
          <AppText variant="body" color={colors.muted}>
            Review consent, export a portable copy, or remove your beta data.
          </AppText>
        </View>
      </Card>

      <SectionHeader
        eyebrow="Control"
        title="Purpose-specific consent"
        action={`${consentQuery.data?.length ?? 0} records`}
      />
      {consentQuery.data?.length ? (
        <Card style={{ gap: 0 }}>
          {consentQuery.data.map((record, index) => {
            const active = record.granted && !record.withdrawnAt;
            return (
              <View
                key={record.id}
                style={{
                  gap: 11,
                  paddingVertical: 15,
                  borderBottomWidth:
                    index === consentQuery.data.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 11,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radii.small,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: active
                        ? colors.successSoft
                        : colors.surfaceStrong,
                    }}
                  >
                    <AppIcon
                      name={active ? "checkmark.circle.fill" : "minus.circle"}
                      color={active ? colors.success : colors.muted}
                      size={19}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <AppText
                      variant="bodyStrong"
                      style={{ textTransform: "capitalize" }}
                    >
                      {record.purpose.replaceAll("_", " ")}
                    </AppText>
                    <AppText
                      variant="captionStrong"
                      color={active ? colors.success : colors.muted}
                    >
                      {active ? "Active" : "Withdrawn"}
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" color={colors.muted}>
                  {record.retentionPolicy}
                </AppText>
                {active ? (
                  <ActionButton
                    label="Withdraw this consent"
                    tone="ghost"
                    pending={
                      withdrawMutation.isPending &&
                      withdrawMutation.variables === record.purpose
                    }
                    onPress={() => withdrawMutation.mutate(record.purpose)}
                  />
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : (
        <Card>
          <AppText variant="body" color={colors.muted}>
            No consent decisions have been recorded yet.
          </AppText>
        </Card>
      )}

      <Card tone="purple">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <AppIcon name="square.and.arrow.up.fill" color={colors.primaryDeep} />
          <View style={{ flex: 1, gap: 5 }}>
            <AppText variant="subheading" color={colors.primaryDeep}>
              Export a portable copy
            </AppText>
            <AppText variant="caption" color={colors.primaryDeep}>
              Includes consent history, profile snapshots, assessments,
              roadmaps, Investment Explorer preferences and results,
              transactions, and consultation requests.
            </AppText>
          </View>
        </View>
        <ActionButton
          label="Create and share JSON export"
          tone="dark"
          icon="square.and.arrow.up"
          pending={exportMutation.isPending}
          onPress={() => exportMutation.mutate()}
        />
        {exportSummary ? (
          <AppText variant="captionStrong" color={colors.primaryDeep}>
            {exportSummary}
          </AppText>
        ) : null}
      </Card>

      <Card tone="danger">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <AppIcon name="trash.fill" color={colors.danger} />
          <View style={{ flex: 1, gap: 5 }}>
            <AppText variant="subheading" color={colors.danger}>
              Delete account data
            </AppText>
            <AppText variant="caption" color={colors.danger}>
              Type DELETE to remove beta data from the active store. This cannot
              be undone.
            </AppText>
          </View>
        </View>
        <TextField
          label="Confirmation"
          value={confirmation}
          onChangeText={setConfirmation}
          autoCapitalize="characters"
          placeholder="DELETE"
        />
        <ActionButton
          label="Delete my data"
          tone="danger"
          icon="trash.fill"
          pending={deleteMutation.isPending}
          disabled={confirmation !== "DELETE"}
          onPress={() => deleteMutation.mutate()}
        />
      </Card>
      {error ? <ErrorState message={error.message} /> : null}
    </Screen>
  );
}
