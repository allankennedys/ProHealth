import ReminderWatcher from "@/components/ReminderWatcher";
import { useSession } from "@/lib/session";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

export default function IdosoLayout() {
  const { session, profile, loading } = useSession();
  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (profile?.role === "familiar") return <Redirect href="/(familiar)" />;

  const icon = (name: keyof typeof MaterialCommunityIcons.glyphMap) =>
    ({ color }: { color: string }) => <MaterialCommunityIcons name={name} size={32} color={color} />;

  return (
    <>
      <ReminderWatcher />
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#17A7C5",
        tabBarLabelStyle: { fontSize: 15, fontWeight: "700" },
        tabBarStyle: { height: 74, paddingTop: 6, paddingBottom: 8 },
      }}>
        <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: icon("home") }} />
        <Tabs.Screen name="historico" options={{ title: "Histórico", tabBarIcon: icon("chart-line") }} />
        <Tabs.Screen name="remedios" options={{ title: "Remédios", tabBarIcon: icon("pill") }} />
        <Tabs.Screen name="perfil" options={{ title: "Eu", tabBarIcon: icon("account") }} />
      </Tabs>
    </>
  );
}
