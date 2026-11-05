import { isValidPin, pinToPassword } from "@/lib/health";
import { s } from "@/lib/styles";
import { supabase } from "@/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const LAST_EMAIL = "prohealth:last-email";

export default function Login() {
  const [mode, setMode] = useState<"pin" | "senha">("pin");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(LAST_EMAIL).then((v) => v && setEmail(v));
  }, []);

  async function handleLogin() {
    setErrorMsg("");
    if (!email.trim()) return setErrorMsg("Digite seu e-mail.");
    if (mode === "pin" && !isValidPin(secret)) return setErrorMsg("O PIN tem 4 números.");
    if (mode === "senha" && !secret) return setErrorMsg("Digite sua senha.");

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: mode === "pin" ? pinToPassword(secret) : secret,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(mode === "pin" ? "E-mail ou PIN incorretos." : "E-mail ou senha incorretos.");
      return;
    }
    await AsyncStorage.setItem(LAST_EMAIL, email.trim());
    router.replace("/");
  }

  const big = mode === "pin";

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 30, backgroundColor: "white" }}>
      <View style={{ width: "100%", maxWidth: 440, alignSelf: "center" }}>
        <Image source={require("../../assets/images/logol.png")} style={{ width: 90, height: 90, alignSelf: "center", marginBottom: 24 }} resizeMode="contain" />

        <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {(["pin", "senha"] as const).map((m) => (
            <Pressable key={m} onPress={() => { setMode(m); setSecret(""); setErrorMsg(""); }}
              style={[s.chip, mode === m && s.chipActive]}>
              <Text style={{ color: mode === m ? "#fff" : "#333", fontWeight: "700" }}>
                {m === "pin" ? "Entrar com PIN" : "Entrar com senha"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>E-mail</Text>
        <TextInput style={s.input} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={s.label}>{big ? "PIN (4 números)" : "Senha"}</Text>
        <TextInput
          style={[s.input, big && { fontSize: 32, letterSpacing: 18, textAlign: "center" }]}
          value={secret}
          onChangeText={(t) => setSecret(big ? t.replace(/\D/g, "").slice(0, 4) : t)}
          secureTextEntry
          keyboardType={big ? "number-pad" : "default"}
          maxLength={big ? 4 : undefined}
          onSubmitEditing={handleLogin}
        />

        {errorMsg !== "" && <Text style={{ color: "#D63031", marginTop: 12, fontSize: 16 }}>{errorMsg}</Text>}

        <Pressable style={[s.button, { marginTop: 28, paddingVertical: 20 }]} disabled={loading} onPress={handleLogin}>
          <Text style={[s.buttonText, { fontSize: 22 }]}>{loading ? "Entrando..." : "Entrar"}</Text>
        </Pressable>

        {!big && (
          <Pressable onPress={() => router.push("/(auth)/forgot")}>
            <Text style={{ color: "#1FB9C9", textAlign: "center", marginTop: 18, fontSize: 15 }}>Esqueci minha senha</Text>
          </Pressable>
        )}
        <Pressable onPress={() => router.push("/(auth)/register")}>
          <Text style={{ color: "#1FB9C9", textAlign: "center", marginTop: 16, fontSize: 17 }}>Criar nova conta</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
