import { Platform } from "react-native";

export const colors = {
  ink: "#1C1C1B",
  inkSoft: "#343432",
  muted: "#74736F",
  mutedLight: "#AAA8A3",
  canvas: "#FBFAF8",
  surface: "#FFFFFF",
  surfaceStrong: "#F3F2EF",
  primary: "#242423",
  primaryDeep: "#151514",
  primarySoft: "#EEE9F7",
  lavender: "#DDD3F3",
  lime: "#E2F1D7",
  limeDeep: "#397353",
  pink: "#F45B78",
  pinkSoft: "#FCE8EB",
  sky: "#CBEFF5",
  skySoft: "#EAF8FA",
  orange: "#F4A23D",
  orangeSoft: "#FFF0D9",
  blue: "#79B9D2",
  blueSoft: "#E7F3F8",
  amber: "#F7C55E",
  amberSoft: "#FFF4D9",
  danger: "#C84555",
  dangerSoft: "#FCECEE",
  success: "#2E8A5D",
  successSoft: "#E8F5ED",
  border: "#E8E5DF",
  white: "#FFFFFF",
  black: "#1D1D1C",
  peach: "#F8DCC8",
  mint: "#DFF1DE",
} as const;

const sfProDisplay = Platform.select({
  ios: "SF Pro Display",
  android: "sans-serif",
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  default: "System",
});

export const fonts = {
  light: sfProDisplay,
  lightItalic: sfProDisplay,
  regular: sfProDisplay,
  italic: sfProDisplay,
  medium: sfProDisplay,
  semibold: sfProDisplay,
  bold: sfProDisplay,
  h1: "PlayfairDisplay_700Bold_Italic",
  extraBold: sfProDisplay,
  displayLightItalic: sfProDisplay,
  displaySemibold: sfProDisplay,
  displayBold: sfProDisplay,
  displayExtraBold: sfProDisplay,
} as const;

export const radii = {
  small: 12,
  medium: 18,
  large: 24,
  xlarge: 32,
  pill: 999,
} as const;
