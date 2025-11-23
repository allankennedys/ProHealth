import BatimentoGrafico from "@/components/BatimentoGrafico";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StyleSheet, Text, View } from "react-native";

export default function Resume() {
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
      <BatimentoGrafico />
            <View style={styles.infoCard}>
        <IconSymbol name="sparkles" size={26} color="#1EBCCF" />

        <Text style={styles.infoText}>
          Seus batimentos em repouso

aumentaram para 81 bpm na terça-
feira, possivelmente devido à falta de

sono ou estresse.
        </Text>
      </View>
      <View style={{flexDirection: "row", gap: 10, paddingHorizontal: 10}}>
         <IconSymbol name="waveform.path.ecg" size={26} color="green" />
       
              <Text>Sua pressão esteve estável nos
últimos 7 dias.</Text>
      </View>


<View style={styles.infoCard}>
        <IconSymbol name="sparkles" size={26} color="#1EBCCF" />

        <Text style={styles.infoText}>
Seus sinais vitais mostram tendência
saudável, mas é importante manter
regularidade nos registros.
Sugerimos atenção especial para sono e
controle dos horários de medicamentos.
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
    gap: 20
  },

  infoCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,

    // sombra estilo iOS/Android
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
