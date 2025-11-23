// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Abas principais */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />

      {/* Grupo de autenticação — SEM header */}
      <Stack.Screen 
        name="(auth)" 
        options={{ headerShown: false }} 
      />

      {/* Modal de dados */}
      <Stack.Screen
        name="data-modal"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
          gestureEnabled: true,
          contentStyle: { backgroundColor: "white" },
        }}
      />
      // app/_layout.tsx
<Stack.Screen name="privacy" options={{ headerShown: false, presentation: "modal" }} />
<Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: "modal" }} />

    </Stack>
  );
}