import { View } from "react-native";
import { AppText } from "./app-text";
import { colors } from "@/theme/colors";

export function SectionHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: string;
}) {
  return (
    <View style={{ gap: 4 }}>
      {eyebrow ? (
        <AppText
          variant="captionStrong"
          color={colors.primaryDeep}
          style={{ textTransform: "uppercase", letterSpacing: 1.2 }}
        >
          {eyebrow}
        </AppText>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <AppText variant="heading" style={{ flex: 1 }}>
          {title}
        </AppText>
        {action ? (
          <AppText variant="captionStrong" color={colors.muted}>
            {action}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
