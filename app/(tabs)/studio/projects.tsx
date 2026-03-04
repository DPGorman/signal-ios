import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C } from "@/lib/constants";
import { useUser } from "@/stores/useUser";
import { useProjects } from "@/stores/useProjects";

export default function ProjectsScreen() {
  const user = useUser((s) => s.user);
  const projects = useProjects((s) => s.projects);
  const current = useProjects((s) => s.current);
  const setCurrent = useProjects((s) => s.setCurrent);
  const createProject = useProjects((s) => s.createProject);
  const [name, setName] = useState("");
  const [showNew, setShowNew] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    Keyboard.dismiss();
    await createProject(user.id, name.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName("");
    setShowNew(false);
    router.push("/(tabs)/");
  };

  const handleSwitch = (project: typeof projects[0]) => {
    setCurrent(project);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(tabs)/");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Home</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 28, color: C.textPrimary, fontWeight: "600", marginBottom: 28 }}>Projects</Text>

        {projects.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => handleSwitch(p)}
            style={{
              backgroundColor: p.id === current?.id ? C.gold + "15" : C.surface,
              borderRadius: 14, padding: 20, marginBottom: 10,
              borderWidth: p.id === current?.id ? 1 : 0,
              borderColor: C.gold + "40",
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, color: C.textPrimary, fontWeight: "600" }}>{p.name}</Text>
                {p.description && <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{p.description}</Text>}
              </View>
              {p.id === current?.id && <Text style={{ fontSize: 12, color: C.gold, fontWeight: "500" }}>ACTIVE</Text>}
            </View>
          </TouchableOpacity>
        ))}

        {showNew ? (
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 18, marginTop: 12 }}>
            <TextInput
              value={name} onChangeText={setName}
              placeholder="Project name"
              placeholderTextColor={C.textDisabled}
              autoFocus
              style={{ color: C.textPrimary, fontSize: 16, marginBottom: 14 }}
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setShowNew(false)} style={{ flex: 1, backgroundColor: C.surfaceHigh, borderRadius: 10, padding: 14, alignItems: "center" }}>
                <Text style={{ color: C.textMuted, fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} disabled={!name.trim()} style={{ flex: 1, backgroundColor: name.trim() ? C.gold : C.surfaceHigh, borderRadius: 10, padding: 14, alignItems: "center" }}>
                <Text style={{ color: name.trim() ? C.bg : C.textMuted, fontSize: 13, fontWeight: "600" }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setShowNew(true)} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 18, marginTop: 12, alignItems: "center" }}>
            <Text style={{ color: C.gold, fontSize: 14, fontWeight: "500" }}>+ New Project</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
