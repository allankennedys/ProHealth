import MedicamentosManager from "@/components/MedicamentosManager";
import PatientPicker from "@/components/PatientPicker";
import { usePatients } from "@/lib/patients";
import { s } from "@/lib/styles";
import { Text, View } from "react-native";

export default function Remedios() {
  const { patient } = usePatients();
  return (
    <View style={[s.screen, { padding: 20, paddingTop: 56 }]}>
      <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 12 }}>Remédios do paciente</Text>
      <PatientPicker showLink={!patient} />
      {patient && <MedicamentosManager key={patient.id} patientId={patient.id} />}
    </View>
  );
}
