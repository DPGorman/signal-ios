import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C } from "@/lib/constants";
import { callAI } from "@/lib/ai";
import { useIdeas } from "@/stores/useIdeas";
import { useUser } from "@/stores/useUser";
import { useCanon } from "@/stores/useCanon";
import { useConnections } from "@/stores/useConnections";

export default function InsightScreen() {
  const user = useUser((s) => s.user);
  const ideas = useIdeas((s) => s.ideas);
  const canonDocs = useCanon((s) => s.canonDocs);
  const connections = useConnections((s) => s.connections);
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runInsight = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const ideaSummary = ideas.slice(0, 30).map((i) => `[${i.category}] ${i.text.slice(0, 120)}`).join("\n");
      const canonTitles = canonDocs.filter((d) => d.is_active).map((d) => d.title).join(", ");

      const result = await callAI(
        `You are a dramaturgical advisor analyzing a creative project called "${user.project_name}". Based on the ideas and canon below, provide:
1. PROVOCATION — the hardest question this project raises that the creator may be avoiding
2. BLIND SPOT — what the idea library reveals they're not grappling with
3. URGENT — the single most important idea to act on right now and why
4. PATTERN — a recurring theme or tension across the ideas

Be specific, reference actual ideas. No generic advice. Respond in JSON:
{"provocation":"...","blindSpot":"...","urgent":"...","pattern":"..."}`,
        `IDEAS:\n${ideaSummary}\n\nCANON: ${canonTitles}\n\nCONNECTIONS: ${connections.length} links between ideas`,
        1500
      );
      setInsight(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const sections = insight
    ? [
        { key: "provocation", title: "PROVOCATION", color: C.red, text: insight.provocation },
        { key: "blindSpot", title: "BLIND SPOT", color: C.purple, text: insight.blindSpot },
        { key: "urgent", title: "URGENT", color: C.gold, text: insight.urgent },
        { key: "pattern", title: "PATTERN", color: C.blue, text: insight.pattern },
      ]
    : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Studio</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 28, color: C.textPrimary, fontWeight: "600", letterSpacing: -0.5, marginBottom: 10 }}>
          Insight
        </Text>
        <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 36, lineHeight: 24 }}>
          AI dramaturgical analysis across your entire project — {ideas.length} ideas, {canonDocs.filter((d) => d.is_active).length} canon docs, {connections.length} connections.
        </Text>

        {sections.map((s) => (
          <View key={s.key} style={{
            backgroundColor: C.surface, borderRadius: 16, padding: 22,
            marginBottom: 14, borderLeftWidth: 3, borderLeftColor: s.color,
          }}>
            <Text style={{ fontSize: 10, color: s.color, letterSpacing: 2, marginBottom: 12, fontWeight: "600" }}>
              {s.title}
            </Text>
            <Text style={{ fontSize: 15, color: C.textPrimary, lineHeight: 26 }}>{s.text}</Text>
          </View>
        ))}

        {error ? (
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 20, marginBottom: 28 }}>
            <Text style={{ fontSize: 13, color: C.red, lineHeight: 22 }}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={runInsight}
          disabled={loading}
          style={{
            backgroundColor: loading ? C.surfaceHigh : C.gold,
            borderRadius: 14, padding: 20, alignItems: "center",
            marginTop: insight ? 8 : 0,
          }}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ActivityIndicator color={C.textMuted} size="small" />
              <Text style={{ color: C.textMuted, fontSize: 14, fontWeight: "600", letterSpacing: 1 }}>ANALYZING...</Text>
            </View>
          ) : (
            <Text style={{ color: C.bg, fontSize: 14, fontWeight: "600", letterSpacing: 1 }}>
              {insight ? "RUN AGAIN" : "RUN INSIGHT →"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
