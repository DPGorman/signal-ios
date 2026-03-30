import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Keyboard, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C } from "@/lib/constants";
import { useUser } from "@/stores/useUser";
import { useProjects } from "@/stores/useProjects";
import { useDeliverables } from "@/stores/useDeliverables";

export default function TasksScreen() {
  const user = useUser((s) => s.user);
  const current = useProjects((s) => s.current);
  const deliverables = useDeliverables((s) => s.deliverables);
  const toggle = useDeliverables((s) => s.toggle);
  const addTask = useDeliverables((s) => s.addTask);
  const deleteTask = useDeliverables((s) => s.deleteTask);

  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const tasks = deliverables.filter((d) => d.type === "task");
  const openTasks = tasks.filter((d) => !d.is_complete);
  const doneTasks = tasks.filter((d) => d.is_complete);

  const handleAdd = React.useCallback(async () => {
    const t = text.trim();
    if (!t || !user || busy) return;
    setBusy(true);
    Keyboard.dismiss();
    try {
      await addTask(user.id, t, undefined, current?.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setText("");
    } catch (e) {
      console.error("[Signal] addTask error:", e);
    }
    setBusy(false);
  }, [text, user, current, busy, addTask]);

  const handleDelete = (id: string, label: string) => {
    Alert.alert("Delete?", label.slice(0, 60), [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTask(id) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.push("/(tabs)/")} style={{ marginBottom: 24 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Home</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 28, color: C.textPrimary, fontWeight: "600", marginBottom: 24 }}>Tasks</Text>

        {/* Input */}
        <TextInput
          value={text}
          onChangeText={(v) => {
            
            setText(v);
          }}
          placeholder="What needs to get done?"
          placeholderTextColor={C.textDisabled}
          style={{
            backgroundColor: C.surface,
            borderRadius: 12,
            color: C.textPrimary,
            fontSize: 16,
            padding: 16,
            marginBottom: 12,
          }}
        />

        <TouchableOpacity
          onPress={handleAdd}
          style={{
            backgroundColor: text.trim() ? C.gold : C.surfaceHigh,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Text style={{
            color: text.trim() ? C.bg : C.textMuted,
            fontSize: 15, fontWeight: "600",
          }}>
            {busy ? "Adding..." : "Add Task"}
          </Text>
        </TouchableOpacity>

        {/* Open */}
        {openTasks.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: "600", marginBottom: 14 }}>
              OPEN ({openTasks.length})
            </Text>
            {openTasks.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => { toggle(t.id, t.is_complete); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                onLongPress={() => handleDelete(t.id, t.text)}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 8 }}
                activeOpacity={0.7}
              >
                <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: C.textMuted }} />
                <Text style={{ flex: 1, fontSize: 15, color: C.textPrimary, lineHeight: 23 }}>{t.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Done */}
        {doneTasks.length > 0 && (
          <View>
            <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: "600", marginBottom: 14 }}>
              DONE ({doneTasks.length})
            </Text>
            {doneTasks.slice(0, 10).map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => { toggle(t.id, t.is_complete); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                onLongPress={() => handleDelete(t.id, t.text)}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 8, opacity: 0.5 }}
              >
                <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: C.green, backgroundColor: C.green + "20", justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: C.green, fontSize: 12 }}>✓</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 15, color: C.textDisabled, lineHeight: 23, textDecorationLine: "line-through" }}>{t.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tasks.length === 0 && (
          <Text style={{ color: C.textDisabled, fontStyle: "italic", fontSize: 15, textAlign: "center", paddingVertical: 40 }}>
            No tasks yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
