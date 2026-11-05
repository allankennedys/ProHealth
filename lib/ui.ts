import { Alert, Linking, Platform } from "react-native";

/** Alert.alert não funciona no web; estes helpers funcionam nas duas plataformas. */
export function notify(title: string, message?: string) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function confirmAction(title: string, message: string, confirmLabel = "Confirmar"): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export const COLORS = {
  primary: "#1FB9C9",
  primaryDark: "#17A7C5",
  bg: "#F4F8FA",
  text: "#222",
  muted: "#666",
  card: "#fff",
};

/** Liga para um número. Celular (nativo ou navegador móvel): abre o discador. Computador: copia o número e avisa. */
export async function callPhone(raw: string, name?: string | null) {
  const number = raw.replace(/[^\d+]/g, "");
  if (!number) return notify("Telefone inválido", "Este contato não tem um número válido.");
  if (Platform.OS === "web") {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (!isMobile) {
      try { await navigator.clipboard?.writeText(number); } catch {}
      return notify(`Ligar para ${name || "contato"}`, `Este aparelho não faz ligações. Número copiado: ${raw}\n\nLigue pelo celular.`);
    }
    window.location.href = `tel:${number}`;
    return;
  }
  try {
    await Linking.openURL(`tel:${number}`);
  } catch {
    notify("Não foi possível ligar", `Ligue manualmente para ${raw}.`);
  }
}
