import BigButton from "@/components/BigButton";
import { CONTEXT_LABEL, glucoseStatus, STATUS_BG, STATUS_COLOR, type GlucoseContext } from "@/lib/health";
import { useSession } from "@/lib/session";
import { s } from "@/lib/styles";
import { notify } from "@/lib/ui";
import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const OPTIONS: { key: GlucoseContext; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }[] = [
  { key: "jejum", icon: "weather-sunny", color: "#E0A100" },
  { key: "pos_refeicao", icon: "silverware-fork-knife", color: "#E8590C" },
  { key: "antes_dormir", icon: "weather-night", color: "#4B4BC8" },
];

export default function Glicemia() {
  const router = useRouter();
  const { profile } = useSession();
  const [value, setValue] = useState("");
  const [context, setContext] = useState<GlucoseContext | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  async function save() {
    const v = parseFloat(value.replace(",", "."));
    if (isNaN(v) || v < 20 || v > 800) return notify("Valor inválido", "Digite a glicemia em mg/dL (ex.: 110).");
    if (!context) return notify("Quando você mediu?", "Toque em uma das opções: jejum, após refeição ou antes de dormir.");
    setSaving(true);
    const { error } = await supabase.from("glucose_logs").insert([{ user_id: profile!.id, glucose_mgdl: v, context }]);
    setSaving(false);
    if (error) return notify("Não foi possível salvar", error.message);
    setDone(v);
  }

  if (done !== null) {
    const st = glucoseStatus(done, profile!);
    return (
      <View style={[s.screen, { justifyContent: "center", padding: 28, gap: 20, backgroundColor: STATUS_BG[st] }]}>
        <MaterialCommunityIcons name="check-circle" size={110} color={STATUS_COLOR[st]} style={{ alignSelf: "center" }} />
        <Text style={{ fontSize: 32, fontWeight: "800", textAlign: "center" }}>Registro salvo com sucesso! Parabéns!</Text>
        <Text style={{ fontSize: 26, textAlign: "center", color: STATUS_COLOR[st], fontWeight: "800" }}>
          {done} mg/dL — {st === "ok" ? "dentro do normal" : "fora do normal. Seu familiar foi avisado."}
        </Text>
        <BigButton label="Voltar" bg="#1FB9C9" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingTop: 48 }]}>
      <Text style={{ fontSize: 32, fontWeight: "800" }}>Glicemia</Text>

      <Text style={{ fontSize: 22, fontWeight: "700" }}>1. Quando você mediu?</Text>
      <View style={{ gap: 12 }}>
        {OPTIONS.map((o) => (
          <BigButton key={o.key} size="md" icon={o.icon} label={CONTEXT_LABEL[o.key]}
            bg={context === o.key ? o.color : "#fff"} color={context === o.key ? "#fff" : "#333"}
            onPress={() => setContext(o.key)} />
        ))}
      </View>

      <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 8 }}>2. Qual foi o valor?</Text>
      <View style={[s.card, { alignItems: "center" }]}>
        <TextInput
          value={value} onChangeText={(t) => setValue(t.replace(/[^\d.,]/g, ""))}
          keyboardType="decimal-pad" placeholder="110" placeholderTextColor="#bbb"
          style={{ fontSize: 64, fontWeight: "800", textAlign: "center", width: "100%" }}
          accessibilityLabel="Valor da glicemia em miligramas por decilitro"
        />
        <Text style={{ fontSize: 20, color: "#666" }}>mg/dL</Text>
      </View>

      <BigButton icon="content-save" label={saving ? "Salvando..." : "Salvar"} bg="#2E9E5B" disabled={saving} onPress={save} />
      <Pressable onPress={() => router.back()} style={{ padding: 18 }}>
        <Text style={{ fontSize: 20, textAlign: "center", color: "#666" }}>Cancelar</Text>
      </Pressable>
    </ScrollView>
  );
}
