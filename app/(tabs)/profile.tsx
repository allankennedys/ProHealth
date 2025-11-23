// app/(tabs)/profile.tsx
import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Carregando...");

  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      try {
        // Buscar nome do perfil
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setUserName(profile?.full_name || "Usuário");
      } catch (err: any) {
        console.error("Erro ao carregar perfil:", err);
        setError("Não foi possível carregar seus dados.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.error("Erro ao sair:", error.message);
            }
            router.replace("/login");
          },
        },
      ]
    );
  };

  const openModal = (modal: string) => {
    // Você pode usar um modal genérico ou navegar para uma tela específica
    // Por enquanto, vamos apenas alertar
    Alert.alert(`${modal}`, `O ProHealth usa os dados que você
insere para que a inteligência
artificial identifique padrões e
ofereça insights personalizados
sobre sua saúde, sempre como
apoio e nunca em substituição a
uma consulta médica.`);
    // Se quiser navegar:
    // router.push(`/profile-modal?modal=${modal}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userName}</Text>
        <MaterialCommunityIcons name="account" size={28} color="#fff" />
      </View>

      {/* Cards */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/edit-profile")}
        >
          <MaterialCommunityIcons name="account-edit" size={24} color="#1FB9C9" />
          <Text style={styles.cardText}>Editar dados pessoais</Text>
        </TouchableOpacity>

<TouchableOpacity style={styles.card} onPress={() => router.push("/privacy")}>
  <MaterialCommunityIcons name="lock" size={24} color="#1FB9C9" />
  <Text style={styles.cardText}>Privacidade</Text>
</TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.logoutCard]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#ff4d4d" />
          <Text style={[styles.cardText, styles.logoutText]}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loading}>
          <Text>Carregando...</Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.error}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#1EBCCF",
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  cardsContainer: {
    padding: 20,
    gap: 15,
  },
  card: {
    backgroundColor: "#E7F7FF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  logoutCard: {
    backgroundColor: "#FFE7E7",
  },
  logoutText: {
    color: "#FF4D4D",
    fontWeight: "600",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    padding: 20,
    alignItems: "center",
  },
});