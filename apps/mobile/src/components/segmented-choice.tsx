import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";
import { AppText } from "./app-text";
import { colors, radii } from "@/theme/colors";

export function SegmentedChoice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="label">{label}</AppText>
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          padding: 5,
          borderRadius: radii.medium,
          borderCurve: "continuous",
          backgroundColor: colors.surfaceStrong,
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => {
                if (process.env.EXPO_OS === "ios") {
                  void Haptics.selectionAsync();
                }
                onChange(option.value);
              }}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 42,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 8,
                borderRadius: radii.small,
                borderCurve: "continuous",
                backgroundColor: selected ? colors.white : "transparent",
                borderWidth: selected ? 1 : 0,
                borderColor: colors.border,
                boxShadow: selected ? "0 4px 14px rgba(61,53,42,0.08)" : "none",
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <AppText
                variant="captionStrong"
                color={selected ? colors.ink : colors.muted}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
