import { supabase } from "@/supabase"
import DateTimePicker from "@react-native-community/datetimepicker"
import { router } from "expo-router"
import { useState } from "react"
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"

export default function Register() {


  
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [birthDate, setBirthDate] = useState("") // YYYY-MM-DD
const [showDatePicker, setShowDatePicker] = useState(false);
const [tempDate, setTempDate] = useState(new Date());

  const [sex, setSex] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [activityLevel, setActivityLevel] = useState("")

  const [aceitouIA, setAceitouIA] = useState(true)
  const [aceitouTermos, setAceitouTermos] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const isValidNumber = (value: string) => !value || !isNaN(Number(value))

  async function handleRegister() {
    setLoading(true)
    setErrorMsg("")

    // validação básica já que a data agora vem 100% formatada
    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setErrorMsg("Data inválida")
      setLoading(false)
      return
    }

    if (!isValidNumber(height) || !isValidNumber(weight)) {
      setErrorMsg("Altura e peso devem ser números")
      setLoading(false)
      return
    }

    // 1. Cria o usuário
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setErrorMsg(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setErrorMsg("Erro ao criar usuário.")
      setLoading(false)
      return
    }

    // login automático
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setErrorMsg("Conta criada! Verifique seu e-mail e faça login.")
      setLoading(false)
      router.replace("/login")
      return
    }

    // atualiza perfil
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
      .eq("id", authData.user.id)

    setLoading(false)

    if (profileError) {
      console.error("Erro ao atualizar perfil:", profileError)
      setErrorMsg("Conta criada, mas erro ao salvar dados.")
    }

    router.replace("/(tabs)")
  }

  return (
<ScrollView
  contentContainerStyle={{
    marginTop:60,
    padding: 40,
    gap: 20,
  }}
>
      {/* -------- Nome -------- */}
      <Text style={styles.label}>Nome completo</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Opcional" />

      {/* -------- Email -------- */}
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} />

      {/* -------- Senha -------- */}
      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      {/* -------- Data -------- */}
{/* -------- Data de nascimento -------- */}
{/* -------- Data de nascimento -------- */}
<Text style={styles.label}>Data de nascimento</Text>

<TouchableOpacity
  onPress={() => {
    const start = birthDate ? new Date(birthDate) : new Date(2000, 0, 1)
    setTempDate(start)
    setShowDatePicker(true)
  }}
>
  <View style={[styles.input, { justifyContent: "center" }]}>
    <Text style={{ color: birthDate ? "#000" : "#777" }}>
      {birthDate || "Selecione uma data"}
    </Text>
  </View>
</TouchableOpacity>

{/* -------- ANDROID -------- */}
{showDatePicker && Platform.OS === "android" && (
  <DateTimePicker
    mode="date"
    value={birthDate ? new Date(birthDate) : new Date(2000, 0, 1)}
    display="calendar"
    onChange={(event, date) => {
      if (event.type === "dismissed") {
        setShowDatePicker(false)
        return
      }
      if (date) {
        const yyyy = date.getFullYear()
        const mm = String(date.getMonth() + 1).padStart(2, "0")
        const dd = String(date.getDate()).padStart(2, "0")
        setBirthDate(`${yyyy}-${mm}-${dd}`)
      }
      setShowDatePicker(false)
    }}
  />
)}

{/* -------- iOS -------- */}
<Modal
  visible={showDatePicker && Platform.OS === "ios"}
  transparent
  animationType="fade"
>
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: 20,
    }}
  >
    <View
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 12,
        width: "85%",
      }}
    >
      <DateTimePicker
        mode="date"
        display="spinner"
        value={tempDate}
        onChange={(event, date) => {
          // iOS SEMPRE chama onChange duas vezes, por isso só pego se houver date
          if (date) {
            setTempDate(date)
          }
        }}
        themeVariant="light" // evita picker branco no modo dark
      />

      <TouchableOpacity
        onPress={() => {
          const yyyy = tempDate.getFullYear()
          const mm = String(tempDate.getMonth() + 1).padStart(2, "0")
          const dd = String(tempDate.getDate()).padStart(2, "0")
          setBirthDate(`${yyyy}-${mm}-${dd}`)
          setShowDatePicker(false)
        }}
        style={{
          backgroundColor: "#1FB9C9",
          padding: 12,
          borderRadius: 8,
          marginTop: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>




      {/* -------- Sexo (chips) -------- */}
      <Text style={styles.label}>Sexo</Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        {["Masculino", "Feminino"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setSex(item)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 6,
              backgroundColor: sex === item ? "#1FB9C9" : "#E9E9E9",
            }}
          >
            <Text style={{ color: sex === item ? "white" : "#333" }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* -------- Altura -------- */}
      <Text style={styles.label}>Altura (cm)</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        placeholder="Opcional"
      />

      {/* -------- Peso -------- */}
      <Text style={styles.label}>Peso (kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholder="Opcional"
      />

      {/* -------- Nível de atividade (chips) -------- */}
      <Text style={styles.label}>Nível de atividade</Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Sedentário", value: "Sedentário" },
          { label: "Leve", value: "Leve" },
          { label: "Moderado", value: "Moderado" },
                    { label: "Intenso", value: "Intenso" },

        ].map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            onPress={() => setActivityLevel(value)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 6,
              backgroundColor: activityLevel === value ? "#1FB9C9" : "#E9E9E9",
            }}
          >
            <Text style={{ color: activityLevel === value ? "white" : "#333" }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* -------- Switches -------- */}
      <View style={styles.switchRow}>
        <Text>Aceitou uso de IA</Text>
        <Switch value={aceitouIA} onValueChange={setAceitouIA} />
      </View>

      <View style={styles.switchRow}>
        <Text>Aceitou termos</Text>
        <Switch value={aceitouTermos} onValueChange={setAceitouTermos} />
      </View>

      {/* -------- Erros -------- */}
      {errorMsg !== "" && (
        <Text style={{ color: "red", marginVertical: 10 }}>{errorMsg}</Text>
      )}

      {/* -------- Botão -------- */}
      <TouchableOpacity style={styles.button} disabled={loading} onPress={handleRegister}>
        <Text style={styles.buttonText}>
          {loading ? "Registrando..." : "Registrar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
