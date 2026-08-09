import type { PropsWithChildren } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, type ViewProps } from "react-native";
import { radii } from "@/theme/colors";

export function LuminousCard({
  children,
  style,
  colors = ["#F8DCC8", "#FBF4EA", "#FFFFFF"],
  ...props
}: PropsWithChildren<
  ViewProps & {
    colors?: readonly [string, string, ...string[]];
  }
>) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          minHeight: 168,
          padding: 20,
          borderRadius: radii.xlarge,
          borderCurve: "continuous",
          overflow: "hidden",
          gap: 12,
          borderWidth: 1,
          borderColor: "rgba(105,92,73,0.08)",
          boxShadow: "0 14px 40px rgba(61,53,42,0.08)",
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          position: "absolute",
          width: 190,
          height: 190,
          borderRadius: 95,
          right: -72,
          top: -92,
          backgroundColor: "rgba(255,255,255,0.34)",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 60,
          left: -46,
          bottom: -74,
          backgroundColor: "rgba(255,255,255,0.22)",
        }}
      />
      {children}
    </LinearGradient>
  );
}
