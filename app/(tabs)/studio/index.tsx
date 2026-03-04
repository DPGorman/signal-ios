import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { C } from "@/lib/constants";
import { useIdeas } from "@/stores/useIdeas";
import { useDeliverables } from "@/stores/useDeliverables";
import { useConnections } from "@/stores/useConnections";

const TOOLS = [
  { id: "insight", icon: "◈", label: "Insight", desc: "AI analysis of your full project", color: C.gold, route: "/(tabs)/studio/insight" },
  { id: "connections", icon: "◎", label: "Connections", desc: "Interactive mind map", color: C.blue, route: null },
  { id: "actions", icon: "◧", label: "Actions", desc: "Context-aware deliverables", color: C.red, route: "/(tabs)/studio/actions" },
  { id: "pulse", icon: "✦", label: "Pulse", desc: "Request a creative nudge", color: C.purple, route: "/(tabs)/studio/pulse" },
  { id: "compose", icon: "▤", label: "Compose", desc: "Freeform writing", color: C.blue, route: null },
  { id: "audit", icon: "◐", label: "Audit", desc: "Clean your library", color: C.textMuted, route: null },
];

export default function StudioScreen() {
  const ideas = useIdeas((s) => s.ideas);
  const deliverables = useDeliverables((s) => s.deliverables);
  const connections = useConnections((s) => s.connections);
  const pending = deliverables.filter((d) => !d.is_complete);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 28, color: C.textPrimary, fontWeight: "600", letterSpacing: -0.5, marginBottom: 10 }}>
          Studio
        </Text>
        <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 36, lineHeight: 24 }}>
          Tools for seeing the shape of your project.
        </Text>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 36 }}>
          {[
            { label: "Ideas", value: ideas.length, color: C.gold },
            { label: "Open", value: pending.length, color: C.red },
            { label: "Links", value: connections.length, color: C.blue },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 16, alignItems: "center" }}>
              <Text style={{ fontSize: 26, color: s.color, fontWeight: "300" }}>{s.value}</Text>
              <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 1, marginTop: 6 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tool cards */}
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            activeOpacity={tool.route ? 0.7 : 0.4}
            onPress={() => tool.route && router.push(tool.route as any)}
            style={{
              backgroundColor: C.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 18,
              opacity: tool.route ? 1 : 0.5,
            }}
          >
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: tool.color + "15",
              justifyContent: "center", alignItems: "center",
            }}>
              <Text style={{ fontSize: 22, color: tool.color }}>{tool.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: "500" }}>{tool.label}</Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4, lineHeight: 18 }}>{tool.desc}</Text>
            </View>
            <Text style={{ fontSize: 16, color: tool.route ? C.textMuted : C.textDisabled }}>→</Text>
          </TouchableOpacity>
        ))}

        <Text style={{ fontSize: 10, color: C.textDisabled, textAlign: "center", marginTop: 20, fontStyle: "italic" }}>
          Connections, Compose & Audit coming soon
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
