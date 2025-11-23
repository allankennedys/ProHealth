// app/data-modal.tsx (fora de (tabs)!)
import { supabase } from "@/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function DataModal() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const router = useRouter();

  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) {
      Alert.alert("Erro", "O campo principal não pode estar vazio.");
      return;
    }

    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      setLoading(false);
      return;
    }

    let error = null;

    try {
      switch (tipo) {
        case "atividade": {
          const duration = value2 ? parseInt(value2, 10) : null;
          const calories = value2 ? parseFloat(value2) : null;

          if (duration !== null && isNaN(duration)) {
            throw new Error("Duração inválida");
          }
          if (calories !== null && isNaN(calories)) {
            throw new Error("Calorias inválidas");
          }

          ({ error } = await supabase.from("activity_logs").insert([
            {
              user_id: user.id,
              activity_type: value || "Outro",
              duration_minutes: duration,
              calories_burned: calories,
            },
          ]));
          break;
        }

        case "sono": {
          const hours = parseFloat(value);
          const quality = value2 ? parseInt(value2, 10) : 5;

          if (isNaN(hours)) throw new Error("Horas de sono inválidas");
          if (isNaN(quality)) throw new Error("Qualidade do sono inválida");

          ({ error } = await supabase.from("sleep_logs").insert([
            {
              user_id: user.id,
              date: new Date().toISOString().split("T")[0],
              sleep_hours: hours,
              sleep_quality: quality,
            },
          ]));
          break;
        }

        case "pressao": {
          const parts = value.split("/");
          if (parts.length !== 2) throw new Error("Formato inválido. Use: 120/80");
          const systolic = parseFloat(parts[0]);
          const diastolic = parseFloat(parts[1]);
          if (isNaN(systolic) || isNaN(diastolic)) {
            throw new Error("Valores de pressão inválidos");
          }

          ({ error } = await supabase.from("blood_pressure_logs").insert([
            {
              user_id: user.id,
              systolic,
              diastolic,
            },
          ]));
          break;
        }

        case "glicemia": {
          const glucose = parseFloat(value);
          if (isNaN(glucose)) throw new Error("Glicemia inválida");
          ({ error } = await supabase.from("glucose_logs").insert([
            {
              user_id: user.id,
              glucose_mgdl: glucose,
            },
          ]));
          break;
        }

        case "batimentos": {
          const steps = parseInt(value, 10);
          if (isNaN(steps)) throw new Error("Passos inválidos");
          ({ error } = await supabase.from("step_logs").insert([
            {
              user_id: user.id,
              steps,
            },
          ]));
          break;
        }

        case "agua": {
          const amount = parseInt(value, 10);
          if (isNaN(amount)) throw new Error("Quantidade de água inválida");
          ({ error } = await supabase.from("water_intake_logs").insert([
            {
              user_id: user.id,
              amount_ml: amount,
            },
          ]));
          break;
        }

        default:
          throw new Error("Tipo desconhecido");
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Erro", err.message || "Dados inválidos.");
      return;
    }

    setLoading(false);

    if (error) {
      console.error("Erro do Supabase:", error);
      Alert.alert("Erro", "Não foi possível salvar: " + (error.message || "tente novamente"));
      return;
    }

    router.back();
  };

  const getTitle = () => {
    switch (tipo) {
      case "atividade": return "Registrar Atividade";
      case "sono": return "Registrar Sono";
      case "pressao": return "Registrar Pressão";
      case "glicemia": return "Registrar Glicemia";
      case "batimentos": return "Registrar Passos";
      case "agua": return "Registrar Água";
      default: return "Registrar Dado";
    }
  };

  const getFields = () => {
    switch (tipo) {
      case "atividade":
        return (
          <>
            <Text style={styles.label}>Tipo de atividade</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="Caminhada, Corrida..."
            />
            <Text style={styles.label}>Duração (minutos)</Text>
            <TextInput
              style={styles.input}
              value={value2}
              onChangeText={setValue2}
              keyboardType="numeric"
              placeholder="Ex: 30"
            />
          </>
        );

      case "sono":
        return (
          <>
            <Text style={styles.label}>Horas dormidas</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="Ex: 7.5"
            />
            <Text style={styles.label}>Qualidade do sono (1-10)</Text>
            <TextInput
              style={styles.input}
              value={value2}
              onChangeText={setValue2}
              keyboardType="numeric"
              placeholder="Ex: 8"
            />
          </>
        );

      case "pressao":
        return (
          <>
            <Text style={styles.label}>Pressão Arterial (sístólica/diastólica)</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="Ex: 120/80"
            />
          </>
        );

      case "glicemia":
        return (
          <>
            <Text style={styles.label}>Glicemia (mg/dL)</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="Ex: 95"
            />
          </>
        );

      case "batimentos":
        return (
          <>
            <Text style={styles.label}>Passos</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="Ex: 5000"
            />
          </>
        );

      case "agua":
        return (
          <>
            <Text style={styles.label}>Água ingerida (mL)</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="Ex: 2000"
            />
          </>
        );

      default:
        return <Text>Formulário não disponível.</Text>;
    }
  };

  return (
    <ScrollView style={styles.modalContainer}>
      <Text style={styles.title}>{getTitle()}</Text>
      {getFields()}

      <TouchableOpacity
        style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
        disabled={loading}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>
          {loading ? "Salvando..." : "Salvar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ccc" }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.buttonText, { color: "#333" }]}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    marginTop: 16,
    fontSize: 15,
    color: "#555",
  },
  input: {
    backgroundColor: "#E9E9E9",
    padding: 14,
    borderRadius: 6,
    fontSize: 16,
    marginTop: 6,
  },
  button: {
    backgroundColor: "#1FB9C9",
    padding: 16,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});