import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  sublabel?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
  bg?: string;
  onPress: () => void;
  size?: "md" | "lg";
  disabled?: boolean;
};

/** Botão grande, alto contraste, para o módulo do idoso. */
export default function BigButton({ label, sublabel, icon, color = "#fff", bg = "#1FB9C9", onPress, size = "lg", disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sublabel ? `${label}. ${sublabel}` : label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1, minHeight: size === "lg" ? 110 : 76 },
      ]}
    >
      {icon && <MaterialCommunityIcons name={icon} size={size === "lg" ? 52 : 36} color={color} />}
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color, fontSize: size === "lg" ? 28 : 22 }]}>{label}</Text>
        {sublabel ? <Text style={[styles.sub, { color }]}>{sublabel}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", gap: 18, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 16 },
  label: { fontWeight: "800" },
  sub: { fontSize: 16, marginTop: 2, opacity: 0.95 },
});
