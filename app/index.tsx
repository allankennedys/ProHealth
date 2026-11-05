import { useSession } from "@/lib/session";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { session, profile, loading } = useSession();

  if (loading || (session && !profile)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#1FB9C9" />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/login" />;
  return <Redirect href={profile?.role === "familiar" ? "/(familiar)" : "/(idoso)"} />;
}
