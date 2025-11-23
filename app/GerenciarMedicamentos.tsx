import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Lembrete = { id: string; horario: string };
type Medicamento = { id: string; nome: string; dosagem: string; lembretes?: Lembrete[] };

export default function ListaMedicamentosModal() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAndMedicamentos = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Erro", "Usuário não encontrado.");
        router.back();
        return;
      }
      setUserId(user.id);
      await fetchMedicamentos(user.id);
    };
    loadUserAndMedicamentos();
  }, []);

  const fetchMedicamentos = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("medicamentos")
      .select("id,nome,dosagem,lembretes(id,horario)")
      .eq("usuario", uid);
    if (error) {
      Alert.alert("Erro", "Não foi possível carregar medicamentos.");
      setLoading(false);
      return;
    }
    setMedicamentos(data || []);
    setLoading(false);
  };

  const handleExcluirMedicamento = async (medId: string) => {
    Alert.alert("Excluir", "Deseja excluir este medicamento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await supabase.from("lembretes").delete().eq("medicamento_id", medId);
          await supabase.from("medicamentos").delete().eq("id", medId);
          if (userId) fetchMedicamentos(userId);
        },
      },
    ]);
  };

  const handleEditarMedicamento = (med: Medicamento) => {
    Alert.prompt(
      "Editar medicamento",
      "Atualize o nome do medicamento",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salvar",
          onPress: (novoNome?: string) => {
            if (!novoNome) return;
            supabase.from("medicamentos").update({ nome: novoNome }).eq("id", med.id);
            if (userId) fetchMedicamentos(userId);
          },
        },
      ],
      "plain-text",
      med.nome
    );
  };

  const handleEditarLembrete = (medId: string, lemb: Lembrete) => {
    Alert.prompt(
      "Editar horário",
      "Atualize o horário do lembrete (HH:MM)",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salvar",
          onPress: (novoHorario?: string) => {
            if (!novoHorario) return;
            supabase.from("lembretes").update({ horario: novoHorario }).eq("id", lemb.id);
            if (userId) fetchMedicamentos(userId);
          },
        },
      ],
      "plain-text",
      lemb.horario
    );
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#1FB9C9" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Medicamentos</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={medicamentos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.medNome}>{item.nome} ({item.dosagem})</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Excluir" color="red" onPress={() => handleExcluirMedicamento(item.id)} />
              </View>
            </View>

            {item.lembretes?.map((lemb) => (
              <View key={lemb.id} style={styles.lembrete}>
                <Text>{lemb.horario}</Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  closeButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#333" },
  card: { backgroundColor: "#F9F9F9", padding: 16, borderRadius: 12, marginBottom: 12 },
  medNome: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  lembrete: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginLeft: 12, marginBottom: 4 },
});
