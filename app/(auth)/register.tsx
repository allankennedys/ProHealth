import { supabase } from "@/supabase"
import { router } from "expo-router"
import { useState } from "react"
import {
    Image,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

export default function Register() {
const [fullName, setFullName] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [birthDate, setBirthDate] = useState("") // YYYY-MM-DD
const [sex, setSex] = useState("")
const [height, setHeight] = useState("")
const [weight, setWeight] = useState("")
const [activityLevel, setActivityLevel] = useState("")
const [aceitouIA, setAceitouIA] = useState(true)
const [aceitouTermos, setAceitouTermos] = useState(true)
const [loading, setLoading] = useState(false)
const [errorMsg, setErrorMsg] = useState("")

const isValidNumber = (value: string) => !value || !isNaN(Number(value))
const isValidDate = (value: string) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value)

async function handleRegister() {
  setLoading(true);
  setErrorMsg("");

  if (!isValidDate(birthDate)) {
    setErrorMsg("Data de nascimento inválida (use YYYY-MM-DD)");
    setLoading(false);
    return;
  }

  if (!isValidNumber(height) || !isValidNumber(weight)) {
    setErrorMsg("Altura e peso devem ser números");
    setLoading(false);
    return;
  }

  // 1. Cria o usuário
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    setErrorMsg(authError.message);
    setLoading(false);
    return;
  }

  if (!authData.user) {
    setErrorMsg("Erro ao criar usuário.");
    setLoading(false);
    return;
  }

  // 2. FAZ LOGIN AUTOMÁTICO (garante que o usuário está ativo no banco)
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    // Se falhar (ex: email confirmation ativado), redireciona para login
    setErrorMsg("Conta criada! Verifique seu e-mail e faça login.");
    setLoading(false);
    router.replace("/login");
    return;
  }

  // 3. ATUALIZA o perfil existente (NÃO INSERE!)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      birth_date: birthDate || null,
      sex: sex || null,
      height_cm: height ? parseFloat(height) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      activity_level: activityLevel || null,
      aceitou_uso_ia: aceitouIA,
      aceitou_termos: aceitouTermos,
    })
    .eq("id", authData.user.id);

  setLoading(false);

  if (profileError) {
    console.error("Erro ao atualizar perfil:", profileError);
    setErrorMsg("Conta criada, mas erro ao salvar dados. Você pode editar seu perfil depois.");
    // Mesmo com erro, deixa entrar
  }

  router.replace("/(tabs)");
}

return ( <View style={styles.container}>
<Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />


  <Text style={styles.label}>Nome completo</Text>  
  <TextInput style={styles.input} value={fullName} onChangeText={(value: string) => setFullName(value)} placeholder="Opcional" />  

  <Text style={styles.label}>Email</Text>  
  <TextInput style={styles.input} keyboardType="email-address" value={email} onChangeText={(value: string) => setEmail(value)} />  

  <Text style={styles.label}>Senha</Text>  
  <TextInput style={styles.input} value={password} onChangeText={(value: string) => setPassword(value)} secureTextEntry />  

  <Text style={styles.label}>Data de nascimento</Text>  
  <TextInput style={styles.input} value={birthDate} onChangeText={(value: string) => setBirthDate(value)} placeholder="YYYY-MM-DD (opcional)" />  

  <Text style={styles.label}>Sexo</Text>  
  <TextInput style={styles.input} value={sex} onChangeText={(value: string) => setSex(value)} placeholder="male/female/other (opcional)" />  

  <Text style={styles.label}>Altura (cm)</Text>  
  <TextInput style={styles.input} value={height} onChangeText={(value: string) => setHeight(value)} placeholder="Opcional" keyboardType="numeric" />  

  <Text style={styles.label}>Peso (kg)</Text>  
  <TextInput style={styles.input} value={weight} onChangeText={(value: string) => setWeight(value)} placeholder="Opcional" keyboardType="numeric" />  

  <Text style={styles.label}>Nível de atividade</Text>  
  <TextInput style={styles.input} value={activityLevel} onChangeText={(value: string) => setActivityLevel(value)} placeholder="low/medium/high (opcional)" />  

  <View style={styles.switchRow}>  
    <Text>Aceitou uso de IA</Text>  
    <Switch value={aceitouIA} onValueChange={setAceitouIA} />  
  </View>  

  <View style={styles.switchRow}>  
    <Text>Aceitou termos</Text>  
    <Switch value={aceitouTermos} onValueChange={setAceitouTermos} />  
  </View>  

  {errorMsg !== "" && <Text style={{ color: "red", marginVertical: 10 }}>{errorMsg}</Text>}  

  <TouchableOpacity style={styles.button} disabled={loading} onPress={handleRegister}>  
    <Text style={styles.buttonText}>{loading ? "Registrando..." : "Registrar"}</Text>  
  </TouchableOpacity>  
</View>  


)
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "white", justifyContent: "center", paddingHorizontal: 30 },
logo: { width: 90, height: 90, alignSelf: "center", marginBottom: 40, marginTop: -60 },
label: { color: "#555", marginBottom: 6, fontSize: 15 },
input: { backgroundColor: "#E9E9E9", padding: 14, borderRadius: 6, fontSize: 16, marginBottom: 12 },
button: { backgroundColor: "#1FB9C9", padding: 16, borderRadius: 30, marginTop: 20, alignItems: "center" },
buttonText: { color: "white", fontSize: 18 },
switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
})
