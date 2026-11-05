import { usePatients } from "@/lib/patients";
import { s } from "@/lib/styles";
import { notify } from "@/lib/ui";
import { supabase } from "@/supabase";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

/** Chips para trocar de paciente + campo para vincular um novo pelo código. */
export default function PatientPicker({ showLink = true }: { showLink?: boolean }) {
  const { patients, patient, selectPatient, reload } = usePatients();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function link() {
    if (code.trim().length < 4) return notify("Digite o código do paciente");
    setBusy(true);
    const { data, error } = await supabase.rpc("vincular_paciente", { p_codigo: code.trim() });
    setBusy(false);
    if (error) return notify("Não foi possível vincular", error.message);
    setCode("");
    await reload();
    if (data) selectPatient(data as string);
  }

  return (
    <View style={{ gap: 12 }}>
      {patients.length > 1 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {patients.map((p) => (
            <Pressable key={p.id} onPress={() => selectPatient(p.id)} style={[s.chip, patient?.id === p.id && s.chipActive]}>
              <Text style={{ color: patient?.id === p.id ? "#fff" : "#333", fontWeight: "700" }}>{p.full_name ?? "Paciente"}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {showLink && (
        <View style={s.card}>
          <Text style={s.h2}>{patients.length ? "Vincular outro paciente" : "Vincule um paciente"}</Text>
          <Text style={s.muted}>Peça o código de 6 caracteres que aparece na aba "Eu" do app do paciente.</Text>
          <View style={s.row}>
            <TextInput style={[s.input, { flex: 1, letterSpacing: 4, fontWeight: "700" }]} value={code} autoCapitalize="characters"
              onChangeText={(t) => setCode(t.toUpperCase())} maxLength={6} placeholder="ABC123" />
            <Pressable style={[s.button, { paddingHorizontal: 22 }]} onPress={link} disabled={busy}>
              <Text style={s.buttonText}>{busy ? "..." : "Vincular"}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
