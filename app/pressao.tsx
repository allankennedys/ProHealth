import BigButton from "@/components/BigButton";
import { pressureStatus, STATUS_BG, STATUS_COLOR } from "@/lib/health";
import { useSession } from "@/lib/session";
import { s } from "@/lib/styles";
import { notify } from "@/lib/ui";
import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function Pressao() {
  const router = useRouter();
  const { profile } = useSession();
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ sys: number; dia: number } | null>(null);

  async function save() {
    const sy = parseInt(sys, 10), di = parseInt(dia, 10);
    if (isNaN(sy) || sy < 50 || sy > 300) return notify("Valor inválido", "A pressão SISTÓLICA (a maior) deve estar entre 50 e 300. Ex.: 120");
    if (isNaN(di) || di < 30 || di > 200) return notify("Valor inválido", "A pressão DIASTÓLICA (a menor) deve estar entre 30 e 200. Ex.: 80");
    if (di >= sy) return notify("Confira os valores", "A pressão maior (sistólica) deve ser maior que a menor (diastólica).");
    setSaving(true);
    const { error } = await supabase.from("blood_pressure_logs").insert([{ user_id: profile!.id, systolic: sy, diastolic: di }]);
    setSaving(false);
    if (error) return notify("Não foi possível salvar", error.message);
    setDone({ sys: sy, dia: di });
  }

  if (done) {
    const st = pressureStatus(done.sys, done.dia, profile!);
    return (
      <View style={[s.screen, { justifyContent: "center", padding: 28, gap: 20, backgroundColor: STATUS_BG[st] }]}>
        <MaterialCommunityIcons name="check-circle" size={110} color={STATUS_COLOR[st]} style={{ alignSelf: "center" }} />
        <Text style={{ fontSize: 32, fontWeight: "800", textAlign: "center" }}>Registro salvo com sucesso! Parabéns!</Text>
        <Text style={{ fontSize: 26, textAlign: "center", color: STATUS_COLOR[st], fontWeight: "800" }}>
          {done.sys}/{done.dia} mmHg — {st === "ok" ? "dentro do normal" : "fora do normal. Seu familiar foi avisado."}
        </Text>
        <BigButton label="Voltar" bg="#1FB9C9" onPress={() => router.back()} />
      </View>
    );
  }

  const field = (label: string, hint: string, v: string, set: (t: string) => void, ph: string) => (
    <View style={[s.card, { alignItems: "center" }]}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{label}</Text>
      <Text style={{ fontSize: 16, color: "#666" }}>{hint}</Text>
      <TextInput
        value={v} onChangeText={(t) => set(t.replace(/\D/g, "").slice(0, 3))}
        keyboardType="number-pad" placeholder={ph} placeholderTextColor="#bbb" maxLength={3}
        style={{ fontSize: 64, fontWeight: "800", textAlign: "center", width: "100%" }}
        accessibilityLabel={`${label} em mmHg`}
      />
      <Text style={{ fontSize: 18, color: "#666" }}>mmHg</Text>
    </View>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingTop: 48 }]}>
      <Text style={{ fontSize: 32, fontWeight: "800" }}>Pressão arterial</Text>
      {field("Sistólica", "o número MAIOR", sys, setSys, "120")}
      {field("Diastólica", "o número MENOR", dia, setDia, "80")}
      <BigButton icon="content-save" label={saving ? "Salvando..." : "Salvar"} bg="#2E9E5B" disabled={saving} onPress={save} />
      <Pressable onPress={() => router.back()} style={{ padding: 18 }}>
        <Text style={{ fontSize: 20, textAlign: "center", color: "#666" }}>Cancelar</Text>
      </Pressable>
    </ScrollView>
  );
}
