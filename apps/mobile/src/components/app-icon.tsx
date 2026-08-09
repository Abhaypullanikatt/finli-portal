import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Text } from "react-native";
import { colors, fonts } from "@/theme/colors";

export type AppIconName = SymbolViewProps["name"];

const fallbacks: Partial<Record<AppIconName, string>> = {
  "house.fill": "⌂",
  "chart.bar.fill": "▥",
  "book.closed.fill": "▤",
  "person.fill": "●",
  plus: "+",
  mic: "●",
  "arrow.right": "→",
  "chevron.right": "›",
  "checkmark.circle.fill": "✓",
  "exclamationmark.triangle.fill": "!",
  "shield.fill": "◆",
  "phone.fill": "●",
  waveform: "≋",
  "lock.fill": "⌑",
  "building.columns.fill": "▥",
  "doc.text.fill": "▤",
  "square.stack.3d.up.fill": "▦",
  "chart.line.uptrend.xyaxis": "↗",
  "circle.fill": "●",
  "building.2.fill": "▥",
};

export function AppIcon({
  name,
  size = 20,
  color = colors.ink,
}: {
  name: AppIconName;
  size?: number;
  color?: string;
}) {
  if (process.env.EXPO_OS !== "ios") {
    return (
      <Text
        accessibilityElementsHidden
        style={{
          width: size,
          height: size,
          color,
          fontFamily: fonts.bold,
          fontWeight: "700",
          fontSize: size * 0.82,
          lineHeight: size,
          textAlign: "center",
        }}
      >
        {fallbacks[name] ?? "•"}
      </Text>
    );
  }

  return (
    <SymbolView
      name={name}
      tintColor={color}
      size={size}
      weight="semibold"
      resizeMode="scaleAspectFit"
    />
  );
}
