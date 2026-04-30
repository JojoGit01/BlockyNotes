import { Stack } from "expo-router";

export default function NotesStackLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="delete/[id]" />
    </Stack>
  );
}
