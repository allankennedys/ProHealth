export type Role = "idoso" | "familiar";

export type Profile = {
  id: string;
  full_name: string | null;
  role: Role;
  birth_date: string | null;
  phone: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  emergency_email: string | null;
  glucose_min: number;
  glucose_max: number;
  sys_min: number;
  sys_max: number;
  dia_min: number;
  dia_max: number;
  horarios_glicemia: string[];
  horarios_pressao: string[];
  codigo_vinculo: string | null;
};

export type GlucoseContext = "jejum" | "pos_refeicao" | "antes_dormir";

export const CONTEXT_LABEL: Record<GlucoseContext, string> = {
  jejum: "Em jejum",
  pos_refeicao: "Após refeição",
  antes_dormir: "Antes de dormir",
};

export type GlucoseLog = { id: string; glucose_mgdl: number; context: GlucoseContext | null; measured_at: string };
export type PressureLog = { id: string; systolic: number; diastolic: number; measured_at: string };

export type Status = "ok" | "atencao" | "alerta";

export const STATUS_COLOR: Record<Status, string> = {
  ok: "#2E9E5B",
  atencao: "#E0A100",
  alerta: "#D63031",
};
export const STATUS_BG: Record<Status, string> = {
  ok: "#E6F6EC",
  atencao: "#FFF6D6",
  alerta: "#FDE8E8",
};
export const STATUS_LABEL: Record<Status, string> = {
  ok: "Normal",
  atencao: "Atenção",
  alerta: "Fora da faixa",
};

type Limits = Pick<Profile, "glucose_min" | "glucose_max" | "sys_min" | "sys_max" | "dia_min" | "dia_max">;

export const DEFAULT_LIMITS: Limits = {
  glucose_min: 70, glucose_max: 140, sys_min: 90, sys_max: 140, dia_min: 60, dia_max: 90,
};

// verde: dentro da faixa | amarelo: até 10% além do limite | vermelho: mais que isso
function classify(value: number, min: number, max: number): Status {
  if (value >= min && value <= max) return "ok";
  const margin = (max - min) * 0.1;
  if (value >= min - margin && value <= max + margin) return "atencao";
  return "alerta";
}

const rank: Record<Status, number> = { ok: 0, atencao: 1, alerta: 2 };
const worst = (a: Status, b: Status) => (rank[a] >= rank[b] ? a : b);

export function glucoseStatus(v: number, l: Limits = DEFAULT_LIMITS): Status {
  return classify(v, l.glucose_min, l.glucose_max);
}

export function pressureStatus(sys: number, dia: number, l: Limits = DEFAULT_LIMITS): Status {
  return worst(classify(sys, l.sys_min, l.sys_max), classify(dia, l.dia_min, l.dia_max));
}

export function ageFrom(birth: string | null): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) age--;
  return age;
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export const isValidTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

// ---- login por PIN -------------------------------------------------------
// O Supabase exige senha com >= 6 caracteres; o PIN de 4 dígitos é completado com um sufixo fixo.
// Segurança fica por conta do rate-limit do Supabase Auth e da sessão persistente (o PIN só é pedido ao reentrar).
export const PIN_SUFFIX = "-prohealth";
export const pinToPassword = (pin: string) => `${pin}${PIN_SUFFIX}`;
export const isValidPin = (pin: string) => /^\d{4}$/.test(pin);
