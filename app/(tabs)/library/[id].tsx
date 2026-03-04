import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C, getCat } from "@/lib/constants";
import { useIdeas } from "@/stores/useIdeas";
import { useDeliverables } from "@/stores/useDeliverables";
import { useConnections } from "@/stores/useConnections";

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ideas = useIdeas((s) => s.ideas);
  const deleteIdea = useIdeas((s) => s.deleteIdea);
  const deliverables = useDeliverables((s) => s.deliverables);
  const toggle = useDeliverables((s) => s.toggle);
  const connections = useConnections((s) => s.connections);

  const idea = ideas.find((i) => i.id === id);
  if (!idea) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: C.textMuted }}>Idea not found</Text>
      </SafeAreaView>
    );
  }

  const cat = getCat(idea.category);
  const ideaDeliverables = deliverables.filter((d) => d.idea_id === idea.id);
  const ideaConnections = connections.filter(
    (c) => c.idea_id_a === idea.id || c.idea_id_b === idea.id
  );
  const connectedIdeas = ideaConnections.map((c) => {
    const otherId = c.idea_id_a === idea.id ? c.idea_id_b : c.idea_id_a;
    return { ...c, other: ideas.find((i) => i.id === otherId) };
  }).filter((c) => c.other);

  const handleDelete = () => {
    Alert.alert("Delete this idea?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteIdea(idea.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Library</Text>
        </TouchableOpacity>

        {/* Category + Signal */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: cat.color }}>{cat.icon}</Text>
          <Text style={{ fontSize: 11, color: cat.color, letterSpacing: 1.5, fontWeight: "500" }}>
            {cat.label.toUpperCase()}
          </Text>
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: "row", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: 6 + i * 3,
                  backgroundColor: i < (idea.signal_strength || 1) ? C.gold : C.border,
                  borderRadius: 1,
                }}
              />
            ))}
          </View>
        </View>

        {/* Idea text */}
        <Text style={{ fontSize: 18, color: C.textPrimary, lineHeight: 30, marginBottom: 24 }}>
          {idea.text}
        </Text>

        {/* Date + Source */}
        <Text style={{ fontSize: 10, color: C.textDisabled, letterSpacing: 1, marginBottom: 32 }}>
          {new Date(idea.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}{" "}
          · via {idea.source || "app"}
        </Text>

        {/* AI Analysis */}
        {idea.ai_note ? (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 10, fontWeight: "500" }}>
              ANALYSIS
            </Text>
            <Text style={{ fontSize: 14, color: C.textSecondary, lineHeight: 24 }}>
              {idea.ai_note}
            </Text>
          </View>
        ) : null}

        {/* Canon Resonance */}
        {idea.canon_resonance ? (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 10, color: C.purple, letterSpacing: 2, marginBottom: 10, fontWeight: "500" }}>
              CANON RESONANCE
            </Text>
            <Text style={{ fontSize: 14, color: C.textSecondary, lineHeight: 24 }}>
              {idea.canon_resonance}
            </Text>
          </View>
        ) : null}

        {/* Dimensions */}
        {idea.dimensions && idea.dimensions.length > 0 ? (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 10, color: C.blue, letterSpacing: 2, marginBottom: 10, fontWeight: "500" }}>
              DIMENSIONS
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {idea.dimensions.map((d, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: C.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    borderWidth: 0.5,
                    borderColor: C.border,
                  }}
                >
                  <Text style={{ fontSize: 12, color: C.textSecondary }}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Deliverables / Actions */}
        {ideaDeliverables.length > 0 ? (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 10, color: C.red, letterSpacing: 2, marginBottom: 10, fontWeight: "500" }}>
              ACTIONS ({ideaDeliverables.length})
            </Text>
            {ideaDeliverables.map((d) => (
              <TouchableOpacity
                key={d.id}
                onPress={() => {
                  toggle(d.id, d.is_complete);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  backgroundColor: C.surface,
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: d.is_complete ? C.green : C.textMuted,
                    backgroundColor: d.is_complete ? C.green + "20" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 1,
                  }}
                >
                  {d.is_complete && <Text style={{ color: C.green, fontSize: 12 }}>✓</Text>}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: d.is_complete ? C.textDisabled : C.textSecondary,
                    lineHeight: 22,
                    textDecorationLine: d.is_complete ? "line-through" : "none",
                  }}
                >
                  {d.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Connections */}
        {connectedIdeas.length > 0 ? (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 10, color: C.blue, letterSpacing: 2, marginBottom: 10, fontWeight: "500" }}>
              CONNECTIONS ({connectedIdeas.length})
            </Text>
            {connectedIdeas.map((c) => {
              const otherCat = getCat(c.other!.category);
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => router.push(`/(tabs)/library/${c.other!.id}`)}
                  style={{
                    backgroundColor: C.surface,
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 6,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: otherCat.color }}>{otherCat.icon}</Text>
                    <Text style={{ fontSize: 10, color: otherCat.color, letterSpacing: 1 }}>
                      {otherCat.label.toUpperCase()}
                    </Text>
                  </View>
                  <Text numberOfLines={2} style={{ fontSize: 13, color: C.textSecondary, lineHeight: 20 }}>
                    {c.other!.text}
                  </Text>
                  {c.reason ? (
                    <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontStyle: "italic" }}>
                      {c.reason}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Delete */}
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            alignSelf: "center",
            paddingVertical: 12,
            paddingHorizontal: 24,
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 13, color: C.red + "80" }}>Delete Idea</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
