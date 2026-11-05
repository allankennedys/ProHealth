import PatientPicker from "@/components/PatientPicker";
import { ageFrom } from "@/lib/health";
import { usePatients } from "@/lib/patients";
import { s } from "@/lib/styles";
import { notify } from "@/lib/ui";
import { supabase } from "@/supabase";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const maskDate = (t: string) => {
  const d = t.replace(/\D/g, "").slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};

export default function Metas() {
  const { patient, reload } = usePatients();
  const [f, setF] = useState({ name: "", birth: "", gmin: "", gmax: "", smin: "", smax: "", dmin: "", dmax: "", emName: "", emPhone: "", emEmail: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!patient) return;
    const b = patient.birth_date ? patient.birth_date.split("-").reverse().join("/") : "";
    setF({
      name: patient.full_name ?? "", birth: b,
      gmin: String(patient.glucose_min), gmax: String(patient.glucose_max),
      smin: String(patient.sys_min), smax: String(patient.sys_max),
      dmin: String(patient.dia_min), dmax: String(patient.dia_max),
      emName: patient.emergency_name ?? "", emPhone: patient.emergency_phone ?? "", emEmail: patient.emergency_email ?? "",
    });
  }, [patient]);

  const set = (k: keyof typeof f) => (v: string) => setF((o) => ({ ...o, [k]: v }));

  async function save() {
    if (!patient) return;
    const n = (v: string) => parseFloat(v.replace(",", "."));
    const [gmin, gmax, smin, smax, dmin, dmax] = [f.gmin, f.gmax, f.smin, f.smax, f.dmin, f.dmax].map(n);
    if ([gmin, gmax, smin, smax, dmin, dmax].some(isNaN)) return notify("Valores inválidos", "Preencha todas as faixas com números.");
    if (gmin >= gmax || smin >= smax || dmin >= dmax) return notify("Faixas inválidas", "O mínimo deve ser menor que o máximo.");
    let birth: string | null = null;
    if (f.birth) {
      const m = f.birth.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m || isNaN(new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime())) return notify("Data inválida", "Use DD/MM/AAAA.");
      birth = `${m[3]}-${m[2]}-${m[1]}`;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: f.name.trim() || null, birth_date: birth,
      glucose_min: gmin, glucose_max: gmax, sys_min: smin, sys_max: smax, dia_min: dmin, dia_max: dmax,
      emergency_name: f.emName.trim() || null, emergency_phone: f.emPhone.trim() || null, emergency_email: f.emEmail.trim() || null,
    }).eq("id", patient.id);
    setSaving(false);
    if (error) return notify("Erro ao salvar", error.message);
    await reload();
    notify("Metas salvas", "Os alertas passam a usar estas faixas.");
  }

  const range = (label: string, unit: string, a: keyof typeof f, b: keyof typeof f) => (
    <View style={s.card}>
      <Text style={s.h2}>{label}</Text>
      <View style={s.row}>
        <View style={{ flex: 1 }}><Text style={s.label}>Mínimo ({unit})</Text><TextInput style={s.input} keyboardType="decimal-pad" value={f[a]} onChangeText={set(a)} /></View>
        <View style={{ flex: 1 }}><Text style={s.label}>Máximo ({unit})</Text><TextInput style={s.input} keyboardType="decimal-pad" value={f[b]} onChangeText={set(b)} /></View>
      </View>
    </View>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingTop: 56 }]}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Metas e limites</Text>
      <PatientPicker showLink={!patient} />
      {patient && (
        <>
          <Text style={s.muted}>Faixas aceitáveis definidas pelo médico. Fora delas, o familiar recebe alerta.</Text>
          {range("Glicemia", "mg/dL", "gmin", "gmax")}
          {range("Pressão sistólica (maior)", "mmHg", "smin", "smax")}
          {range("Pressão diastólica (menor)", "mmHg", "dmin", "dmax")}

          <View style={s.card}>
            <Text style={s.h2}>Cadastro do paciente</Text>
            <Text style={s.label}>Nome</Text>
            <TextInput style={s.input} value={f.name} onChangeText={set("name")} />
            <Text style={s.label}>Nascimento {ageFrom(patient.birth_date) !== null ? `(${ageFrom(patient.birth_date)} anos)` : ""}</Text>
            <TextInput style={s.input} value={f.birth} onChangeText={(t) => set("birth")(maskDate(t))} placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} />
            <Text style={s.label}>Contato de emergência — nome</Text>
            <TextInput style={s.input} value={f.emName} onChangeText={set("emName")} />
            <Text style={s.label}>Telefone</Text>
            <TextInput style={s.input} value={f.emPhone} onChangeText={set("emPhone")} keyboardType="phone-pad" />
            <Text style={s.label}>E-mail</Text>
            <TextInput style={s.input} value={f.emEmail} onChangeText={set("emEmail")} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Pressable style={[s.button, { paddingVertical: 18 }]} onPress={save} disabled={saving}>
            <Text style={s.buttonText}>{saving ? "Salvando..." : "Salvar metas"}</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
