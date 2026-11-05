import TermosdeUso from "@/components/TermosdeUso";
import { isValidPin, pinToPassword, type Role } from "@/lib/health";
import { s } from "@/lib/styles";
import { notify } from "@/lib/ui";
import { supabase } from "@/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

const maskDate = (t: string) => {
  const d = t.replace(/\D/g, "").slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};
const toIso = (br: string) => {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) || d > new Date() ? null : iso;
};

export default function Register() {
  const [role, setRole] = useState<Role>("idoso");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState(""); // PIN (idoso) ou senha (familiar)
  const [secret2, setSecret2] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [emName, setEmName] = useState("");
  const [emPhone, setEmPhone] = useState("");
  const [emEmail, setEmEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isIdoso = role === "idoso";

  async function handleRegister() {
    setErrorMsg("");
    if (!fullName.trim()) return setErrorMsg("Informe o nome completo.");
    if (!email.trim()) return setErrorMsg("Informe o e-mail.");
    if (isIdoso) {
      if (!isValidPin(secret)) return setErrorMsg("O PIN deve ter exatamente 4 números.");
    } else if (secret.length < 6) {
      return setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
    }
    if (secret !== secret2) return setErrorMsg(isIdoso ? "Os PINs não conferem." : "As senhas não conferem.");
    const birthIso = birth ? toIso(birth) : null;
    if (birth && !birthIso) return setErrorMsg("Data de nascimento inválida (use DD/MM/AAAA).");
    if (!accepted) return setErrorMsg("É necessário aceitar os Termos de Uso.");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: isIdoso ? pinToPassword(secret) : secret,
      options: { data: { full_name: fullName.trim(), role } },
    });

    if (error || !data.user) {
      setLoading(false);
      return setErrorMsg(error?.message ?? "Erro ao criar usuário.");
    }
    if (!data.session) {
      // projeto com confirmação de e-mail ligada
      setLoading(false);
      notify("Conta criada!", "Confirme seu e-mail e depois faça login.");
      return router.replace("/(auth)/login");
    }

    const { error: profileError } = await supabase.from("profiles").update({
      birth_date: birthIso,
      phone: phone.trim() || null,
      ...(isIdoso && {
        emergency_name: emName.trim() || null,
        emergency_phone: emPhone.trim() || null,
        emergency_email: emEmail.trim() || null,
      }),
    }).eq("id", data.user.id);
    setLoading(false);
    if (profileError) console.warn("perfil:", profileError.message);

    router.replace("/");
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 28, backgroundColor: "white", paddingTop: 56 }}>
      <View style={{ width: "100%", maxWidth: 480, alignSelf: "center", gap: 6 }}>
        <Text style={[s.h2, { fontSize: 26, textAlign: "center", marginBottom: 12 }]}>Criar conta</Text>

        <Text style={s.label}>Quem vai usar?</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["idoso", "familiar"] as const).map((r) => (
            <Pressable key={r} onPress={() => { setRole(r); setSecret(""); setSecret2(""); }}
              style={[s.chip, { flex: 1, alignItems: "center", paddingVertical: 14 }, role === r && s.chipActive]}>
              <Text style={{ color: role === r ? "#fff" : "#333", fontWeight: "700", fontSize: 16 }}>
                {r === "idoso" ? "Eu sou o paciente" : "Sou familiar / cuidador"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>Nome completo</Text>
        <TextInput style={s.input} value={fullName} onChangeText={setFullName} />

        <Text style={s.label}>E-mail</Text>
        <TextInput style={s.input} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={s.label}>{isIdoso ? "Crie um PIN de 4 números" : "Senha (mín. 6 caracteres)"}</Text>
        <TextInput
          style={[s.input, isIdoso && { fontSize: 28, letterSpacing: 14, textAlign: "center" }]}
          value={secret} secureTextEntry
          keyboardType={isIdoso ? "number-pad" : "default"}
          maxLength={isIdoso ? 4 : undefined}
          onChangeText={(t) => setSecret(isIdoso ? t.replace(/\D/g, "") : t)}
        />
        <Text style={s.label}>{isIdoso ? "Repita o PIN" : "Repita a senha"}</Text>
        <TextInput
          style={[s.input, isIdoso && { fontSize: 28, letterSpacing: 14, textAlign: "center" }]}
          value={secret2} secureTextEntry
          keyboardType={isIdoso ? "number-pad" : "default"}
          maxLength={isIdoso ? 4 : undefined}
          onChangeText={(t) => setSecret2(isIdoso ? t.replace(/\D/g, "") : t)}
        />

        {isIdoso && (
          <>
            <Text style={s.label}>Data de nascimento</Text>
            <TextInput style={s.input} value={birth} onChangeText={(t) => setBirth(maskDate(t))} keyboardType="number-pad" placeholder="DD/MM/AAAA" maxLength={10} />

            <Text style={[s.h2, { marginTop: 18 }]}>Contato de emergência</Text>
            <Text style={s.muted}>Você pode preencher depois, no seu perfil.</Text>
            <Text style={s.label}>Nome do familiar</Text>
            <TextInput style={s.input} value={emName} onChangeText={setEmName} />
            <Text style={s.label}>Telefone</Text>
            <TextInput style={s.input} value={emPhone} onChangeText={setEmPhone} keyboardType="phone-pad" />
            <Text style={s.label}>E-mail</Text>
            <TextInput style={s.input} value={emEmail} onChangeText={setEmEmail} keyboardType="email-address" autoCapitalize="none" />
          </>
        )}
        {!isIdoso && (
          <>
            <Text style={s.label}>Telefone (para receber alertas)</Text>
            <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </>
        )}

        <View style={[s.rowBetween, { marginTop: 18 }]}>
          <Text style={{ flex: 1, fontSize: 15 }}>
            Li e aceito os{" "}
            <Text onPress={() => setShowTerms(true)} style={{ color: "#1FB9C9", fontWeight: "700" }}>Termos de Uso</Text>
          </Text>
          <Switch value={accepted} onValueChange={setAccepted} />
        </View>

        {errorMsg !== "" && <Text style={{ color: "#D63031", fontSize: 16 }}>{errorMsg}</Text>}

        <Pressable style={[s.button, { marginTop: 14, paddingVertical: 18 }]} disabled={loading} onPress={handleRegister}>
          <Text style={s.buttonText}>{loading ? "Criando..." : "Criar conta"}</Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/(auth)/login")}>
          <Text style={{ color: "#1FB9C9", textAlign: "center", marginTop: 14, fontSize: 16 }}>Já tenho conta</Text>
        </Pressable>
      </View>
      <TermosdeUso visible={showTerms} onClose={() => setShowTerms(false)} />
    </ScrollView>
  );
}
