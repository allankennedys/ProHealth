import MedicamentosManager from "@/components/MedicamentosManager";
import { useSession } from "@/lib/session";
import { s } from "@/lib/styles";
import { Text, View } from "react-native";

export default function Remedios() {
  const { profile } = useSession();
  return (
    <View style={[s.screen, { padding: 20, paddingTop: 56 }]}>
      <Text style={{ fontSize: 30, fontWeight: "800", marginBottom: 12 }}>Meus remédios</Text>
      <Text style={{ fontSize: 17, color: "#555", marginBottom: 12 }}>Você será avisado com som e aviso na tela nos horários abaixo.</Text>
      {profile && <MedicamentosManager patientId={profile.id} big />}
    </View>
  );
}
