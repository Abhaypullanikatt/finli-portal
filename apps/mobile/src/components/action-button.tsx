import * as Haptics from "expo-haptics";
import { Pressable, type PressableProps } from "react-native";
import { AppIcon, type AppIconName } from "./app-icon";
import { AppText } from "./app-text";
import { colors, radii } from "@/theme/colors";

type Props = PressableProps & {
  label: string;
  tone?: "primary" | "secondary" | "dark" | "lime" | "danger" | "ghost";
  pending?: boolean;
  icon?: AppIconName;
};

export function ActionButton({
  label,
  tone = "primary",
  pending = false,
  icon,
  disabled,
  onPress,
  style,
  ...props
}: Props) {
  const backgroundColor = {
    primary: colors.black,
    secondary: colors.primarySoft,
    dark: colors.black,
    lime: colors.lime,
    danger: colors.dangerSoft,
    ghost: "transparent",
  }[tone];
  const textColor = {
    primary: colors.white,
    secondary: colors.ink,
    dark: colors.white,
    lime: colors.black,
    danger: colors.danger,
    ghost: colors.ink,
  }[tone];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || pending}
      onPress={(event) => {
        if (process.env.EXPO_OS === "ios") {
          void Haptics.selectionAsync();
        }
        onPress?.(event);
      }}
      style={(state) => [
        {
          minHeight: 54,
          flexDirection: "row",
          gap: 9,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 17,
          paddingVertical: 10,
          borderRadius: radii.pill,
          borderCurve: "continuous",
          backgroundColor,
          opacity: disabled || pending ? 0.45 : state.pressed ? 0.76 : 1,
          transform: [{ scale: state.pressed ? 0.985 : 1 }],
          boxShadow:
            tone === "dark" || tone === "primary"
              ? "0 10px 24px rgba(29,29,28,0.16)"
              : "none",
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {icon ? <AppIcon name={icon} size={18} color={textColor} /> : null}
      <AppText variant="button" color={textColor}>
        {pending ? "Please wait…" : label}
      </AppText>
    </Pressable>
  );
}
