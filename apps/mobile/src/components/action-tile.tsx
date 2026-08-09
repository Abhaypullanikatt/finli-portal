import { Pressable, type PressableProps, View } from "react-native";
import { AppIcon, type AppIconName } from "./app-icon";
import { AppText } from "./app-text";
import { colors, radii } from "@/theme/colors";

export function ActionTile({
  icon,
  title,
  detail,
  tone = "dark",
  style,
  ...props
}: PressableProps & {
  icon: AppIconName;
  title: string;
  detail: string;
  tone?: "dark" | "lime";
}) {
  const dark = tone === "dark";
  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        {
          flex: 1,
          minHeight: 76,
          padding: 14,
          gap: 11,
          borderRadius: radii.medium,
          borderCurve: "continuous",
          backgroundColor: dark ? colors.surface : colors.lime,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: state.pressed ? 0.8 : 1,
          transform: [{ scale: state.pressed ? 0.98 : 1 }],
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radii.pill,
            backgroundColor: dark ? colors.skySoft : colors.white,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppIcon name={icon} size={15} color={colors.ink} />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <AppText
            variant="bodyStrong"
            color={dark ? colors.ink : colors.black}
          >
            {title}
          </AppText>
          <AppText
            variant="caption"
            color={dark ? colors.muted : colors.limeDeep}
            numberOfLines={1}
          >
            {detail}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
