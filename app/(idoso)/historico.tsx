import TrendChart from "@/components/TrendChart";
import { usePatientLogs } from "@/lib/data";
import {
  CONTEXT_LABEL, fmtDateTime, glucoseStatus, pressureStatus, STATUS_BG, STATUS_COLOR, STATUS_LABEL, type Status,
} from "@/lib/health";
import { useSession } from "@/lib/session";
import { s } from "@/lib/styles";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, Pressable } from "react-native";

function Row({ title, detail, when, status }: { title: string; detail: string; when: string; status: Status }) {
  return (
    <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: STATUS_BG[status], borderLeftWidth: 10, borderLeftColor: STATUS_COLOR[status] }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 26, fontWeight: "800" }}>{title}</Text>
        <Text style={{ fontSize: 16, color: "#555" }}>{detail}</Text>
        <Text style={{ fontSize: 14, color: "#777" }}>{fmtDateTime(when)}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: "800", color: STATUS_COLOR[status] }}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export default function Historico() {
  const { profile } = useSession();
  const [tab, setTab] = useState<"glicemia" | "pressao">("glicemia");
  const { glucose, pressure, loading, reload } = usePatientLogs(profile?.id, 30);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const chrono = <T,>(a: T[]) => [...a].reverse();

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingTop: 56 }]}>
      <Text style={{ fontSize: 30, fontWeight: "800" }}>Meu histórico</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {(["glicemia", "pressao"] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[s.chip, { flex: 1, alignItems: "center", paddingVertical: 16 }, tab === t && s.chipActive]}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: tab === t ? "#fff" : "#333" }}>{t === "glicemia" ? "Glicemia" : "Pressão"}</Text>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color="#1FB9C9" />}

      {!loading && tab === "glicemia" && (
        <>
          <View style={s.card}>
            <Text style={s.muted}>Últimos 30 dias — faixa verde = normal</Text>
            <TrendChart series={[{ values: chrono(glucose).map((x) => x.glucose_mgdl), color: "#D63031" }]}
              min={profile!.glucose_min} max={profile!.glucose_max} />
          </View>
          {glucose.length === 0 && <Text style={{ fontSize: 18, color: "#666" }}>Nenhum registro ainda.</Text>}
          {glucose.map((x) => (
            <Row key={x.id} title={`${x.glucose_mgdl} mg/dL`} detail={x.context ? CONTEXT_LABEL[x.context] : ""} when={x.measured_at}
              status={glucoseStatus(x.glucose_mgdl, profile!)} />
          ))}
        </>
      )}

      {!loading && tab === "pressao" && (
        <>
          <View style={s.card}>
            <Text style={s.muted}>Vermelho = sistólica • Azul = diastólica</Text>
            <TrendChart series={[
              { values: chrono(pressure).map((x) => x.systolic), color: "#D63031" },
              { values: chrono(pressure).map((x) => x.diastolic), color: "#1FB9C9" },
            ]} min={profile!.dia_min} max={profile!.sys_max} />
          </View>
          {pressure.length === 0 && <Text style={{ fontSize: 18, color: "#666" }}>Nenhum registro ainda.</Text>}
          {pressure.map((x) => (
            <Row key={x.id} title={`${x.systolic}/${x.diastolic} mmHg`} detail="" when={x.measured_at}
              status={pressureStatus(x.systolic, x.diastolic, profile!)} />
          ))}
        </>
      )}
    </ScrollView>
  );
}
