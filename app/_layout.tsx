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

      {/* Grupo de autenticação */}
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

      {/* Modal de Privacidade */}
      <Stack.Screen
        name="privacy"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />

      {/* Modal de edição de perfil */}
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
