import PatientPicker from "@/components/PatientPicker";
import TrendChart from "@/components/TrendChart";
import { usePatientLogs } from "@/lib/data";
import {
  ageFrom, fmtDateTime, glucoseStatus, pressureStatus, STATUS_BG, STATUS_COLOR, STATUS_LABEL, type Status,
} from "@/lib/health";
import { usePatients } from "@/lib/patients";
import { s } from "@/lib/styles";
import { supabase } from "@/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";

type Alerta = { id: string; tipo: string; mensagem: string; lido: boolean; created_at: string };

function Stat({ title, value, unit, when, status }: { title: string; value: string; unit: string; when?: string; status?: Status }) {
  return (
    <View style={[s.card, { flex: 1, minWidth: 150, backgroundColor: status ? STATUS_BG[status] : "#fff" }]}>
      <Text style={s.muted}>{title}</Text>
      <Text style={{ fontSize: 30, fontWeight: "800" }}>{value}<Text style={{ fontSize: 14 }}> {value === "--" ? "" : unit}</Text></Text>
      <Text style={{ fontWeight: "700", color: status ? STATUS_COLOR[status] : "#888" }}>{status ? STATUS_LABEL[status] : "Sem registro"}</Text>
      {when && <Text style={s.muted}>{fmtDateTime(when)}</Text>}
    </View>
  );
}

export default function Painel() {
  const { patient, loading: loadingPatients } = usePatients();
  const { glucose, pressure, reload } = usePatientLogs(patient?.id, 14);
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const loadAlertas = useCallback(async () => {
    if (!patient) return setAlertas([]);
    const { data } = await supabase.from("alertas").select("id, tipo, mensagem, lido, created_at")
      .eq("paciente_id", patient.id).order("created_at", { ascending: false }).limit(15);
    setAlertas((data as Alerta[]) ?? []);
  }, [patient]);

  useFocusEffect(useCallback(() => { reload(); loadAlertas(); }, [reload, loadAlertas]));

  useEffect(() => {
    if (!patient) return;
    const ch = supabase.channel(`alertas:${patient.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alertas", filter: `paciente_id=eq.${patient.id}` }, loadAlertas)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [patient, loadAlertas]);

  async function markRead() {
    if (!patient) return;
    await supabase.from("alertas").update({ lido: true }).eq("paciente_id", patient.id).eq("lido", false);
    loadAlertas();
  }

  if (loadingPatients) return <View style={[s.screen, { justifyContent: "center" }]}><ActivityIndicator size="large" color="#1FB9C9" /></View>;

  const g = glucose[0], p = pressure[0];
  const chrono = <T,>(a: T[]) => [...a].reverse();
  const unread = alertas.filter((a) => !a.lido).length;
  const age = ageFrom(patient?.birth_date ?? null);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient colors={["#1EBCCF", "#17A7C5"]} style={s.header}>
        <Text style={s.headerTitle}>{patient ? patient.full_name ?? "Paciente" : "Painel"}</Text>
        <Text style={s.headerSub}>{patient ? `${age !== null ? `${age} anos • ` : ""}atualizado em tempo real` : "Nenhum paciente vinculado"}</Text>
      </LinearGradient>

      <View style={s.content}>
        <PatientPicker />

        {patient && (
          <>
            {unread > 0 && (
              <View style={[s.card, { backgroundColor: "#FDE8E8" }]}>
                <View style={s.rowBetween}>
                  <Text style={[s.h2, { color: "#D63031" }]}>{unread} alerta{unread > 1 ? "s" : ""} novo{unread > 1 ? "s" : ""}</Text>
                  <Pressable onPress={markRead}><Text style={{ color: "#17A7C5", fontWeight: "700" }}>Marcar como lidos</Text></Pressable>
                </View>
              </View>
            )}

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <Stat title="Última glicemia" value={g ? String(g.glucose_mgdl) : "--"} unit="mg/dL" when={g?.measured_at}
                status={g ? glucoseStatus(g.glucose_mgdl, patient) : undefined} />
              <Stat title="Última pressão" value={p ? `${p.systolic}/${p.diastolic}` : "--"} unit="mmHg" when={p?.measured_at}
                status={p ? pressureStatus(p.systolic, p.diastolic, patient) : undefined} />
            </View>

            <View style={s.card}>
              <Text style={s.h2}>Glicemia — 14 dias</Text>
              <TrendChart series={[{ values: chrono(glucose).map((x) => x.glucose_mgdl), color: "#D63031" }]} min={patient.glucose_min} max={patient.glucose_max} />
            </View>
            <View style={s.card}>
              <Text style={s.h2}>Pressão — 14 dias</Text>
              <Text style={s.muted}>Vermelho: sistólica • Azul: diastólica</Text>
              <TrendChart series={[
                { values: chrono(pressure).map((x) => x.systolic), color: "#D63031" },
                { values: chrono(pressure).map((x) => x.diastolic), color: "#1FB9C9" },
              ]} min={patient.dia_min} max={patient.sys_max} />
            </View>

            <View style={s.card}>
              <Text style={s.h2}>Alertas recentes</Text>
              {alertas.length === 0 && <Text style={s.muted}>Nenhum alerta. Tudo certo por aqui 👍</Text>}
              {alertas.map((a) => (
                <View key={a.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
                  <Text style={{ fontWeight: a.lido ? "400" : "800", fontSize: 15 }}>{a.mensagem}</Text>
                  <Text style={s.muted}>{fmtDateTime(a.created_at)}</Text>
                </View>
              ))}
            </View>

            {patient.emergency_phone ? (
              <Pressable style={s.buttonGhost} onPress={() => Linking.openURL(`tel:${patient.emergency_phone!.replace(/[^\d+]/g, "")}`)}>
                <Text style={s.buttonGhostText}>Ligar: {patient.emergency_name ?? patient.emergency_phone}</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}
