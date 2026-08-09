import { PlayfairDisplay_700Bold_Italic } from "@expo-google-fonts/playfair-display";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "@/lib/query-client";
import { colors, fonts } from "@/theme/colors";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlayfairDisplay_700Bold_Italic,
  });

  if (!loaded && !error) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.canvas },
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.ink,
          headerTitleStyle: {
            fontFamily: fonts.displaySemibold,
            fontWeight: "600",
            color: colors.ink,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ title: "Build your money map" }}
        />
        <Stack.Screen name="sign-in" options={{ title: "Sign in" }} />
        <Stack.Screen
          name="transactions/new"
          options={{
            title: "Add an expense",
            presentation: "formSheet",
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="transactions/voice"
          options={{
            title: "Speak an expense",
            presentation: "formSheet",
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen name="lessons/[id]" options={{ title: "Lesson" }} />
        <Stack.Screen
          name="investments/index"
          options={{ title: "Investment Explorer" }}
        />
        <Stack.Screen
          name="investments/results"
          options={{ title: "Your learning view" }}
        />
        <Stack.Screen
          name="investments/[key]"
          options={{ title: "Category guide" }}
        />
        <Stack.Screen
          name="consultation"
          options={{
            title: "Book an orientation",
            presentation: "formSheet",
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{ title: "Privacy and your data" }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
