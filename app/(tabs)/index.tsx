// app/(tabs)/index.tsx
import { supabase } from "@/supabase";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";


export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    water: 0,
    bloodPressure: { systolic: 0, diastolic: 0 },
    glucose: 0,
    steps: 0,
    sleep: "00h 00min",
    userName: ""
  });
const loadData = async () => {
setLoading(true);
setError(null);


const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

// ✅ Obter usuário autenticado
const { data: authData, error: userError } = await supabase.auth.getUser();
const user = authData?.user;

if (userError || !user) {
  setError("Usuário não autenticado");
  setLoading(false);
  return;
}
const { data: userData, error: userErrorData } = await supabase
  .from("profiles")
  .select("full_name")
  .eq("id", user.id)
  .single();

const userName = userData?.full_name || "Usuário";

try {
  // Água
  const { data: waterResult, error: waterError } = await supabase
    .from("water_intake_logs")
    .select("amount_ml")
    .eq("user_id", user.id)
    .gte("logged_at", today)
    .lte("logged_at", `${today}T23:59:59.999Z`);

  if (waterError) throw waterError;

  const totalWaterMl = (waterResult || []).reduce(
    (sum: number, item: any) => sum + (item.amount_ml || 0),
    0
  );
  const waterLiters = parseFloat((totalWaterMl / 1000).toFixed(1));

  // Pressão
  const { data: bpResult, error: bpError } = await supabase
    .from("blood_pressure_logs")
    .select("systolic, diastolic")
    .eq("user_id", user.id)
    .gte("measured_at", today)
    .lte("measured_at", `${today}T23:59:59.999Z`)
    .order("measured_at", { ascending: false })
    .limit(1);

  if (bpError) throw bpError;

  const bp = bpResult?.[0] || { systolic: 0, diastolic: 0 };

  // Glicemia
  const { data: glucoseResult, error: glucoseError } = await supabase
    .from("glucose_logs")
    .select("glucose_mgdl")
    .eq("user_id", user.id)
    .gte("measured_at", today)
    .lte("measured_at", `${today}T23:59:59.999Z`);

  if (glucoseError) throw glucoseError;

  const avgGlucose =
    glucoseResult && glucoseResult.length > 0
      ? parseFloat(
          (
            glucoseResult.reduce(
              (sum: number, item: any) => sum + (item.glucose_mgdl || 0),
              0
            ) / glucoseResult.length
          ).toFixed(1)
        )
      : 0;

  // Passos
  const { data: stepsResult, error: stepsError } = await supabase
    .from("step_logs")
    .select("steps")
    .eq("user_id", user.id)
    .gte("logged_at", today)
    .lte("logged_at", `${today}T23:59:59.999Z`);

  if (stepsError) throw stepsError;

  const totalSteps = (stepsResult || []).reduce(
    (sum: number, item: any) => sum + (item.steps || 0),
    0
  );

  // Sono
  const { data: sleepResult, error: sleepError } = await supabase
    .from("sleep_logs")
    .select("sleep_hours")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1);

  if (sleepError) throw sleepError;

  const sleepHours = sleepResult?.[0]?.sleep_hours || 0;
  const hours = Math.floor(sleepHours);
  const minutes = Math.round((sleepHours - hours) * 60);
  const sleepFormatted = `${String(hours).padStart(2, "0")}h ${String(
    minutes
  ).padStart(2, "0")}min`;

  setData({
    water: waterLiters,
    bloodPressure: bp,
    glucose: avgGlucose,
    steps: totalSteps,
    sleep: sleepFormatted,
    userName: `, ${userName}`,
  });
} catch (err: any) {
  console.error("Erro ao carregar dados:", err);
  setError("Não foi possível carregar seus dados. Tente novamente.");
} finally {
  setLoading(false);
}


};
const onRefresh = async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
};

