import { PatientsProvider } from "@/lib/patients";
import { useSession } from "@/lib/session";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

export default function FamiliarLayout() {
  const { session, profile, loading } = useSession();
  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (profile?.role === "idoso") return <Redirect href="/(idoso)" />;

  const icon = (name: keyof typeof MaterialCommunityIcons.glyphMap) =>
    ({ color }: { color: string }) => <MaterialCommunityIcons name={name} size={26} color={color} />;

  return (
    <PatientsProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#17A7C5" }}>
        <Tabs.Screen name="index" options={{ title: "Painel", tabBarIcon: icon("view-dashboard") }} />
        <Tabs.Screen name="metas" options={{ title: "Metas", tabBarIcon: icon("target") }} />
        <Tabs.Screen name="remedios" options={{ title: "Remédios", tabBarIcon: icon("pill") }} />
        <Tabs.Screen name="relatorio" options={{ title: "Relatório", tabBarIcon: icon("file-pdf-box") }} />
        <Tabs.Screen name="perfil" options={{ title: "Eu", tabBarIcon: icon("account") }} />
      </Tabs>
    </PatientsProvider>
  );
}
