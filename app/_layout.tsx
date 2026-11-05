import { SessionProvider } from "@/lib/session";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(idoso)" />
        <Stack.Screen name="(familiar)" />
        <Stack.Screen name="glicemia" options={{ presentation: "modal" }} />
        <Stack.Screen name="pressao" options={{ presentation: "modal" }} />
        <Stack.Screen name="privacy" options={{ presentation: "modal" }} />
      </Stack>
    </SessionProvider>
  );
}
