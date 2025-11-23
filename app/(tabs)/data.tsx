// app/(tabs)/data.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DataInputScreen() {
  const router = useRouter();

  const openModal = (tipo: string) => {
    router.push(`/data-modal?tipo=${encodeURIComponent(tipo)}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insira aqui seus dados de hoje</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#E7F7FF" }]}
          onPress={() => openModal("atividade")}
        >
          <MaterialCommunityIcons name="arm-flex" size={32} color="#1FB9C9" />
          <Text style={styles.cardTitle}>Atividade</Text>
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color="#888"
            style={styles.editIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#FFF0F0" }]}
          onPress={() => openModal("sono")}
        >
          <MaterialCommunityIcons name="sleep" size={32} color="#FF4D4D" />
          <Text style={styles.cardTitle}>Sono</Text>
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color="#888"
            style={styles.editIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#FFF0F0" }]}
          onPress={() => openModal("pressao")}
        >
          <MaterialCommunityIcons name="heart-pulse" size={32} color="#FF4D4D" />
          <Text style={styles.cardTitle}>Pressão</Text>
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color="#888"
            style={styles.editIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#E7F7FF" }]}
          onPress={() => openModal("glicemia")}
        >
          <MaterialCommunityIcons name="water" size={32} color="red" />
          <Text style={styles.cardTitle}>Glicemia</Text>
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color="#888"
            style={styles.editIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#f0ffe7ff" }]}
          onPress={() => openModal("batimentos")}
        >
          <MaterialCommunityIcons name="shoe-print" size={32} color="green" />
          <Text style={styles.cardTitle}>Passos</Text>
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color="#888"
            style={styles.editIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#E7F7FF" }]}
          onPress={() => openModal("agua")}
        >
          <MaterialCommunityIcons name="water" size={32} color="#1FB9C9" />
          <Text style={styles.cardTitle}>Água</Text>
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color="#888"
            style={styles.editIcon}
          />
        
        </TouchableOpacity>
              <TouchableOpacity style={styles.cardText} onPress={() => router.push("/Lembretes")}>
        <MaterialCommunityIcons name="pill" size={24} color="#1FB9C9" />
        <Text style={{fontSize: 16}}>Cadastrar Medicamento</Text>
      </TouchableOpacity>
                   <TouchableOpacity style={styles.cardText} onPress={() => router.push("/GerenciarMedicamentos")}>
        <MaterialCommunityIcons name="alarm" size={24} color="#1FB9C9" />
        <Text style={{fontSize: 16}}>Gerenciar Lembretes</Text>
      </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    marginTop: 60
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  editIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#c0c0c021",
    padding: 20
  }
});