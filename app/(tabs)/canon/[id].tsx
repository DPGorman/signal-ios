import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { C } from "@/lib/constants";
import { useCanon } from "@/stores/useCanon";

export default function CanonDocScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const canonDocs = useCanon((s) => s.canonDocs);
  const doc = canonDocs.find((d) => d.id === id);

  if (!doc) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: C.textMuted }}>Document not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Canon</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 22, color: C.textPrimary, fontWeight: "500", marginBottom: 8 }}>
          {doc.title}
        </Text>
        <Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 32, letterSpacing: 1 }}>
          {doc.doc_type} · {doc.is_active ? "Active" : "Inactive"}
        </Text>

        <Text style={{ fontSize: 15, color: C.textSecondary, lineHeight: 28 }}>
          {doc.content}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
