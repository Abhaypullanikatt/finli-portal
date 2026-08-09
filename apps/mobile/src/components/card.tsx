import type { PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";
import { colors, radii } from "@/theme/colors";

export function Card({
  children,
  style,
  tone = "surface",
  padded = true,
  ...props
}: PropsWithChildren<
  ViewProps & {
    tone?: "surface" | "dark" | "purple" | "lime" | "pink" | "sky" | "danger";
    padded?: boolean;
  }
>) {
  const backgroundColor = {
    surface: colors.surface,
    dark: colors.black,
    purple: colors.primarySoft,
    lime: colors.lime,
    pink: colors.pinkSoft,
    sky: colors.skySoft,
    danger: colors.dangerSoft,
  }[tone];

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: radii.large,
          borderCurve: "continuous",
          padding: padded ? 16 : 0,
          gap: 10,
          overflow: "hidden",
          borderWidth: tone === "surface" ? 1 : 0,
          borderColor: colors.border,
          boxShadow:
            tone === "surface"
              ? "0 10px 30px rgba(61, 53, 42, 0.07)"
              : "0 10px 26px rgba(61, 53, 42, 0.08)",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
