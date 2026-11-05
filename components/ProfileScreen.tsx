import TimeField from "@/components/TimeField";
import { isValidPin, isValidTime, pinToPassword } from "@/lib/health";
import { useSession } from "@/lib/session";
import { s } from "@/lib/styles";
import { confirmAction, notify } from "@/lib/ui";
import { supabase } from "@/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

/** Perfil do usuário logado (idoso ou familiar). */
export default function ProfileScreen() {
  const { profile, session, refreshProfile, signOut } = useSession();
  const isIdoso = profile?.role === "idoso";
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [emName, setEmName] = useState(profile?.emergency_name ?? "");
  const [emPhone, setEmPhone] = useState(profile?.emergency_phone ?? "");
  const [emEmail, setEmEmail] = useState(profile?.emergency_email ?? "");
  const [hGli, setHGli] = useState<string[]>(profile?.horarios_glicemia ?? []);
  const [hPa, setHPa] = useState<string[]>(profile?.horarios_pressao ?? []);
  const [newGli, setNewGli] = useState("");
  const [newPa, setNewPa] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  function addTime(list: string[], set: (v: string[]) => void, value: string, clear: () => void) {
    if (!isValidTime(value)) return notify("Horário inválido", "Use HH:MM, por exemplo 08:00.");
    if (!list.includes(value)) set([...list, value].sort());
    clear();
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: name.trim() || null,
      phone: phone.trim() || null,
      ...(isIdoso && {
        emergency_name: emName.trim() || null,
        emergency_phone: emPhone.trim() || null,
        emergency_email: emEmail.trim() || null,
        horarios_glicemia: hGli,
        horarios_pressao: hPa,
      }),
    }).eq("id", profile!.id);

    if (!error && isIdoso && pin) {
      if (!isValidPin(pin)) { setSaving(false); return notify("PIN inválido", "O PIN deve ter 4 números."); }
      const { error: e2 } = await supabase.auth.updateUser({ password: pinToPassword(pin) });
      if (e2) { setSaving(false); return notify("Erro ao trocar o PIN", e2.message); }
      setPin("");
    }
    setSaving(false);
    if (error) return notify("Erro", error.message);
    await refreshProfile();
    notify("Salvo!", "Seus dados foram atualizados.");
  }

  async function logout() {
    if (await confirmAction("Sair", "Tem certeza que deseja sair?", "Sair")) {
      await signOut();
      router.replace("/(auth)/login");
    }
  }

  const fs = isIdoso ? 18 : 16;
  const times = (list: string[], set: (v: string[]) => void) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {list.map((t) => (
        <Pressable key={t} onPress={() => set(list.filter((x) => x !== t))} style={[s.chip, { backgroundColor: "#E7F7FF" }]}>
          <Text style={{ fontSize: fs, fontWeight: "700" }}>{t}  ✕</Text>
        </Pressable>
      ))}
      {list.length === 0 && <Text style={s.muted}>Nenhum horário definido</Text>}
    </View>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingTop: 56 }]}>
      <Text style={{ fontSize: 30, fontWeight: "800" }}>Meu perfil</Text>
      <Text style={s.muted}>{session?.user.email}</Text>

      {isIdoso && (
        <View style={[s.card, { backgroundColor: "#E7F7FF" }]}>
          <Text style={s.h2}>Código para o seu familiar</Text>
          <Text style={s.muted}>Passe este código para quem vai acompanhar você. Ele digita no app dele para se vincular.</Text>
          <Text selectable style={{ fontSize: 40, fontWeight: "800", letterSpacing: 6, color: "#17A7C5" }}>{profile.codigo_vinculo ?? "—"}</Text>
        </View>
      )}

      <View style={s.card}>
        <Text style={s.h2}>Dados pessoais</Text>
        <Text style={s.label}>Nome</Text>
        <TextInput style={[s.input, { fontSize: fs }]} value={name} onChangeText={setName} />
        {!isIdoso && (
          <>
            <Text style={s.label}>Telefone (alertas)</Text>
            <TextInput style={[s.input, { fontSize: fs }]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </>
        )}
      </View>

      {isIdoso && (
        <>
          <View style={s.card}>
            <Text style={s.h2}>Contato de emergência</Text>
            <Text style={s.label}>Nome</Text>
            <TextInput style={[s.input, { fontSize: fs }]} value={emName} onChangeText={setEmName} />
            <Text style={s.label}>Telefone</Text>
            <TextInput style={[s.input, { fontSize: fs }]} value={emPhone} onChangeText={setEmPhone} keyboardType="phone-pad" />
            <Text style={s.label}>E-mail</Text>
            <TextInput style={[s.input, { fontSize: fs }]} value={emEmail} onChangeText={setEmEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={s.card}>
            <Text style={s.h2}>Horários para medir a glicemia</Text>
            {times(hGli, setHGli)}
            <View style={s.row}>
              <TimeField value={newGli} onChange={setNewGli} />
              <Pressable style={[s.chip, s.chipActive]} onPress={() => addTime(hGli, setHGli, newGli, () => setNewGli(""))}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: fs }}>Adicionar</Text>
              </Pressable>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.h2}>Horários para medir a pressão</Text>
            {times(hPa, setHPa)}
            <View style={s.row}>
              <TimeField value={newPa} onChange={setNewPa} />
              <Pressable style={[s.chip, s.chipActive]} onPress={() => addTime(hPa, setHPa, newPa, () => setNewPa(""))}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: fs }}>Adicionar</Text>
              </Pressable>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.h2}>Trocar PIN</Text>
            <TextInput style={[s.input, { fontSize: 24, letterSpacing: 10, textAlign: "center" }]} value={pin}
              onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" secureTextEntry placeholder="novo PIN" maxLength={4} />
          </View>
        </>
      )}

      <Pressable style={[s.button, { paddingVertical: 18 }]} onPress={save} disabled={saving}>
        <Text style={[s.buttonText, { fontSize: 20 }]}>{saving ? "Salvando..." : "Salvar alterações"}</Text>
      </Pressable>
      <Pressable style={s.buttonGhost} onPress={() => router.push("/privacy")}>
        <Text style={s.buttonGhostText}>Privacidade</Text>
      </Pressable>
      <Pressable style={[s.button, { backgroundColor: "#D63031" }]} onPress={logout}>
        <Text style={s.buttonText}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}
