import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import {
  ageFrom, CONTEXT_LABEL, fmtDateTime, glucoseStatus, pressureStatus,
  type GlucoseLog, type PressureLog, type Profile, type Status,
} from "./health";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const COLOR: Record<Status, string> = { ok: "#2E9E5B", atencao: "#B88700", alerta: "#D63031" };
const LABEL: Record<Status, string> = { ok: "Normal", atencao: "Atenção", alerta: "Fora da faixa" };

const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);

function sparkline(values: number[], color: string) {
  if (values.length < 2) return "";
  const W = 320, H = 70, min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - 6 - ((v - min) / span) * (H - 12)}`).join(" ");
  return `<svg width="${W}" height="${H}" style="background:#f6f8fa;border-radius:6px"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
}

export function buildReportHtml(p: Profile, glucose: GlucoseLog[], pressure: PressureLog[], days: number) {
  const g = [...glucose].sort((a, b) => a.measured_at.localeCompare(b.measured_at));
  const bp = [...pressure].sort((a, b) => a.measured_at.localeCompare(b.measured_at));
  const age = ageFrom(p.birth_date);
  const gOut = g.filter((x) => glucoseStatus(x.glucose_mgdl, p) !== "ok").length;
  const bOut = bp.filter((x) => pressureStatus(x.systolic, x.diastolic, p) !== "ok").length;
  const gVals = g.map((x) => x.glucose_mgdl);

  const gRows = [...g].reverse().map((x) => {
    const s = glucoseStatus(x.glucose_mgdl, p);
    return `<tr><td>${fmtDateTime(x.measured_at)}</td><td>${x.glucose_mgdl} mg/dL</td><td>${x.context ? CONTEXT_LABEL[x.context] : "—"}</td><td style="color:${COLOR[s]};font-weight:700">${LABEL[s]}</td></tr>`;
  }).join("");
  const bRows = [...bp].reverse().map((x) => {
    const s = pressureStatus(x.systolic, x.diastolic, p);
    return `<tr><td>${fmtDateTime(x.measured_at)}</td><td>${x.systolic}/${x.diastolic} mmHg</td><td style="color:${COLOR[s]};font-weight:700">${LABEL[s]}</td></tr>`;
  }).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório ProHealth</title>
<style>
 body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:32px;font-size:13px}
 h1{color:#17A7C5;margin:0 0 4px} h2{border-bottom:2px solid #1FB9C9;padding-bottom:4px;margin-top:28px}
 table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
 th{background:#f0f6f8} .grid{display:flex;gap:24px;flex-wrap:wrap} .box{background:#f6f8fa;border-radius:8px;padding:10px 14px}
 .muted{color:#666} @media print{body{margin:12px}}
</style></head><body>
<h1>Relatório de Saúde — ProHealth</h1>
<div class="muted">Gerado em ${new Date().toLocaleString("pt-BR")} • últimos ${days} dias</div>

<h2>Paciente</h2>
<div class="grid">
 <div><b>Nome:</b> ${esc(p.full_name ?? "—")}</div>
 <div><b>Idade:</b> ${age ?? "—"}</div>
 <div><b>Contato de emergência:</b> ${esc(p.emergency_name ?? "—")} ${esc(p.emergency_phone ?? "")} ${esc(p.emergency_email ?? "")}</div>
</div>
<p class="muted">Faixas definidas: glicemia ${p.glucose_min}–${p.glucose_max} mg/dL • pressão sistólica ${p.sys_min}–${p.sys_max} / diastólica ${p.dia_min}–${p.dia_max} mmHg</p>

<h2>Glicemia</h2>
<div class="grid">
 <div class="box"><b>${g.length}</b><br>medições</div>
 <div class="box"><b>${avg(gVals) ?? "—"}</b><br>média mg/dL</div>
 <div class="box"><b>${gVals.length ? Math.min(...gVals) : "—"} / ${gVals.length ? Math.max(...gVals) : "—"}</b><br>mín / máx</div>
 <div class="box"><b>${gOut}</b><br>fora da faixa</div>
</div>
<p>${sparkline(gVals, "#D63031")}</p>
<table><tr><th>Data/hora</th><th>Valor</th><th>Contexto</th><th>Situação</th></tr>${gRows || '<tr><td colspan="4">Sem registros no período</td></tr>'}</table>

<h2>Pressão arterial</h2>
<div class="grid">
 <div class="box"><b>${bp.length}</b><br>medições</div>
 <div class="box"><b>${avg(bp.map((x) => x.systolic)) ?? "—"}/${avg(bp.map((x) => x.diastolic)) ?? "—"}</b><br>média mmHg</div>
 <div class="box"><b>${bOut}</b><br>fora da faixa</div>
</div>
<p>${sparkline(bp.map((x) => x.systolic), "#FF4D4D")} ${sparkline(bp.map((x) => x.diastolic), "#1FB9C9")}</p>
<table><tr><th>Data/hora</th><th>Pressão</th><th>Situação</th></tr>${bRows || '<tr><td colspan="3">Sem registros no período</td></tr>'}</table>

<p class="muted" style="margin-top:28px">Este relatório é informativo e não substitui avaliação médica.</p>
</body></html>`;
}

/** Web: abre o relatório numa nova aba e chama a impressão (Salvar como PDF). Nativo: gera PDF e compartilha. */
export async function exportReport(html: string) {
  if (Platform.OS === "web") {
    const w = window.open("", "_blank");
    if (!w) throw new Error("O navegador bloqueou a janela. Libere pop-ups para este site.");
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Relatório ProHealth" });
  }
}
