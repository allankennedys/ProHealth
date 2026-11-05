import { supabase } from "@/supabase";
import { useSession } from "@/lib/session";
import {
  onRemindersChanged, playBeep, requestWebNotificationPermission, showWebNotification, syncNativeReminders, type Reminder,
} from "@/lib/reminders";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

/**
 * Montado no layout do idoso. Carrega horários de remédios e de medição,
 *  - nativo: agenda notificações diárias com som;
 *  - web: confere o relógio a cada 15s e dispara bipe + aviso na tela enquanto a aba estiver aberta.
 */
export default function ReminderWatcher() {
  const { session, profile } = useSession();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [active, setActive] = useState<Reminder | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!session) return;
    const list: Reminder[] = [];
    const { data } = await supabase
      .from("medicamentos")
      .select("nome, dosagem, lembretes(id, horario)")
      .eq("usuario", session.user.id);
    (data ?? []).forEach((m: any) =>
      (m.lembretes ?? []).forEach((l: any) =>
        list.push({
          key: `med:${l.id}`, time: String(l.horario).slice(0, 5),
          title: "Hora do remédio 💊", body: `${m.nome}${m.dosagem ? ` — ${m.dosagem}` : ""}`,
        })));
    (profile?.horarios_glicemia ?? []).forEach((t) =>
      list.push({ key: `gli:${t}`, time: t, title: "Hora de medir a glicemia 🩸", body: "Abra o ProHealth e registre sua glicemia." }));
    (profile?.horarios_pressao ?? []).forEach((t) =>
      list.push({ key: `pa:${t}`, time: t, title: "Hora de medir a pressão ❤️", body: "Abra o ProHealth e registre sua pressão." }));
    setReminders(list);
    syncNativeReminders(list).catch((e) => console.warn("reminders:", e));
  }, [session, profile?.horarios_glicemia, profile?.horarios_pressao]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => onRemindersChanged(load), [load]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    requestWebNotificationPermission();
    const tick = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const day = now.toDateString();
      const due = reminders.find((r) => r.time === hhmm && !firedRef.current.has(`${day}:${r.key}`));
      if (due) {
        firedRef.current.add(`${day}:${due.key}`);
        setActive(due);
        playBeep();
        showWebNotification(due.title, due.body);
      }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [reminders]);

  return (
    <Modal visible={!!active} transparent animationType="fade" onRequestClose={() => setActive(null)}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{active?.title}</Text>
          <Text style={styles.body}>{active?.body}</Text>
          <Text style={styles.time}>{active?.time}</Text>
          <Pressable style={styles.button} onPress={() => setActive(null)} accessibilityRole="button">
            <Text style={styles.buttonText}>OK, entendi</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  box: { backgroundColor: "white", borderRadius: 24, padding: 28, alignItems: "center", gap: 12 },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", color: "#222" },
  body: { fontSize: 22, textAlign: "center", color: "#444" },
  time: { fontSize: 34, fontWeight: "800", color: "#1FB9C9" },
  button: { backgroundColor: "#1FB9C9", paddingVertical: 20, paddingHorizontal: 40, borderRadius: 40, marginTop: 8, alignSelf: "stretch" },
  buttonText: { color: "white", fontSize: 24, fontWeight: "800", textAlign: "center" },
});
