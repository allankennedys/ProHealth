import PatientPicker from "@/components/PatientPicker";
import TrendChart from "@/components/TrendChart";
import { usePatientLogs } from "@/lib/data";
import { glucoseStatus, pressureStatus } from "@/lib/health";
import { usePatients } from "@/lib/patients";
import { buildReportHtml, exportReport } from "@/lib/report";
import { s } from "@/lib/styles";
import { notify } from "@/lib/ui";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);

export default function Relatorio() {
  const { patient } = usePatients();
  const [days, setDays] = useState(30);
  const { glucose, pressure, loading } = usePatientLogs(patient?.id, days);
  const [busy, setBusy] = useState(false);

  async function exportPdf() {
    if (!patient) return;
    setBusy(true);
    try {
      await exportReport(buildReportHtml(patient, glucose, pressure, days));
    } catch (e: any) {
      notify("Não foi possível gerar o PDF", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  const chrono = <T,>(a: T[]) => [...a].reverse();
  const gOut = patient ? glucose.filter((x) => glucoseStatus(x.glucose_mgdl, patient) !== "ok").length : 0;
  const bOut = patient ? pressure.filter((x) => pressureStatus(x.systolic, x.diastolic, patient) !== "ok").length : 0;

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingTop: 56 }]}>
      <Text style={{ fontSize: 28, fontWeight: "800" }}>Relatório</Text>
      <PatientPicker showLink={!patient} />

      {patient && (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[7, 30, 90].map((d) => (
              <Pressable key={d} onPress={() => setDays(d)} style={[s.chip, days === d && s.chipActive]}>
                <Text style={{ color: days === d ? "#fff" : "#333", fontWeight: "700" }}>{d} dias</Text>
              </Pressable>
            ))}
          </View>

          {loading ? <ActivityIndicator size="large" color="#1FB9C9" /> : (
            <>
              <View style={s.card}>
                <Text style={s.h2}>Glicemia</Text>
                <Text style={s.muted}>{glucose.length} medições • média {avg(glucose.map((x) => x.glucose_mgdl)) ?? "—"} mg/dL • {gOut} fora da faixa</Text>
                <TrendChart series={[{ values: chrono(glucose).map((x) => x.glucose_mgdl), color: "#D63031" }]} min={patient.glucose_min} max={patient.glucose_max} />
              </View>
              <View style={s.card}>
                <Text style={s.h2}>Pressão arterial</Text>
                <Text style={s.muted}>{pressure.length} medições • média {avg(pressure.map((x) => x.systolic)) ?? "—"}/{avg(pressure.map((x) => x.diastolic)) ?? "—"} mmHg • {bOut} fora da faixa</Text>
                <TrendChart series={[
                  { values: chrono(pressure).map((x) => x.systolic), color: "#D63031" },
                  { values: chrono(pressure).map((x) => x.diastolic), color: "#1FB9C9" },
                ]} min={patient.dia_min} max={patient.sys_max} />
              </View>
              <Pressable style={[s.button, { paddingVertical: 18 }]} onPress={exportPdf} disabled={busy}>
                <Text style={s.buttonText}>{busy ? "Gerando..." : "Exportar PDF para o médico"}</Text>
              </Pressable>
              <Text style={s.muted}>No computador abre a janela de impressão — escolha "Salvar como PDF".</Text>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}
