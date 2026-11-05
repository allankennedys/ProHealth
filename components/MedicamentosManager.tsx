import TimeField from "@/components/TimeField";
import { isValidTime } from "@/lib/health";
import { s } from "@/lib/styles";
import { confirmAction, notify } from "@/lib/ui";
import { emitRemindersChanged } from "@/lib/reminders";
import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

type Lembrete = { id: string; horario: string };
type Med = { id: string; nome: string; dosagem: string | null; lembretes: Lembrete[] };

/** Cadastro e lista de medicamentos + horários de um paciente. Usado pelo idoso (próprio id) e pelo familiar. */
export default function MedicamentosManager({ patientId, big = false }: { patientId: string; big?: boolean }) {
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [horario, setHorario] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");
  const fs = big ? 20 : 16;

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("medicamentos").select("id, nome, dosagem, lembretes(id, horario)")
      .eq("usuario", patientId).order("created_at", { ascending: true });
    if (error) notify("Erro", "Não foi possível carregar os medicamentos.");
    setMeds(((data as any[]) ?? []).map((m) => ({ ...m, lembretes: (m.lembretes ?? []).sort((a: Lembrete, b: Lembrete) => a.horario.localeCompare(b.horario)) })));
    setLoading(false);
  }, [patientId]);

  useEffect(() => { setLoading(true); load(); }, [load]);
  useEffect(() => { if (!loading) emitRemindersChanged(); }, [meds, loading]);

  async function add() {
    if (!nome.trim()) return notify("Falta o nome do remédio");
    if (!isValidTime(horario)) return notify("Horário inválido", "Use o formato HH:MM, por exemplo 08:00.");
    setSaving(true);
    const { data: med, error } = await supabase
      .from("medicamentos").insert([{ nome: nome.trim(), dosagem: dosagem.trim() || null, usuario: patientId }])
      .select("id").single();
    if (error || !med) { setSaving(false); return notify("Erro", error?.message ?? "Não foi possível cadastrar."); }
    const { error: e2 } = await supabase.from("lembretes").insert([{ medicamento_id: med.id, horario }]);
    setSaving(false);
    if (e2) return notify("Erro", e2.message);
    setNome(""); setDosagem(""); setHorario("");
    load();
  }

  async function addTime(medId: string) {
    if (!isValidTime(newTime)) return notify("Horário inválido", "Use HH:MM, por exemplo 14:30.");
    const { error } = await supabase.from("lembretes").insert([{ medicamento_id: medId, horario: newTime }]);
    if (error) return notify("Erro", error.message);
    setAddingFor(null); setNewTime("");
    load();
  }

  async function removeTime(id: string) {
    await supabase.from("lembretes").delete().eq("id", id);
    load();
  }

  async function removeMed(m: Med) {
    if (!(await confirmAction("Excluir remédio", `Excluir ${m.nome} e seus horários?`, "Excluir"))) return;
    await supabase.from("lembretes").delete().eq("medicamento_id", m.id);
    await supabase.from("medicamentos").delete().eq("id", m.id);
    load();
  }

  return (
    <ScrollView contentContainerStyle={[s.content, { padding: 0 }]}>
      {loading && <ActivityIndicator size="large" color="#1FB9C9" />}
      {!loading && meds.length === 0 && <Text style={{ fontSize: fs, color: "#666" }}>Nenhum remédio cadastrado.</Text>}

      {meds.map((m) => (
        <View key={m.id} style={s.card}>
          <View style={s.rowBetween}>
            <Text style={{ fontSize: fs + 4, fontWeight: "800", flex: 1 }}>
              {m.nome}{m.dosagem ? <Text style={{ fontWeight: "400" }}>  {m.dosagem}</Text> : null}
            </Text>
            <Pressable onPress={() => removeMed(m)} accessibilityLabel={`Excluir ${m.nome}`}>
              <MaterialCommunityIcons name="trash-can-outline" size={30} color="#D63031" />
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {m.lembretes.map((l) => (
              <Pressable key={l.id} onPress={() => removeTime(l.id)} style={[s.chip, { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: "#E7F7FF" }]}>
                <MaterialCommunityIcons name="alarm" size={fs + 2} color="#17A7C5" />
                <Text style={{ fontSize: fs + 2, fontWeight: "700" }}>{String(l.horario).slice(0, 5)}</Text>
                <MaterialCommunityIcons name="close" size={16} color="#888" />
              </Pressable>
            ))}
            {addingFor === m.id ? (
              <View style={s.row}>
                <TimeField value={newTime} onChange={setNewTime} />
                <Pressable onPress={() => addTime(m.id)} style={[s.chip, s.chipActive]}><Text style={{ color: "#fff", fontWeight: "700", fontSize: fs }}>Salvar</Text></Pressable>
                <Pressable onPress={() => setAddingFor(null)}><MaterialCommunityIcons name="close" size={24} color="#888" /></Pressable>
              </View>
            ) : (
              <Pressable onPress={() => { setAddingFor(m.id); setNewTime(""); }} style={[s.chip, { backgroundColor: "#fff", borderWidth: 1, borderColor: "#1FB9C9" }]}>
                <Text style={{ color: "#1FB9C9", fontWeight: "700", fontSize: fs }}>+ horário</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

      <View style={s.card}>
        <Text style={s.h2}>Cadastrar remédio</Text>
        <Text style={s.label}>Nome</Text>
        <TextInput style={[s.input, { fontSize: fs }]} value={nome} onChangeText={setNome} placeholder="Ex.: Losartana" />
        <Text style={s.label}>Dosagem</Text>
        <TextInput style={[s.input, { fontSize: fs }]} value={dosagem} onChangeText={setDosagem} placeholder="Ex.: 50 mg" />
        <Text style={s.label}>Horário</Text>
        <TimeField value={horario} onChange={setHorario} />
        <Pressable style={[s.button, { marginTop: 12 }]} onPress={add} disabled={saving}>
          <Text style={s.buttonText}>{saving ? "Salvando..." : "Cadastrar"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
