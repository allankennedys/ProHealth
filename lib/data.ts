import { supabase } from "@/supabase";
import { useCallback, useEffect, useState } from "react";
import type { GlucoseLog, PressureLog } from "./health";

/** Medições dos últimos `days` dias de um paciente (o próprio idoso ou, para o familiar, um vinculado). */
export function usePatientLogs(patientId: string | undefined, days: number) {
  const [glucose, setGlucose] = useState<GlucoseLog[]>([]);
  const [pressure, setPressure] = useState<PressureLog[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!patientId) { setGlucose([]); setPressure([]); setLoading(false); return; }
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const [g, p] = await Promise.all([
      supabase.from("glucose_logs").select("id, glucose_mgdl, context, measured_at")
        .eq("user_id", patientId).gte("measured_at", since).order("measured_at", { ascending: false }),
      supabase.from("blood_pressure_logs").select("id, systolic, diastolic, measured_at")
        .eq("user_id", patientId).gte("measured_at", since).order("measured_at", { ascending: false }),
    ]);
    setGlucose((g.data as GlucoseLog[]) ?? []);
    setPressure((p.data as PressureLog[]) ?? []);
    setLoading(false);
  }, [patientId, days]);

  useEffect(() => {
    setLoading(true);
    reload();
    if (!patientId) return;
    // tempo real: novas medições aparecem sem recarregar
    const ch = supabase.channel(`logs:${patientId}:${days}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "glucose_logs", filter: `user_id=eq.${patientId}` }, reload)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "blood_pressure_logs", filter: `user_id=eq.${patientId}` }, reload)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [reload, patientId, days]);

  return { glucose, pressure, loading, reload };
}
