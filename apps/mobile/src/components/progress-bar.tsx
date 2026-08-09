import { View } from "react-native";
import { colors, radii } from "@/theme/colors";

export function ProgressBar({
  value,
  color = colors.primary,
  trackColor = colors.border,
  height = 8,
}: {
  value: number;
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const width = `${Math.max(0, Math.min(100, value))}%` as const;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      style={{
        height,
        borderRadius: radii.pill,
        backgroundColor: trackColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width,
          height: "100%",
          borderRadius: radii.pill,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
