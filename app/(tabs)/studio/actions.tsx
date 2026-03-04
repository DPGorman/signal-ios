import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C, getCat } from "@/lib/constants";
import { useDeliverables } from "@/stores/useDeliverables";

export default function ActionsScreen() {
  const deliverables = useDeliverables((s) => s.deliverables);
  const toggle = useDeliverables((s) => s.toggle);
  const [filter, setFilter] = useState<"open" | "done" | "all">("open");

  const filtered = deliverables.filter((d) => {
    if (filter === "open") return !d.is_complete;
    if (filter === "done") return d.is_complete;
    return true;
  });

  const openCount = deliverables.filter((d) => !d.is_complete).length;
  const doneCount = deliverables.filter((d) => d.is_complete).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Studio</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 28, color: C.textPrimary, fontWeight: "600", letterSpacing: -0.5, marginBottom: 10 }}>
          Actions
        </Text>
        <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 28, lineHeight: 24 }}>
          Context-aware deliverables generated from your ideas.
        </Text>

        {/* Filter pills */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
          {[
            { key: "open" as const, label: `Open (${openCount})` },
            { key: "done" as const, label: `Done (${doneCount})` },
            { key: "all" as const, label: `All (${deliverables.length})` },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                backgroundColor: filter === f.key ? C.gold : C.surface,
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
              }}
            >
              <Text style={{ color: filter === f.key ? C.bg : C.textSecondary, fontSize: 12, fontWeight: "500" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <Text style={{ color: C.textDisabled, fontStyle: "italic", fontSize: 15, paddingVertical: 40, textAlign: "center" }}>
            {filter === "open" ? "All caught up." : "Nothing here."}
          </Text>
        ) : (
          filtered.map((d) => {
            const cat = getCat(d.idea?.category || "premise");
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => {
                  toggle(d.id, d.is_complete);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  flexDirection: "row", alignItems: "flex-start", gap: 14,
                  backgroundColor: C.surface, borderRadius: 14, padding: 18, marginBottom: 10,
                }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 24, height: 24, borderRadius: 7,
                  borderWidth: 1.5, borderColor: d.is_complete ? C.green : C.textMuted,
                  backgroundColor: d.is_complete ? C.green + "20" : "transparent",
                  justifyContent: "center", alignItems: "center", marginTop: 2,
                }}>
                  {d.is_complete && <Text style={{ color: C.green, fontSize: 13 }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14, lineHeight: 23,
                    color: d.is_complete ? C.textDisabled : C.textSecondary,
                    textDecorationLine: d.is_complete ? "line-through" : "none",
                  }}>
                    {d.text}
                  </Text>
                  <Text style={{ fontSize: 9, color: cat.color, marginTop: 8, letterSpacing: 1 }}>
                    {cat.icon} {cat.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
