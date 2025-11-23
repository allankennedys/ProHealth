// app/edit-profile.tsx
import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditProfileModal() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "Sedentário",
  });
  const [showActivityModal, setShowActivityModal] = useState(false);

  const router = useRouter();
  const activityLevels = ["Sedentário", "Leve", "Moderado", "Intenso"];

useEffect(() => {
  const loadProfile = async () => {
    setLoading(true);

    // ✅ Obter usuário autenticado
    const { data: authData, error: userError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (userError || !user) {
      Alert.alert("Erro", "Usuário não autenticado");
      router.back();
      setLoading(false);
      return;
    }

    // ✅ Buscar perfil do usuário
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, height_cm, weight_kg, activity_level")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar seus dados.");
      router.back();
      setLoading(false);
      return;
    }

    setFormData({
      full_name: data?.full_name || "",
      height_cm: data?.height_cm ? String(data.height_cm) : "",
      weight_kg: data?.weight_kg ? String(data.weight_kg) : "",
      activity_level: data?.activity_level || "Sedentário",
    });

    setLoading(false);
  };

  loadProfile();
}, []);


  const handleSave = async () => {
    setSaving(true);

    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;

    if (userError || !user) {
      setSaving(false);
      return;
    }

    const height = formData.height_cm ? parseFloat(formData.height_cm) : null;
    const weight = formData.weight_kg ? parseFloat(formData.weight_kg) : null;

    if (formData.height_cm && (isNaN(height!) || height! <= 0)) {
      Alert.alert("Erro", "Altura deve ser um número válido.");
      setSaving(false);
      return;
    }
    if (formData.weight_kg && (isNaN(weight!) || weight! <= 0)) {
      Alert.alert("Erro", "Peso deve ser um número válido.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name.trim() || null,
        height_cm: height,
        weight_kg: weight,
        activity_level: formData.activity_level,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível salvar seus dados.");
      return;
    }

    Alert.alert("Sucesso", "Dados atualizados!");
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar dados pessoais</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome completo</Text>
        <TextInput
          style={styles.input}
          value={formData.full_name}
          onChangeText={(text) => setFormData({ ...formData, full_name: text })}
          placeholder="Seu nome"
        />

        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput
          style={styles.input}
          value={formData.height_cm}
          onChangeText={(text) => setFormData({ ...formData, height_cm: text })}
          keyboardType="numeric"
          placeholder="Ex: 170"
        />

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={formData.weight_kg}
          onChangeText={(text) => setFormData({ ...formData, weight_kg: text })}
          keyboardType="numeric"
          placeholder="Ex: 70"
        />

        <Text style={styles.label}>Nível de atividade</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowActivityModal(true)}
        >
          <Text style={{ color: formData.activity_level ? "#333" : "#999", fontSize: 16 }}>
            {formData.activity_level}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, { opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showActivityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o nível de atividade</Text>
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, activity_level: level });
                  setShowActivityModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{level}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalOption, { borderTopWidth: 1, borderTopColor: "#eee" }]}
              onPress={() => setShowActivityModal(false)}
            >
              <Text style={{ color: "#1FB9C9", fontSize: 16 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F6F8FC",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#1FB9C9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxHeight: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  modalOption: {
    padding: 14,
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
});