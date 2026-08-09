import type { PropsWithChildren } from "react";
import {
  Text,
  type TextProps,
  type TextStyle,
  type StyleProp,
} from "react-native";
import { colors, fonts } from "@/theme/colors";

type Variant =
  | "h1"
  | "display"
  | "editorial"
  | "metric"
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "bodyStrong"
  | "label"
  | "button"
  | "caption"
  | "captionStrong";

const variants: Record<Variant, TextStyle> = {
  h1: {
    fontFamily: fonts.h1,
    fontWeight: "700",
    fontStyle: "italic",
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.7,
  },
  display: {
    fontFamily: fonts.displayBold,
    fontWeight: "700",
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.8,
  },
  editorial: {
    fontFamily: fonts.displayLightItalic,
    fontWeight: "300",
    fontStyle: "italic",
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  metric: {
    fontFamily: fonts.displaySemibold,
    fontWeight: "600",
    fontSize: 38,
    lineHeight: 45,
    letterSpacing: -0.9,
    fontVariant: ["tabular-nums"],
  },
  title: {
    fontFamily: fonts.displayBold,
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: fonts.displaySemibold,
    fontWeight: "600",
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.25,
  },
  subheading: {
    fontFamily: fonts.medium,
    fontWeight: "500",
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fonts.regular,
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 23,
  },
  bodyStrong: {
    fontFamily: fonts.semibold,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 23,
  },
  label: {
    fontFamily: fonts.semibold,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 19,
  },
  button: {
    fontFamily: fonts.semibold,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.regular,
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
  },
  captionStrong: {
    fontFamily: fonts.semibold,
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 18,
  },
};

export function AppText({
  children,
  variant = "body",
  color = colors.ink,
  style,
  ...props
}: PropsWithChildren<
  Omit<TextProps, "style"> & {
    variant?: Variant;
    color?: string;
    style?: StyleProp<TextStyle>;
  }
>) {
  return (
    <Text selectable style={[variants[variant], { color }, style]} {...props}>
      {children}
    </Text>
  );
}
