import { View } from "react-native";
import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { colors, radii } from "@/theme/colors";

export function InvestmentGlow({
  label = "Explore",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const size = compact ? 150 : 190;
  return (
    <View
      accessible
      accessibilityLabel={`${label} investment education visual`}
      style={{
        height: compact ? 156 : 202,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: "rgba(200,171,255,0.34)",
          backgroundColor: "rgba(139,92,246,0.08)",
          boxShadow: "0 0 44px rgba(139,92,246,0.25)",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: radii.pill,
          borderWidth: 9,
          borderColor: colors.primary,
          backgroundColor: colors.black,
          boxShadow:
            "8px -4px 30px rgba(255,122,168,0.30), -10px 8px 30px rgba(217,255,105,0.22)",
        }}
      />
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: radii.pill,
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          backgroundColor: colors.surfaceStrong,
        }}
      >
        <AppIcon name="sparkles" size={compact ? 17 : 20} color={colors.lime} />
        <AppText
          variant="captionStrong"
          color={colors.white}
          style={{ textAlign: "center", textTransform: "uppercase" }}
        >
          {label}
        </AppText>
      </View>
      <View
        style={{
          position: "absolute",
          left: compact ? 20 : 36,
          top: compact ? 28 : 32,
          width: 38,
          height: 38,
          borderRadius: radii.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.lime,
          boxShadow: "0 0 18px rgba(217,255,105,0.36)",
        }}
      >
        <AppIcon name="lock.fill" size={15} />
      </View>
      <View
        style={{
          position: "absolute",
          right: compact ? 20 : 34,
          bottom: compact ? 20 : 26,
          width: 42,
          height: 42,
          borderRadius: radii.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.pink,
          boxShadow: "0 0 18px rgba(255,122,168,0.30)",
        }}
      >
        <AppIcon name="chart.bar.fill" size={17} />
      </View>
    </View>
  );
}
