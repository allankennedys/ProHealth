import { IconSymbol } from "@/components/ui/icon-symbol";
import { supabase } from "@/supabase"; // ajuste o caminho conforme seu projeto
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Resume() {
  const [relatorio, setRelatorio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchRelatorio = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      setRelatorio(null);
      setLoading(false);
      return;
    }

    const agora = new Date();

    // início do dia local
    const inicioLocal = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      0, 0, 0, 0
    );

    // fim do dia local
    const fimLocal = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      23, 59, 59, 999
    );

    // convertido pra UTC (ISO)
    const inicioUTC = inicioLocal.toISOString();
    const fimUTC = fimLocal.toISOString();


const { data, error } = await supabase
  .from("relatorio")
  .select("conteudo, created_at")
  .eq("usuario", session.user.id)
  .gte("created_at", inicioUTC)
  .lte("created_at", fimUTC)
  .order("created_at", { ascending: false })
  .limit(1);


    setRelatorio(data?.[0]?.conteudo || null);
    setLoading(false);

  };

  fetchRelatorio();
}, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1EBCCF" />
      </View>
    );
  }

  const mensagemPadrao =
    "Ainda não há nada para exibir. Os relatórios são gerados todos os dias às 5h da manhã de acordo com seus dados de saúde mais recentes.";

  return (
    <View style={styles.container}>
      {/* CARD DE AVISO */}
      <View style={styles.infoCard}>
        <IconSymbol name="info.circle" size={26} color="#1EBCCF" />
        <Text style={styles.infoText}>
          As análises do ProHealth têm caráter informativo e de apoio. Elas não
          substituem avaliação médica profissional.
        </Text>
      </View>

      {/* GRÁFICO */}

      {/* RELATÓRIO DO DIA */}
      
      <View style={[styles.infoCard, {paddingVertical:50}]}>
        <IconSymbol name="sparkles" size={26} color="#1EBCCF" />
        <Text style={styles.infoText}>Seu relatório dos últimos 7 dias::{"\n\n"}

          {relatorio || mensagemPadrao}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#F4F8FA",
    gap: 20,
  },
  infoCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
    lineHeight: 20,
  },
});