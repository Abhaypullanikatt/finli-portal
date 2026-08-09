import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { AppText } from "@/components/app-text";
import { Screen } from "@/components/screen";
import { ErrorState, LoadingState } from "@/components/status-state";
import { ApiClientError, api } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { colors } from "@/theme/colors";

export default function Index() {
  const sessionQuery = useQuery({
    queryKey: ["session", "access-token"],
    queryFn: getAccessToken,
    staleTime: Infinity,
  });
  const profileQuery = useQuery({
    queryKey: ["profile", "current"],
    queryFn: api.currentProfile,
    enabled: Boolean(sessionQuery.data),
    retry: false,
  });

  if (sessionQuery.isLoading || (sessionQuery.data && profileQuery.isLoading)) {
    return (
      <Screen
        tint="peach"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <LoadingState label="Opening your money map…" />
      </Screen>
    );
  }

  if (!sessionQuery.data) return <Redirect href="/sign-in" />;

  if (
    profileQuery.error instanceof ApiClientError &&
    profileQuery.error.status === 404
  ) {
    return <Redirect href="/onboarding" />;
  }

  if (profileQuery.error) {
    return (
      <Screen
        tint="peach"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View style={{ alignItems: "center", gap: 6 }}>
          <AppText variant="title">You’re offline.</AppText>
          <AppText
            variant="body"
            color={colors.muted}
            style={{ textAlign: "center" }}
          >
            Reconnect to refresh your financial profile.
          </AppText>
        </View>
        <ErrorState
          message={profileQuery.error.message}
          onRetry={() => void profileQuery.refetch()}
        />
      </Screen>
    );
  }

  return <Redirect href="/(tabs)" />;
}
