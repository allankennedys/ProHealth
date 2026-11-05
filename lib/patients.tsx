import { supabase } from "@/supabase";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Profile } from "./health";
import { useSession } from "./session";

type Ctx = {
  patients: Profile[];
  patient: Profile | null;
  selectPatient: (id: string) => void;
  reload: () => Promise<void>;
  loading: boolean;
};
const PatientsContext = createContext<Ctx>({ patients: [], patient: null, selectPatient: () => {}, reload: async () => {}, loading: true });
export const usePatients = () => useContext(PatientsContext);

/** Pacientes vinculados ao familiar logado + paciente selecionado. */
export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useSession();
  const [patients, setPatients] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!profile) return;
    const { data: links } = await supabase.from("care_links").select("idoso_id").eq("familiar_id", profile.id);
    const ids = (links ?? []).map((l) => l.idoso_id);
    if (ids.length === 0) { setPatients([]); setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").in("id", ids).order("full_name");
    setPatients((data as Profile[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { reload(); }, [reload]);

  const patient = patients.find((p) => p.id === selected) ?? patients[0] ?? null;
  return (
    <PatientsContext.Provider value={{ patients, patient, selectPatient: setSelected, reload, loading }}>
      {children}
    </PatientsContext.Provider>
  );
}
