// Edge Function: process-alerts
// Rodar a cada ~5 min (pg_cron / Scheduled Function). Faz duas coisas:
//  1. Detecta medições atrasadas (horários em profiles.horarios_glicemia / horarios_pressao)
//     e cria alertas do tipo `medicao_atrasada`.
//  2. Envia por push (Expo) todos os alertas ainda não enviados para os familiares vinculados.
//
// Deploy:  supabase functions deploy process-alerts
// Agenda:  veja supabase/README.md
import { createClient } from "npm:@supabase/supabase-js@2";

const TZ = "America/Sao_Paulo";
const TOLERANCIA_MIN = 60; // alerta se passou 60 min do horário sem medição

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function agoraLocal() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const hh = get("hour") === "24" ? "00" : get("hour");
  return { data: `${get("year")}-${get("month")}-${get("day")}`, minutos: Number(hh) * 60 + Number(get("minute")) };
}

// instante UTC de "data HH:MM" no fuso de São Paulo (UTC-3, sem horário de verão desde 2019)
function instanteUTC(data: string, hhmm: string) {
  return new Date(`${data}T${hhmm}:00-03:00`);
}

async function detectarAtrasos() {
  const { data: agora, minutos } = agoraLocal();
  const { data: pacientes } = await supabase
    .from("profiles")
    .select("id, full_name, horarios_glicemia, horarios_pressao")
    .eq("role", "idoso");

  for (const p of pacientes ?? []) {
    const tipos = [
      { nome: "glicemia", horarios: p.horarios_glicemia ?? [], tabela: "glucose_logs", legenda: "a glicemia" },
      { nome: "pressao", horarios: p.horarios_pressao ?? [], tabela: "blood_pressure_logs", legenda: "a pressão" },
    ];
    for (const t of tipos) {
      for (const hhmm of t.horarios as string[]) {
        const [h, m] = hhmm.split(":").map(Number);
        if (minutos < h * 60 + m + TOLERANCIA_MIN) continue; // ainda dentro da tolerância

        // alguma medição desde 1h antes do horário programado?
        const desde = new Date(instanteUTC(agora, hhmm).getTime() - 60 * 60_000).toISOString();
        const { count } = await supabase
          .from(t.tabela)
          .select("id", { count: "exact", head: true })
          .eq("user_id", p.id)
          .gte("measured_at", desde);
        if ((count ?? 0) > 0) continue;

        await supabase.from("alertas").upsert(
          {
            paciente_id: p.id,
            tipo: "medicao_atrasada",
            mensagem: `Alerta: ${p.full_name ?? "O paciente"} não registrou ${t.legenda} das ${hhmm}`,
            chave: `medicao_atrasada:${t.nome}:${agora}:${hhmm}:${p.id}`,
          },
          { onConflict: "chave", ignoreDuplicates: true },
        );
      }
    }
  }
}

async function enviarPushes() {
  const { data: alertas } = await supabase
    .from("alertas").select("id, paciente_id, mensagem").eq("enviado_push", false).limit(200);

  for (const a of alertas ?? []) {
    const { data: links } = await supabase
      .from("care_links").select("familiar_id").eq("idoso_id", a.paciente_id);
    const ids = (links ?? []).map((l) => l.familiar_id);
    const { data: familiares } = ids.length
      ? await supabase.from("profiles").select("expo_push_token").in("id", ids)
      : { data: [] };

    const mensagens = (familiares ?? [])
      .filter((f) => f.expo_push_token)
      .map((f) => ({ to: f.expo_push_token, sound: "default", title: "ProHealth", body: a.mensagem }));

    if (mensagens.length) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mensagens),
      });
    }
    // TODO SMS: integrar Twilio/Zenvia aqui usando profiles.phone dos familiares.
    await supabase.from("alertas").update({ enviado_push: true }).eq("id", a.id);
  }
}

Deno.serve(async () => {
  await detectarAtrasos();
  await enviarPushes();
  return new Response("ok");
});