useEffect(() => {


loadData();
}, []);


  // Formata a data atual
  const formatDate = () => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day} ${month}, ${year}`;
  };


  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}
      refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
      >
        {/* Header */}
        <LinearGradient colors={["#1EBCCF", "#17A7C5"]} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Olá{data.userName}!</Text>
              <Text style={styles.date}>{formatDate()}</Text>
            </View>
            <MaterialCommunityIcons name="bell-outline" size={28} color="white" />
          </View>
        </LinearGradient>

        {loading && (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <ActivityIndicator size="large" color="#1FB9C9" />
          </View>
        )}

        {error && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <>
            {/* Card de progresso */}
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                  <MaterialCommunityIcons name="notebook-heart" size={32} color="#1EBCCF" />
                <Text style={styles.progressText}>
                  Resumo dos seus dados de hoje:
                </Text>
              </View>

              <View style={styles.row}>
                <View style={styles.smallCard}>
                  <MaterialCommunityIcons name="shoe-print" size={32} color="#1EBCCF" />
                  <Text style={styles.bigValue}>
                    {Math.round(data.steps / 60) || "--"}
                  </Text>
                  <Text style={styles.smallLabel}>min</Text>
                </View>

                <View style={styles.smallCard}>
                  <FontAwesome5 name="bed" size={28} color="#1EBCCF" />
                  <Text style={styles.bigValue}>
                    {data.sleep.split("h")[0] || "--"}
                  </Text>
                  <Text style={styles.smallLabel}>{data.sleep}</Text>
                </View>
              </View>
            </View>

            {/* Água */}
            <View style={[styles.largeCard, { backgroundColor: "#E7F7FF" }]}>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <MaterialCommunityIcons name="water" size={30} color="#008cffff" />
                  <Text style={styles.cardTitle}>Consumo de Água</Text>
                </View>
                <Text style={styles.cardValue}>
                  {data.water} <Text style={styles.unit}>Litros</Text>
                </Text>
              </View>
            </View>

            {/* Passos */}
            <View style={[styles.largeCard, { backgroundColor: "#f0ffe7ff" }]}>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <MaterialCommunityIcons name="shoe-print" size={30} color="green" />
                  <Text style={styles.cardTitle}>Passos</Text>
                </View>
                <Text style={styles.cardValue}>
                  {data.steps.toLocaleString()}{" "}
                  <Text style={styles.unit}>passos</Text>
                </Text>
              </View>
            </View>

            {/* Pressão */}
            <View style={[styles.largeCard, { backgroundColor: "#E7F7FF" }]}>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <MaterialCommunityIcons name="heart-pulse" size={30} color="#FF4D4D" />
                  <Text style={styles.cardTitle}>Pressão</Text>
                </View>
                <Text style={styles.cardValue}>
                  {data.bloodPressure.systolic === 0 && data.bloodPressure.diastolic === 0
                    ? "--"
                    : `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}`}
                  <Text style={styles.unit}> mmHg</Text>
                </Text>
              </View>
            </View>

            {/* Glicemia */}
            <View style={[styles.largeCard, { backgroundColor: "#FFE7E7" }]}>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <MaterialCommunityIcons name="water" size={30} color="#D63031" />
                  <Text style={styles.cardTitle}>Glicemia</Text>
                </View>
                <Text style={styles.cardValue}>
                  {data.glucose} <Text style={styles.unit}>mg/dl</Text>
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  date: {
    marginTop: 4,
    fontSize: 14,
    color: "#E7FDFE",
  },
  progressCard: {
    backgroundColor: "#fff",
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap:15,
    left: 15
  },
  circle: {
    width: 55,
    height: 55,
    borderRadius: 55,
    backgroundColor: "#E5F8FA",
    marginRight: 15,
  },
  progressText: {
    flex: 1,
    fontSize: 14,
    color: "#444",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  smallCard: {
    width: "48%",
    backgroundColor: "#F6F8FC",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  bigValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginTop: 6,
  },
  smallLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: -4,
  },
  largeCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  cardValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
  },
  unit: {
    fontSize: 14,
    color: "#444",
  },
});