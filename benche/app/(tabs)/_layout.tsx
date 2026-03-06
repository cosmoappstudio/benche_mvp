import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { useUserStore } from "@/stores/userStore";
import { TRANSLATIONS } from "@/constants/translations";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const language = useUserStore((s) => s.language);
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const tabBarHeight = 56 + (Platform.OS === "ios" ? insets.bottom : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.cardBorder,
          height: tabBarHeight,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.gradPrimary[0],
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.navigation.home,
          tabBarIcon: ({ color }) => <Icon name="House" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: (t.navigation as Record<string, string>).tasteMap ?? (t.navigation as Record<string, string>).favorites,
          tabBarIcon: ({ color }) => <Icon name="Heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.navigation.profile,
          tabBarIcon: ({ color }) => <Icon name="User" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
