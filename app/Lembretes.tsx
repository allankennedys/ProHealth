import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function CadastroMedicamentoModal() {
const router = useRouter();
const [userId, setUserId] = useState<string | null>(null);
const [loading, setLoading] = useState(true);
const [nome, setNome] = useState("");
const [dosagem, setDosagem] = useState("");
const [horario, setHorario] = useState("");
const [submitting, setSubmitting] = useState(false);
const [isTimePickerVisible, setTimePickerVisible] = useState(false);

useEffect(() => {
const loadUser = async () => {
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
Alert.alert("Erro", "Usuário não encontrado.");
router.back();
return;
}
setUserId(user.id);
setLoading(false);
};
loadUser();
}, []);

const showTimePicker = () => setTimePickerVisible(true);
const hideTimePicker = () => setTimePickerVisible(false);

const handleConfirmTime = (date: Date) => {
const hours = String(date.getHours()).padStart(2, "0");
const minutes = String(date.getMinutes()).padStart(2, "0");
setHorario(`${hours}:${minutes}`);
hideTimePicker();
};

const handleCadastrar = async () => {
if (!nome || !horario) {
Alert.alert("Preencha nome e horário.");
return;
}
if (!userId) return;


setSubmitting(true);

try {
  // Cadastrar medicamento
  await supabase.from("medicamentos").insert([{ nome, dosagem, usuario: userId }]);

  // Buscar último medicamento inserido
  const { data: medData, error: medError } = await supabase
    .from("medicamentos")
    .select("id")
    .eq("usuario", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single(); 

  if (medError) throw medError;
  const medicamentoId = medData.id;

  // Cadastrar lembrete
  await supabase.from("lembretes").insert([{ medicamento_id: medicamentoId, horario }]);

  Alert.alert("Sucesso", "Medicamento e lembrete cadastrados!");
  setNome("");
  setDosagem("");
  setHorario("");
  router.back(); 
} catch (err: any) {
  console.error(err);
  Alert.alert("Erro", err.message || "Não foi possível cadastrar.");
} finally {
  setSubmitting(false);
}


};

if (loading) {
return ( <View style={styles.container}><ActivityIndicator size="large" color="#1FB9C9" /></View>
);
}

return ( <View style={styles.container}><View style={styles.header}>
<TouchableOpacity onPress={() => router.back()} style={styles.closeButton}><MaterialCommunityIcons name="close" size={28} color="#555" /></TouchableOpacity><Text style={styles.headerTitle}>Cadastrar Medicamento</Text>
<View style={{ width: 28 }} /></View>


  <View style={styles.content}>
    <Text style={styles.label}>Nome do medicamento:</Text>
    <TextInput
      value={nome}
      onChangeText={setNome}
      placeholder="Ex: Paracetamol"
      style={styles.input}
    />

    <Text style={styles.label}>Dosagem:</Text>
    <TextInput
      value={dosagem}
      onChangeText={setDosagem}
      placeholder="Ex: 500mg"
      style={styles.input}
    />

    <Text style={styles.label}>Horário:</Text>
    <TouchableOpacity onPress={showTimePicker} style={styles.input}>
      <Text>{horario || "Escolha o horário"}</Text>
    </TouchableOpacity>

    <DateTimePickerModal
      isVisible={isTimePickerVisible}
      mode="time"
      onConfirm={handleConfirmTime}
      onCancel={hideTimePicker}
    />

    <Button
      title={submitting ? "Cadastrando..." : "Cadastrar"}
      onPress={handleCadastrar}
      disabled={submitting}
      color="#1FB9C9"
    />
  </View>
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
content: { flex: 1, padding: 20, gap: 12 },
label: { fontSize: 15, color: "#333" },
input: {
borderWidth: 1,
borderColor: "#ccc",
borderRadius: 12,
padding: 12,
marginBottom: 12,
fontSize: 15,
justifyContent: "center",
},
});
