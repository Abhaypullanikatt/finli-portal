import { forwardRef, type PropsWithChildren } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, type ScrollViewProps } from "react-native";
import { colors } from "@/theme/colors";

type ScreenTint = "none" | "peach" | "mint" | "sky";

const tintColors: Record<Exclude<ScreenTint, "none">, [string, string]> = {
  peach: ["#FBE1CD", "rgba(251,225,205,0)"],
  mint: ["#E1F4DD", "rgba(225,244,221,0)"],
  sky: ["#D8F4F8", "rgba(216,244,248,0)"],
};

export const Screen = forwardRef<
  ScrollView,
  PropsWithChildren<ScrollViewProps & { tab?: boolean; tint?: ScreenTint }>
>(function Screen(
  { children, contentContainerStyle, tab = false, tint = "none", ...props },
  ref,
) {
  return (
    <ScrollView
      ref={ref}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={[
        {
          position: "relative",
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tab ? 104 : 28,
          gap: 14,
        },
        contentContainerStyle,
      ]}
      {...props}
    >
      {tint === "none" ? null : (
        <LinearGradient
          pointerEvents="none"
          colors={tintColors[tint]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 360,
          }}
        />
      )}
      {children}
    </ScrollView>
  );
});
