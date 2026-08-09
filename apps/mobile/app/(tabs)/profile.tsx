import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { ListRow } from "@/components/list-row";
import { Screen } from "@/components/screen";
import { SectionHeader } from "@/components/section-header";
import { ErrorState, LoadingState } from "@/components/status-state";
import { api } from "@/lib/api";
import { colors, radii } from "@/theme/colors";

export default function ProfileScreen() {
  const query = useQuery({ queryKey: ["consents"], queryFn: api.consents });
  if (query.isLoading) {
    return (
      <Screen tab>
        <LoadingState />
      </Screen>
    );
  }
  if (query.error) {
    return (
      <Screen tab>
        <ErrorState
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      </Screen>
    );
  }

  const activeConsents =
    query.data?.filter((record) => record.granted && !record.withdrawnAt)
      .length ?? 0;
  const links = [
    {
      href: "/onboarding" as const,
      title: "Update money profile",
      detail: "Create a new versioned snapshot",
      icon: "slider.horizontal.3" as const,
      accent: colors.primarySoft,
    },
    {
      href: "/consultation" as const,
      title: "Book an orientation",
      detail: "A human-led educational call",
      icon: "phone.fill" as const,
      accent: colors.lime,
    },
    {
      href: "/privacy" as const,
      title: "Privacy and your data",
      detail: "Consent, export and deletion",
      icon: "shield.fill" as const,
      accent: colors.skySoft,
    },
    {
      href: "/sign-in" as const,
      title: "Passwordless sign-in",
      detail: "Secure one-time code access",
      icon: "key.fill" as const,
      accent: colors.orangeSoft,
    },
  ];

  return (
    <Screen tab tint="sky">
      <View style={{ paddingVertical: 18, gap: 5 }}>
        <AppText variant="h1">Your Profile</AppText>
        <AppText variant="body" color={colors.muted}>
          Account, consent and support.
        </AppText>
      </View>
      <Card style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 15,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.pill,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.black,
            }}
          >
            <AppText variant="heading" color={colors.white}>
              FC
            </AppText>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="heading">Financial Companion</AppText>
            <AppText variant="caption" color={colors.muted}>
              Private by design · beta profile
            </AppText>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 14,
            borderRadius: radii.medium,
            backgroundColor: colors.surfaceStrong,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <AppText variant="caption" color={colors.muted}>
            Active consent purposes
          </AppText>
          <View
            style={{
              minWidth: 38,
              height: 30,
              paddingHorizontal: 10,
              borderRadius: radii.pill,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.mint,
            }}
          >
            <AppText variant="captionStrong" color={colors.black}>
              {activeConsents}
            </AppText>
          </View>
        </View>
      </Card>

      <SectionHeader title="Settings and support" />
      <Card style={{ gap: 0 }}>
        {links.map((item, index) => (
          <Link key={item.href} href={item.href} asChild>
            <Pressable>
              <ListRow
                title={item.title}
                detail={item.detail}
                icon={item.icon}
                accent={item.accent}
                last={index === links.length - 1}
              />
            </Pressable>
          </Link>
        ))}
      </Card>

      <Card tone="purple">
        <AppText variant="bodyStrong" color={colors.primaryDeep}>
          What stays human
        </AppText>
        <AppText variant="caption" color={colors.primaryDeep}>
          Calls, content approval and unusual financial situations are reviewed
          by people during the beta.
        </AppText>
      </Card>
    </Screen>
  );
}
