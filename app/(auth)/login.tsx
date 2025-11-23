import { supabase } from "@/supabase"; // ajuste se seu path for diferente
import { router } from "expo-router";
import { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin() {
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg("Email ou senha incorretos.");
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      
      {/* LOGO */}
      <Image
        source={require("../../assets/images/logo.png")} 
        style={styles.logo}
        resizeMode="contain"
      />

      {/* EMAIL */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* SENHA */}
      <Text style={[styles.label, { marginTop: 16 }]}>Senha</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* ERRO */}
      {errorMsg !== "" && (
        <Text style={{ color: "red", marginVertical: 10 }}>{errorMsg}</Text>
      )}

      {/* BOTÃO */}
      <TouchableOpacity
        style={styles.button}
        disabled={loading}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/forgot")}>
        <Text style={styles.link}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={[styles.link, { marginTop: 12 }]}>
          Criar nova conta
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 40,
    marginTop: -60,
  },
  label: {
    color: "#555",
    marginBottom: 6,
    fontSize: 15,
  },
  input: {
    backgroundColor: "#E9E9E9",
    padding: 14,
    borderRadius: 6,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1FB9C9",
    padding: 16,
    borderRadius: 30,
    marginTop: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  link: {
    color: "#1FB9C9",
    textAlign: "center",
    marginTop: 18,
    fontSize: 15,
  },
});
