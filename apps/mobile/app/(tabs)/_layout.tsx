import { Tabs } from "expo-router";
import { View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import { colors, fonts, radii } from "@/theme/colors";

const icon = (name: AppIconName, focusedName: AppIconName) =>
  function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return (
      <View
        style={{
          width: 36,
          height: 30,
          borderRadius: radii.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: focused ? colors.surfaceStrong : "transparent",
        }}
      >
        <AppIcon name={focused ? focusedName : name} color={color} size={19} />
      </View>
    );
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.mutedLight,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontWeight: "600",
          fontSize: 10,
          paddingTop: 0,
        },
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 10,
          height: 68,
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: "rgba(255,255,255,0.96)",
          borderTopWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.large,
          borderCurve: "continuous",
          boxShadow: "0 16px 42px rgba(61,53,42,0.14)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Your money",
          tabBarLabel: "Home",
          tabBarIcon: icon("house", "house.fill"),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Spending",
          tabBarLabel: "Spending",
          tabBarIcon: icon("chart.bar", "chart.bar.fill"),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Money school",
          tabBarLabel: "Learn",
          tabBarIcon: icon("book.closed", "book.closed.fill"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Your space",
          tabBarLabel: "You",
          tabBarIcon: icon("person", "person.fill"),
        }}
      />
    </Tabs>
  );
}
