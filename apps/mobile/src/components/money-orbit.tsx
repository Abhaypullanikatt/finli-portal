import { View } from "react-native";
import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";
import { colors, radii } from "@/theme/colors";

export function MoneyOrbit({
  score,
  compact = false,
}: {
  score?: number;
  compact?: boolean;
}) {
  const size = compact ? 142 : 196;
  const core = compact ? 78 : 104;
  return (
    <View
      accessibilityLabel={
        score === undefined
          ? "Decorative money orbit"
          : `Financial health score ${score} out of 100`
      }
      style={{
        width: size,
        height: size,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          inset: 3,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.20)",
        }}
      />
      <View
        style={{
          position: "absolute",
          inset: compact ? 24 : 32,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.32)",
        }}
      />
      <View
        style={{
          width: core,
          height: core,
          borderRadius: radii.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.lavender,
          boxShadow: "0 0 30px rgba(200, 171, 255, 0.4)",
        }}
      >
        {score === undefined ? (
          <>
            <AppText
              variant={compact ? "title" : "display"}
              style={{ letterSpacing: -2 }}
            >
              ₹
            </AppText>
            <AppText variant="captionStrong">money, clearer</AppText>
          </>
        ) : (
          <>
            <AppText variant={compact ? "title" : "metric"}>{score}</AppText>
            <AppText variant="captionStrong">out of 100</AppText>
          </>
        )}
      </View>
      <View
        style={{
          position: "absolute",
          top: compact ? 8 : 12,
          right: compact ? 23 : 28,
          width: compact ? 34 : 42,
          height: compact ? 34 : 42,
          borderRadius: radii.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.lime,
        }}
      >
        <AppIcon name="sparkles" size={compact ? 15 : 18} />
      </View>
      <View
        style={{
          position: "absolute",
          bottom: compact ? 8 : 12,
          left: compact ? 14 : 22,
          width: compact ? 28 : 36,
          height: compact ? 28 : 36,
          borderRadius: radii.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.pink,
        }}
      >
        <AppIcon name="arrow.up.right" size={compact ? 12 : 15} />
      </View>
    </View>
  );
}
