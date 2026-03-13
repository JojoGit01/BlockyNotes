import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useTheme } from "@/hooks/useTheme";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#0F172A",
        tabBarInactiveTintColor: "#8B9098",
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 18,
          height: 86,
          paddingTop: 12,
          paddingBottom: 14,
          borderTopWidth: 0,
          borderRadius: 28,
          backgroundColor: theme.colors.surface,
          shadowColor: "#0F172A",
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 6
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
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={20}
              color={focused ? "#FFFFFF" : "#8B9098"}
              style={
                focused
                  ? {
                      backgroundColor: "#0F172A",
                      width: 42,
                      height: 42,
                      textAlign: "center",
                      textAlignVertical: "center",
                      borderRadius: 21,
                      overflow: "hidden"
                    }
                  : undefined
              }
            />
          )
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          popToTopOnBlur: true,
          tabBarIcon: ({ color }) => <Ionicons name="menu-outline" size={22} color={color} />
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: "Dossiers",
          popToTopOnBlur: true,
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Reglages",
          popToTopOnBlur: true,
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={20} color={color} />
        }}
      />
    </Tabs>
  );
}
