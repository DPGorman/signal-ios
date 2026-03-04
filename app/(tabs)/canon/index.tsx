import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C } from "@/lib/constants";
import { useCanon } from "@/stores/useCanon";

export default function CanonScreen() {
  const canonDocs = useCanon((s) => s.canonDocs);
  const toggleActive = useCanon((s) => s.toggleActive);
  const deleteDoc = useCanon((s) => s.deleteDoc);
  const active = canonDocs.filter((d) => d.is_active);
  const inactive = canonDocs.filter((d) => !d.is_active);

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete?", title, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(id) },
    ]);
  };

  const renderDoc = (doc: typeof canonDocs[0]) => {
    const wordCount = doc.content?.split(/\s+/).length || 0;
    return (
      <TouchableOpacity key={doc.id} onPress={() => router.push(`/(tabs)/canon/${doc.id}`)}
        onLongPress={() => handleDelete(doc.id, doc.title)}
        style={{ backgroundColor: C.surface, borderRadius: 14, padding: 18, marginBottom: 10, opacity: doc.is_active ? 1 : 0.5 }} activeOpacity={0.7}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: "500", marginBottom: 4 }}>{doc.title}</Text>
            <Text style={{ fontSize: 12, color: C.textMuted }}>{doc.doc_type} · {wordCount.toLocaleString()} words</Text>
          </View>
          <TouchableOpacity onPress={() => { toggleActive(doc.id, doc.is_active); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={{
              backgroundColor: doc.is_active ? C.green + "20" : C.surface,
              borderWidth: 1, borderColor: doc.is_active ? C.green : C.border,
              borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
            }}>
            <Text style={{ fontSize: 10, color: doc.is_active ? C.green : C.textMuted, letterSpacing: 1, fontWeight: "500" }}>
              {doc.is_active ? "ACTIVE" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/")} style={{ marginBottom: 20 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Home</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 28, color: C.textPrimary, fontWeight: "600", letterSpacing: -0.5, marginBottom: 8 }}>Canon</Text>
        <Text style={{ fontSize: 14, color: C.textMuted, lineHeight: 24, marginBottom: 32 }}>
          Reference documents the AI reads before analyzing every idea.
        </Text>
        {canonDocs.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>◆</Text>
            <Text style={{ color: C.textMuted, fontStyle: "italic", fontSize: 15, textAlign: "center", lineHeight: 24 }}>
              No canon documents yet.{"\n"}Upload via the web app.
            </Text>
          </View>
        ) : (
          <>
            {active.length > 0 && (
              <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 10, color: C.green, letterSpacing: 2, marginBottom: 14, fontWeight: "600" }}>ACTIVE ({active.length})</Text>
                {active.map(renderDoc)}
              </View>
            )}
            {inactive.length > 0 && (
              <View>
                <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, marginBottom: 14, fontWeight: "600" }}>INACTIVE ({inactive.length})</Text>
                {inactive.map(renderDoc)}
              </View>
            )}
          </>
        )}
        <Text style={{ fontSize: 10, color: C.textDisabled, textAlign: "center", marginTop: 24 }}>Long press to delete · Tap to read</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
