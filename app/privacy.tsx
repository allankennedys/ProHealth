// app/privacy.tsx
import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PrivacyModal() {
  const [usoIA, setUsoIA] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadPrivacySetting = async () => {
      setLoading(true);
      
      // ✅ Correção 1: desestruturação segura
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;

      if (userError || !user) {
        router.back();
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("aceitou_uso_ia")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setUsoIA(profile?.aceitou_uso_ia ?? true);
      } catch (err: any) {
        console.error("Erro ao carregar privacidade:", err);
        Alert.alert("Erro", "Não foi possível carregar suas preferências.");
      } finally {
        setLoading(false);
      }
    };

    loadPrivacySetting();
  }, []);

  const toggleUsoIA = async () => {
    if (updating || loading) return;

    const novoValor = !usoIA;
    setUpdating(true);

    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;

    if (userError || !user) {
      setUpdating(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ aceitou_uso_ia: novoValor })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Erro", "Não foi possível salvar sua preferência.");
      setUpdating(false);
      return;
    }

    setUsoIA(novoValor);
    setUpdating(false);
    Alert.alert(
      "Sucesso",
      `Relatórios com IA ${novoValor ? "ativados" : "desativados"}.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header com botão de fechar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacidade</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Como o Pulse usa meus dados?</Text>
        <Text style={styles.description}>
          O Pulse usa os dados que você insere para que a inteligência artificial
          identifique padrões e ofereça insights personalizados sobre sua saúde,
          sempre como apoio e nunca em substituição a uma consulta médica.
        </Text>

        <View style={styles.toggleSection}>
          <Text style={styles.toggleLabel}>
            Permitir relatórios e insights personalizados com IA
          </Text>
          <Switch
            value={usoIA}
            onValueChange={toggleUsoIA}
            disabled={updating || loading}
            trackColor={{ false: "#ccc", true: "#1FB9C9" }}
            thumbColor={usoIA ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 24,
  },
  toggleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  toggleLabel: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
});