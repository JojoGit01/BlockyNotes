import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/useTheme";

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 28 : 14);
  const renderTabIcon = (
    focused: boolean,
    activeName: keyof typeof Ionicons.glyphMap,
    inactiveName: keyof typeof Ionicons.glyphMap
  ) => (
    <Ionicons
      name={focused ? activeName : inactiveName}
      size={focused ? 18 : 21}
      color={focused ? "#FFFFFF" : "#8B9098"}
      style={
        focused
          ? {
              backgroundColor: "#0F172A",
              width: 36,
              height: 36,
              textAlign: "center",
              textAlignVertical: "center",
              borderRadius: 18,
              overflow: "hidden"
            }
          : undefined
      }
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#0F172A",
        tabBarInactiveTintColor: "#8B9098",
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: bottomInset,
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 0,
          borderRadius: 24,
          backgroundColor: theme.colors.surface,
          shadowColor: "#0F172A",
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 3
        },
        tabBarItemStyle: {
          paddingVertical: 2
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "home", "home-outline")
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          popToTopOnBlur: true,
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "menu", "menu-outline")
        }}
        listeners={{
          tabPress: () => {
            router.replace("/notes");
          }
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: "Dossiers",
          popToTopOnBlur: true,
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "grid", "grid-outline")
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Reglages",
          popToTopOnBlur: true,
          tabBarIcon: ({ focused }) => renderTabIcon(focused, "settings", "settings-outline")
        }}
      />
    </Tabs>
  );
}
