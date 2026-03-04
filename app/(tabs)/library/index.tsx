import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { C, CATEGORIES, getCat } from "@/lib/constants";
import { useIdeas } from "@/stores/useIdeas";

export default function LibraryScreen() {
  const ideas = useIdeas((s) => s.ideas);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = ideas
    .filter((i) => !filter || i.category === filter)
    .filter((i) => !search || i.text.toLowerCase().includes(search.toLowerCase()) || i.ai_note?.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/")} style={{ marginBottom: 20 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Home</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 28, color: C.textPrimary, fontWeight: "600", letterSpacing: -0.5, marginBottom: 20 }}>Library</Text>
        <TextInput
          value={search} onChangeText={setSearch} placeholder="Search ideas..."
          placeholderTextColor={C.textDisabled}
          style={{ backgroundColor: C.surface, borderRadius: 12, color: C.textPrimary, fontSize: 15, padding: 16, marginBottom: 16 }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          <TouchableOpacity onPress={() => setFilter(null)}
            style={{ backgroundColor: !filter ? C.gold : C.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: !filter ? C.bg : C.textSecondary, fontSize: 12, fontWeight: "500" }}>All ({ideas.length})</Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => {
            const count = ideas.filter((i) => i.category === cat.id).length;
            if (count === 0) return null;
            const active = filter === cat.id;
            return (
              <TouchableOpacity key={cat.id} onPress={() => setFilter(active ? null : cat.id)}
                style={{ backgroundColor: active ? cat.color : C.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
                <Text style={{ color: active ? C.bg : cat.color, fontSize: 12, fontWeight: "500" }}>{cat.icon} {cat.label} ({count})</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={{ color: C.textDisabled, fontStyle: "italic", fontSize: 15, textAlign: "center", paddingTop: 40 }}>
            {search ? "No matches." : "No ideas yet."}
          </Text>
        ) : (
          filtered.map((idea) => {
            const cat = getCat(idea.category);
            const daysAgo = Math.floor((Date.now() - new Date(idea.created_at).getTime()) / 864e5);
            return (
              <TouchableOpacity key={idea.id} onPress={() => router.push(`/(tabs)/library/${idea.id}`)}
                style={{ backgroundColor: C.surface, borderRadius: 14, padding: 18, marginBottom: 10 }} activeOpacity={0.7}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: cat.color }}>{cat.icon}</Text>
                  <Text style={{ fontSize: 10, color: cat.color, letterSpacing: 1, fontWeight: "500" }}>{cat.label.toUpperCase()}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ fontSize: 10, color: C.textDisabled }}>{daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d`}</Text>
                </View>
                <Text numberOfLines={2} style={{ fontSize: 15, color: C.textSecondary, lineHeight: 24 }}>{idea.text}</Text>
                {idea.ai_note ? <Text numberOfLines={1} style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>{idea.ai_note}</Text> : null}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
