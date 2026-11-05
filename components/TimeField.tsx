import { createElement } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";

/** Campo de horário HH:MM. Web: <input type="time"> nativo; mobile: TextInput numérico com máscara. */
export default function TimeField({
  value, onChange, style,
}: { value: string; onChange: (v: string) => void; style?: any }) {
  if (Platform.OS === "web") {
    return createElement("input", {
      type: "time", value,
      onChange: (e: any) => onChange(e.target.value),
      style: {
        fontSize: 18, padding: 12, borderRadius: 8, border: "1px solid #ccc", backgroundColor: "#fff", ...flat(style),
      },
    });
  }
  return (
    <View>
      <TextInput
        style={[styles.input, style]}
        value={value}
        keyboardType="number-pad"
        placeholder="HH:MM"
        maxLength={5}
        onChangeText={(t) => {
          const d = t.replace(/\D/g, "").slice(0, 4);
          onChange(d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d);
        }}
      />
    </View>
  );
}

const flat = (s: any) => (s ? StyleSheet.flatten(s) : {});
const styles = StyleSheet.create({
  input: { backgroundColor: "#E9E9E9", padding: 14, borderRadius: 8, fontSize: 18, minWidth: 100 },
});
