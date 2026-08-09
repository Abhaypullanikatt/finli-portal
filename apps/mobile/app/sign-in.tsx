import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Card } from "@/components/card";
import { Screen } from "@/components/screen";
import { ErrorState } from "@/components/status-state";
import { TextField } from "@/components/text-field";
import { api } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { colors } from "@/theme/colors";

export default function SignInScreen() {
  const [email, setEmail] = useState("pilot@example.com");
  const [code, setCode] = useState("");
  const [previewCode, setPreviewCode] = useState<string>();
  const requestMutation = useMutation({
    mutationFn: () => api.requestCode(email),
    onSuccess: (result) => {
      setPreviewCode(result.previewCode);
      if (result.previewCode) setCode(result.previewCode);
    },
  });
  const verifyMutation = useMutation({
    mutationFn: () => api.verifyCode(email, code),
    onSuccess: async (result) => {
      await setAccessToken(result.accessToken);
      queryClient.clear();
      router.replace("/");
    },
  });
  const error = requestMutation.error ?? verifyMutation.error;

  return (
    <Screen tint="peach">
      <Card style={{ paddingTop: 22 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1, gap: 7 }}>
            <AppText
              variant="captionStrong"
              color={colors.success}
              style={{ textTransform: "uppercase", letterSpacing: 1.2 }}
            >
              Passwordless access
            </AppText>
            <AppText variant="title">Welcome back.</AppText>
            <AppText variant="body" color={colors.muted}>
              Sign in with a one-time code.
            </AppText>
          </View>
          <Image
            source={require("../assets/financial-path.png")}
            contentFit="contain"
            style={{ width: 112, height: 112 }}
          />
        </View>
      </Card>

      <View style={{ gap: 14 }}>
        <TextField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
        />
        <ActionButton
          label="Send one-time code"
          tone="secondary"
          icon="envelope.fill"
          pending={requestMutation.isPending}
          disabled={!email.includes("@")}
          onPress={() => requestMutation.mutate()}
        />
      </View>

      {previewCode ? (
        <Card tone="lime">
          <View style={{ flexDirection: "row", gap: 12 }}>
            <AppIcon name="key.fill" />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="bodyStrong">Local preview code</AppText>
              <AppText
                variant="heading"
                style={{ fontVariant: ["tabular-nums"], letterSpacing: 2 }}
              >
                {previewCode}
              </AppText>
            </View>
          </View>
        </Card>
      ) : null}

      <TextField
        label="Six-digit code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={6}
      />
      {error ? <ErrorState message={error.message} /> : null}
      <ActionButton
        label="Verify and continue"
        tone="dark"
        icon="arrow.right"
        pending={verifyMutation.isPending}
        disabled={code.length !== 6}
        onPress={() => verifyMutation.mutate()}
      />

      <Card tone="purple">
        <AppText variant="caption" color={colors.primaryDeep}>
          Local development displays the code on-screen. Production remains
          blocked until an approved identity provider and delivery channel are
          configured.
        </AppText>
      </Card>
    </Screen>
  );
}
