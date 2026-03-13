import { Stack } from "expo-router";

export default function FoldersStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="archives" />
      <Stack.Screen name="trash" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="delete/[id]" />
    </Stack>
  );
}
