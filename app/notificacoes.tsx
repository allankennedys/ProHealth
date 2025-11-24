import { supabase } from "@/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Notification = {
  id: number;
  titulo: string;
  corpo: string;
  enviado_em: string;
};

export default function NotificationsHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadNotifications = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.replace("/(auth)/login");
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("notificacoes_enviadas")
          .select("id, titulo, corpo, enviado_em")
          .eq("usuario", session.user.id)
          .order("enviado_em", { ascending: false })
          .limit(5);

        if (fetchError) throw fetchError;

        setNotifications(data || []);
      } catch (err: any) {
        console.error("Erro ao carregar notificações:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Histórico de notificações</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1FB9C9" />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              Nenhuma notificação recebida ainda.
            </Text>
            <Text style={styles.emptySubtext}>
              Cadastre lembretes de medicamentos para começar a receber notificações.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notif) => (
              <View key={notif.id} style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notif.titulo}</Text>
                  <Text style={styles.notificationTime}>
                    {formatDate(notif.enviado_em)}
                  </Text>
                </View>
                <Text style={styles.notificationBody}>{notif.corpo}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 6,
  },
  notificationsList: {
    gap: 16,
  },
  notificationCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});