import BigButton from "@/components/BigButton";
import { usePatientLogs } from "@/lib/data";
import {
  fmtDateTime, glucoseStatus, pressureStatus, STATUS_BG, STATUS_COLOR, STATUS_LABEL, type Status,
} from "@/lib/health";
import { useSession } from "@/lib/session";
import { s } from "@/lib/styles";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Linking, ScrollView, Text, View } from "react-native";

function LastReading({ title, value, unit, when, status }: { title: string; value: string; unit: string; when?: string; status?: Status }) {
  return (
    <View style={[s.card, { backgroundColor: status ? STATUS_BG[status] : "#fff", borderLeftWidth: 10, borderLeftColor: status ? STATUS_COLOR[status] : "#ddd" }]}>
      <Text style={{ fontSize: 18, color: "#444", fontWeight: "700" }}>{title}</Text>
      <Text style={{ fontSize: 36, fontWeight: "800", color: "#222" }}>
        {value} <Text style={{ fontSize: 18, fontWeight: "600" }}>{value === "--" ? "" : unit}</Text>
      </Text>
      <Text style={{ fontSize: 16, color: status ? STATUS_COLOR[status] : "#888", fontWeight: "700" }}>
        {status ? STATUS_LABEL[status] : "Ainda sem registro"}
        {when ? <Text style={{ color: "#666", fontWeight: "400" }}>  •  {fmtDateTime(when)}</Text> : null}
      </Text>
    </View>
  );
}

export default function IdosoHome() {
  const router = useRouter();
  const { profile } = useSession();
  const { glucose, pressure, reload } = usePatientLogs(profile?.id, 7);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const g = glucose[0];
  const p = pressure[0];
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient colors={["#1EBCCF", "#17A7C5"]} style={s.header}>
        <Text style={[s.headerTitle, { fontSize: 32 }]}>Olá, {firstName}!</Text>
        <Text style={[s.headerSub, { fontSize: 18 }]}>
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </Text>
      </LinearGradient>

      <View style={s.content}>
        <BigButton icon="water" label="Medir Glicemia" sublabel="Açúcar no sangue" bg="#D63031" onPress={() => router.push("/glicemia")} />
        <BigButton icon="heart-pulse" label="Medir Pressão" sublabel="Pressão arterial" bg="#E8590C" onPress={() => router.push("/pressao")} />
        <BigButton icon="pill" label="Meus Remédios" sublabel="Horários de hoje" bg="#2E7DD7" onPress={() => router.push("/(idoso)/remedios")} />

        <Text style={[s.h2, { fontSize: 24, marginTop: 8 }]}>Últimos registros</Text>
        <LastReading title="Glicemia" value={g ? String(g.glucose_mgdl) : "--"} unit="mg/dL" when={g?.measured_at}
          status={g ? glucoseStatus(g.glucose_mgdl, profile!) : undefined} />
        <LastReading title="Pressão" value={p ? `${p.systolic}/${p.diastolic}` : "--"} unit="mmHg" when={p?.measured_at}
          status={p ? pressureStatus(p.systolic, p.diastolic, profile!) : undefined} />

        {profile?.emergency_phone ? (
          <BigButton icon="phone" size="md" label={`Ligar para ${profile.emergency_name || "familiar"}`} bg="#444"
            onPress={() => Linking.openURL(`tel:${profile.emergency_phone!.replace(/[^\d+]/g, "")}`)} />
        ) : null}
      </View>
    </ScrollView>
  );
}
