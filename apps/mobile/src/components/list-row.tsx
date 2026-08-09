import { View } from "react-native";
import { AppIcon, type AppIconName } from "./app-icon";
import { AppText } from "./app-text";
import { colors, radii } from "@/theme/colors";

export function ListRow({
  icon,
  title,
  detail,
  value,
  accent = colors.primarySoft,
  last = false,
}: {
  icon: AppIconName;
  title: string;
  detail?: string;
  value?: string;
  accent?: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 9,
        borderBottomColor: colors.border,
        borderBottomWidth: last ? 0 : 1,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radii.small,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: accent,
        }}
      >
        <AppIcon name={icon} size={19} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        {detail ? (
          <AppText variant="caption" color={colors.muted}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="bodyStrong" style={{ fontVariant: ["tabular-nums"] }}>
          {value}
        </AppText>
      ) : (
        <AppIcon name="chevron.right" size={15} color={colors.mutedLight} />
      )}
    </View>
  );
}
