import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { C, getCat } from "@/lib/constants";
import { useUser } from "@/stores/useUser";
import { useProjects } from "@/stores/useProjects";
import { useIdeas } from "@/stores/useIdeas";
import { useDeliverables } from "@/stores/useDeliverables";
import { useCanon } from "@/stores/useCanon";
import { useConnections } from "@/stores/useConnections";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const user = useUser((s) => s.user);
  const isLoading = useUser((s) => s.isLoading);
  const userError = useUser((s) => s.error);
  const current = useProjects((s) => s.current);
  const projectsLoaded = useProjects((s) => s.isLoaded);
  const ideas = useIdeas((s) => s.ideas);
  const deliverables = useDeliverables((s) => s.deliverables);
  const canonDocs = useCanon((s) => s.canonDocs);
  const connections = useConnections((s) => s.connections);
  const toggle = useDeliverables((s) => s.toggle);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await useUser.getState().loadUser();
    const u = useUser.getState().user;
    if (u) {
      await useProjects.getState().loadProjects(u.id);
      const proj = useProjects.getState().current;
      if (proj) {
        await Promise.all([
          useIdeas.getState().loadIdeas(u.id, proj.id),
          useDeliverables.getState().loadDeliverables(u.id, proj.id),
          useCanon.getState().loadCanon(u.id, proj.id),
          useConnections.getState().loadConnections(),
        ]);
      }
    }
    setRefreshing(false);
  };

  const pending = deliverables.filter((d) => !d.is_complete && d.type !== "task");
  const tasks = deliverables.filter((d) => d.type === "task" && !d.is_complete);
  const activeCanon = canonDocs.filter((d) => d.is_active);
  const allTasks = deliverables.filter((d) => d.type === "task");
  const lastTask = allTasks.length > 0 ? allTasks[0] : null;

  if (isLoading || !projectsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <Image source={require("@/assets/logo.jpg")} style={{ width: 80, height: 80, borderRadius: 20 }} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <Image source={require("@/assets/logo.jpg")} style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 20 }} />
        <Text style={{ color: C.red, fontSize: 13, textAlign: "center", lineHeight: 22 }}>{userError || "No user found"}</Text>
        <TouchableOpacity onPress={onRefresh} style={{ marginTop: 24, backgroundColor: C.surface, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}>
          <Text style={{ color: C.gold, fontSize: 13 }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const NavCard = ({ icon, label, sub, color, route, style }: any) => (
    <TouchableOpacity onPress={() => router.push(route)} activeOpacity={0.7}
      style={[{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 16, padding: 20 }, style]}>
      <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: color + "12", justifyContent: "center", alignItems: "center", marginRight: 16 }}>
        <Text style={{ fontSize: 20, color }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: "500" }}>{label}</Text>
        <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{sub}</Text>
      </View>
      <Text style={{ fontSize: 16, color: C.textDisabled }}>›</Text>
    </TouchableOpacity>
  );

  const SmallCard = ({ icon, label, sub, color, route }: any) => (
    <TouchableOpacity onPress={() => router.push(route)} activeOpacity={0.7}
      style={{ flex: 1, backgroundColor: C.surface, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: color + "12", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: "500" }}>{label}</Text>
        <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, count, route }: { title: string; count?: number; route: string }) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: "600" }}>
        {title}{count !== undefined ? ` (${count})` : ""}
      </Text>
      <TouchableOpacity onPress={() => router.push(route)}>
        <Text style={{ fontSize: 11, color: C.gold, letterSpacing: 1 }}>VIEW ALL →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Image source={require("@/assets/logo.jpg")} style={{ width: 88, height: 88, borderRadius: 22 }} />
        </View>

        {/* Project switcher */}
        <TouchableOpacity onPress={() => router.push("/(tabs)/studio/projects")} activeOpacity={0.7}
          style={{ alignSelf: "center", backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: "500" }}>{current?.name || "Select Project"}</Text>
          <Text style={{ fontSize: 12, color: C.textMuted }}>▾</Text>
        </TouchableOpacity>

        {/* Last task */}
        <TouchableOpacity onPress={() => router.push("/(tabs)/studio/tasks")} activeOpacity={0.7} style={{ marginBottom: 40, paddingHorizontal: 8 }}>
          {lastTask ? (
            <Text style={{ fontSize: 18, color: lastTask.is_complete ? C.textDisabled : C.textSecondary, fontStyle: "italic", lineHeight: 30, textAlign: "center", textDecorationLine: lastTask.is_complete ? "line-through" : "none" }}>
              {lastTask.text}
            </Text>
          ) : (
            <Text style={{ fontSize: 18, color: C.textMuted, fontStyle: "italic", lineHeight: 30, textAlign: "center" }}>
              No tasks yet. Tap to add one.
            </Text>
          )}
        </TouchableOpacity>

        {/* Capture */}
        <NavCard icon="✦" label="Capture" sub="Send a signal" color={C.gold} route="/(tabs)/capture" style={{ marginBottom: 10 }} />

        {/* Row 1 */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <SmallCard icon="▤" label="Library" sub={`${ideas.length} ideas`} color={C.blue} route="/(tabs)/library/" />
          <SmallCard icon="◧" label="Actions" sub={`${pending.length} open`} color={C.red} route="/(tabs)/studio/actions" />
        </View>

        {/* Row 2 */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <SmallCard icon="◆" label="Canon" sub={`${activeCanon.length} active`} color={C.green} route="/(tabs)/canon/" />
          <SmallCard icon="✦" label="Pulse" sub="Nudge" color={C.purple} route="/(tabs)/studio/pulse" />
        </View>

        {/* Row 3 */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <SmallCard icon="☐" label="Tasks" sub={`${tasks.length} open`} color={C.gold} route="/(tabs)/studio/tasks" />
          <SmallCard icon="◈" label="Insight" sub="Analysis" color={C.gold} route="/(tabs)/studio/insight" />
        </View>

        {/* ═══ SCROLLABLE SECTIONS ═══ */}

        {/* Recent Ideas — max 6 */}
        <View style={{ marginTop: 44 }}>
          <SectionHeader title="RECENT IDEAS" count={ideas.length} route="/(tabs)/library/" />
          {ideas.length === 0 ? (
            <Text style={{ color: C.textDisabled, fontStyle: "italic", fontSize: 14, paddingVertical: 16 }}>No ideas yet.</Text>
          ) : (
            ideas.slice(0, 6).map((idea) => {
              const cat = getCat(idea.category);
              const daysAgo = Math.floor((Date.now() - new Date(idea.created_at).getTime()) / 864e5);
              return (
                <TouchableOpacity key={idea.id} onPress={() => router.push(`/(tabs)/library/${idea.id}`)}
                  style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 8 }} activeOpacity={0.7}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Text style={{ fontSize: 11, color: cat.color }}>{cat.icon}</Text>
                    <Text style={{ fontSize: 9, color: cat.color, letterSpacing: 1, fontWeight: "500" }}>{cat.label.toUpperCase()}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ fontSize: 9, color: C.textDisabled }}>{daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d`}</Text>
                  </View>
                  <Text numberOfLines={2} style={{ fontSize: 14, color: C.textSecondary, lineHeight: 22 }}>{idea.text}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Canon */}
        {activeCanon.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <SectionHeader title="CANON" count={activeCanon.length} route="/(tabs)/canon/" />
            {activeCanon.slice(0, 4).map((doc) => (
              <TouchableOpacity key={doc.id} onPress={() => router.push(`/(tabs)/canon/${doc.id}`)}
                style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 8 }} activeOpacity={0.7}>
                <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: "500" }}>{doc.title}</Text>
                <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{doc.doc_type} · {(doc.content?.split(/\s+/).length || 0).toLocaleString()} words</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Open Actions — tappable, toggle complete */}
        {pending.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <SectionHeader title="OPEN ACTIONS" count={pending.length} route="/(tabs)/studio/actions" />
            {pending.slice(0, 4).map((d) => {
              const cat = getCat(d.idea?.category || "premise");
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => { toggle(d.id, d.is_complete); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: cat.color }}
                  activeOpacity={0.7}
                >
                  <Text numberOfLines={2} style={{ fontSize: 14, color: C.textSecondary, lineHeight: 22 }}>{d.text}</Text>
                  <Text style={{ fontSize: 9, color: cat.color, marginTop: 6, letterSpacing: 1 }}>{cat.icon} {cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Tasks — tappable, toggle complete */}
        {tasks.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <SectionHeader title="TASKS" count={tasks.length} route="/(tabs)/studio/tasks" />
            {tasks.slice(0, 4).map((t) => {
              const overdue = t.due_date && new Date(t.due_date) < new Date();
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => { toggle(t.id, t.is_complete); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 8, flexDirection: "row", alignItems: "flex-start", gap: 12 }}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: C.textMuted, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={2} style={{ fontSize: 14, color: C.textPrimary, lineHeight: 22 }}>{t.text}</Text>
                    {t.due_date && (
                      <Text style={{ fontSize: 10, color: overdue ? C.red : C.textMuted, marginTop: 4 }}>
                        Due {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {overdue ? " — overdue" : ""}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bottom CTAs */}
        <View style={{ marginTop: 36, flexDirection: "row", gap: 10 }}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/studio/pulse")} activeOpacity={0.7}
            style={{ flex: 1, backgroundColor: C.purple + "15", borderRadius: 14, padding: 18, alignItems: "center" }}>
            <Text style={{ fontSize: 18, color: C.purple, marginBottom: 6 }}>✦</Text>
            <Text style={{ fontSize: 13, color: C.purple, fontWeight: "500" }}>Get a Pulse</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/studio/insight")} activeOpacity={0.7}
            style={{ flex: 1, backgroundColor: C.gold + "15", borderRadius: 14, padding: 18, alignItems: "center" }}>
            <Text style={{ fontSize: 18, color: C.gold, marginBottom: 6 }}>◈</Text>
            <Text style={{ fontSize: 13, color: C.gold, fontWeight: "500" }}>Run Insight</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
