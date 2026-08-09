import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { ErrorState, LoadingState } from "@/components/status-state";
import { api } from "@/lib/api";
import { colors, radii } from "@/theme/colors";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["lesson", id],
    queryFn: () => api.lesson(id),
    enabled: Boolean(id),
  });
  if (query.isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (query.error) {
    return (
      <Screen>
        <ErrorState
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      </Screen>
    );
  }
  const lesson = query.data;
  if (!lesson) return null;
  return (
    <Screen tint="peach" contentContainerStyle={{ gap: 22 }}>
      <Stack.Screen options={{ title: "Money school" }} />
      <Card style={{ paddingTop: 25, gap: 16, backgroundColor: "#FFF5E8" }}>
        <View
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 11,
            paddingVertical: 7,
            borderRadius: radii.pill,
            backgroundColor: colors.lime,
          }}
        >
          <AppText variant="captionStrong">{lesson.minutes} min read</AppText>
        </View>
        <AppText variant="display">{lesson.title}</AppText>
        <AppText variant="body" color={colors.muted}>
          {lesson.summary}
        </AppText>
      </Card>

      <View style={{ gap: 18 }}>
        {lesson.body.map((paragraph, index) => (
          <View
            key={paragraph}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 13 }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                marginTop: 1,
                borderRadius: radii.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: [
                  colors.primarySoft,
                  colors.lime,
                  colors.pinkSoft,
                ][index % 3],
              }}
            >
              <AppText variant="captionStrong">{index + 1}</AppText>
            </View>
            <AppText
              variant="body"
              style={{ flex: 1, fontSize: 16, lineHeight: 26 }}
            >
              {paragraph}
            </AppText>
          </View>
        ))}
      </View>

      <Card tone={lesson.reviewStatus === "approved" ? "lime" : "purple"}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <AppIcon
            name={
              lesson.reviewStatus === "approved"
                ? "checkmark.seal.fill"
                : "clock.fill"
            }
            color={
              lesson.reviewStatus === "approved"
                ? colors.ink
                : colors.primaryDeep
            }
          />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText
              variant="bodyStrong"
              color={
                lesson.reviewStatus === "approved"
                  ? colors.ink
                  : colors.primaryDeep
              }
            >
              {lesson.reviewStatus === "approved"
                ? "Reviewed content"
                : "Draft beta content"}
            </AppText>
            <AppText
              variant="caption"
              color={
                lesson.reviewStatus === "approved"
                  ? "#4A541B"
                  : colors.primaryDeep
              }
            >
              General financial education · content version{" "}
              {lesson.contentVersion}
            </AppText>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
