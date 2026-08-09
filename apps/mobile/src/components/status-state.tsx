import { ActivityIndicator, View } from "react-native";
import { ActionButton } from "./action-button";
import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { colors, radii } from "@/theme/colors";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={{ paddingVertical: 56, alignItems: "center", gap: 14 }}>
      <ActivityIndicator color={colors.primary} />
      <AppText variant="body" color={colors.muted}>
        {label}
      </AppText>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View
      accessibilityRole="alert"
      style={{
        paddingVertical: 34,
        paddingHorizontal: 22,
        gap: 12,
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radii.large,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colors.border,
        boxShadow: "0 12px 36px rgba(61,53,42,0.08)",
      }}
    >
      <AppIcon name="exclamationmark.triangle.fill" color={colors.danger} />
      <AppText
        variant="body"
        color={colors.muted}
        style={{ textAlign: "center" }}
      >
        {message}
      </AppText>
      {onRetry ? (
        <ActionButton label="Try again" tone="danger" onPress={onRetry} />
      ) : null}
    </View>
  );
}
