import { forwardRef } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "./app-text";
import { colors, fonts, radii } from "@/theme/colors";

type Props = TextInputProps & {
  label: string;
  hint?: string;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, hint, style, ...props },
  ref,
) {
  return (
    <View style={{ gap: 7 }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          {
            minHeight: 56,
            backgroundColor: colors.surface,
            borderRadius: radii.medium,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.ink,
            fontSize: 16,
            fontFamily: fonts.medium,
            fontWeight: "500",
            paddingHorizontal: 14,
            paddingVertical: 12,
          },
          style,
        ]}
        {...props}
      />
      {hint ? (
        <AppText variant="caption" color={colors.muted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});
