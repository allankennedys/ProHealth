import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type Reminder = { key: string; time: string; title: string; body: string };

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Agenda (nativo) uma notificação diária com som para cada lembrete, substituindo as anteriores. */
export async function syncNativeReminders(reminders: Reminder[]) {
  if (Platform.OS === "web") return;
  const { status } = await Notifications.getPermissionsAsync();
  let granted = status === "granted";
  if (!granted) granted = (await Notifications.requestPermissionsAsync()).status === "granted";
  if (!granted) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("lembretes", {
      name: "Lembretes de saúde",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 400, 200, 400],
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const r of reminders) {
    const [hour, minute] = r.time.split(":").map(Number);
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body, sound: "default" },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
        channelId: "lembretes",
      },
    });
  }
}

/** Bipe de alerta no web (Web Audio — sem arquivo de som). */
export function playBeep() {
  if (Platform.OS !== "web") return;
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.3);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.3);
    });
  } catch {}
}

export async function requestWebNotificationPermission() {
  if (Platform.OS !== "web" || typeof Notification === "undefined") return;
  if (Notification.permission === "default") await Notification.requestPermission();
}

export function showWebNotification(title: string, body: string) {
  if (Platform.OS !== "web" || typeof Notification === "undefined") return;
  if (Notification.permission === "granted") new Notification(title, { body });
}

// Pequeno barramento para o ReminderWatcher recarregar quando remédios/horários mudam.
const listeners = new Set<() => void>();
export const onRemindersChanged = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const emitRemindersChanged = () => listeners.forEach((fn) => fn());
