import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F8FA" },
  content: { padding: 20, gap: 16, paddingBottom: 60, width: "100%", maxWidth: 720, alignSelf: "center" },
  header: { paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800" },
  headerSub: { color: "#E7FDFE", fontSize: 16, marginTop: 4 },
  card: {
    backgroundColor: "#fff", borderRadius: 18, padding: 18, gap: 8,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  h2: { fontSize: 20, fontWeight: "700", color: "#222" },
  label: { fontSize: 15, color: "#555", marginTop: 8 },
  input: { backgroundColor: "#E9E9E9", padding: 14, borderRadius: 8, fontSize: 17 },
  button: { backgroundColor: "#1FB9C9", padding: 16, borderRadius: 30, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  buttonGhost: { padding: 14, borderRadius: 30, alignItems: "center", borderWidth: 2, borderColor: "#1FB9C9" },
  buttonGhostText: { color: "#1FB9C9", fontSize: 17, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  muted: { color: "#666", fontSize: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#E9E9E9" },
  chipActive: { backgroundColor: "#1FB9C9" },
});
