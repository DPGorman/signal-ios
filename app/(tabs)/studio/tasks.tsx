import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Keyboard, Alert, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C, CATEGORIES } from "@/lib/constants";
import { useUser } from "@/stores/useUser";
import { useProjects } from "@/stores/useProjects";
import { useDeliverables, type Deliverable, type Step } from "@/stores/useDeliverables";

const DAY_MS = 86400000;

// ─── Smart Lists ───
const SMART_LISTS = [
  { id: "session", label: "Today's Session", icon: "☀", color: C.gold },
  { id: "starred", label: "Starred", icon: "★", color: C.gold },
  { id: "planned", label: "Planned", icon: "▦", color: C.blue },
  { id: "all", label: "All Tasks", icon: "▤", color: C.textSecondary },
] as const;

const DUE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next Week", days: 7 },
] as const;

function getDateStr(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date.getTime() - today.getTime()) / DAY_MS);
  if (diff < -1) return { text: `${Math.abs(diff)}d overdue`, color: C.red };
  if (diff === -1) return { text: "Yesterday", color: C.red };
  if (diff === 0) return { text: "Today", color: C.gold };
  if (diff === 1) return { text: "Tomorrow", color: C.gold };
  if (diff <= 7) return { text: date.toLocaleDateString(undefined, { weekday: "short" }), color: C.textMuted };
  return { text: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }), color: C.textMuted };
}

// ─── Task Detail Modal ───
function TaskDetailModal({
  task,
  visible,
  onClose,
}: {
  task: Deliverable | null;
  visible: boolean;
  onClose: () => void;
}) {
  const toggle = useDeliverables((s) => s.toggle);
  const updateTask = useDeliverables((s) => s.updateTask);
  const deleteTask = useDeliverables((s) => s.deleteTask);
  const starTask = useDeliverables((s) => s.starTask);
  const addToSession = useDeliverables((s) => s.addToSession);
  const removeFromSession = useDeliverables((s) => s.removeFromSession);

  const [newStep, setNewStep] = useState("");
  const [notes, setNotes] = useState(task?.notes || "");
  const [showDueOptions, setShowDueOptions] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setNotes(task?.notes || "");
    setShowDueOptions(false);
    setNewStep("");
  }, [task?.id]);

  if (!task) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const inSession = task.session_date === todayStr;
  const steps: Step[] = task.steps || [];
  const doneSteps = steps.filter((s) => s.done).length;
  const due = formatRelativeDate(task.due_date);
  const cat = task.list_name ? CATEGORIES.find((c) => c.id === task.list_name) : null;

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => updateTask(task.id, { notes: val }), 800);
  };

  const handleAddStep = () => {
    const t = newStep.trim();
    if (!t) return;
    const step: Step = { id: Date.now().toString(), text: t, done: false };
    updateTask(task.id, { steps: [...steps, step] });
    setNewStep("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleStep = (stepId: string) => {
    updateTask(task.id, { steps: steps.map((s) => s.id === stepId ? { ...s, done: !s.done } : s) });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteStep = (stepId: string) => {
    updateTask(task.id, { steps: steps.filter((s) => s.id !== stepId) });
  };

  const setDueDate = (dateStr: string | null) => {
    updateTask(task.id, { due_date: dateStr || undefined });
    setShowDueOptions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = () => {
    Alert.alert("Delete Task?", task.text.slice(0, 80), [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: () => {
          deleteTask(task.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: C.gold, fontSize: 15 }}>Done</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => { starTask(task.id, !task.is_starred); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <Text style={{ fontSize: 24, color: task.is_starred ? C.gold : C.textDisabled }}>
                {task.is_starred ? "★" : "☆"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Task title + checkbox */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 20 }}>
              <TouchableOpacity onPress={() => { toggle(task.id, task.is_complete); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 8, marginTop: 2,
                  borderWidth: 2, borderColor: task.is_complete ? C.green : C.textMuted,
                  backgroundColor: task.is_complete ? C.green + "20" : "transparent",
                  justifyContent: "center", alignItems: "center",
                }}>
                  {task.is_complete && <Text style={{ color: C.green, fontSize: 14 }}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text style={{
                flex: 1, fontSize: 20, color: C.textPrimary, fontWeight: "600", lineHeight: 28,
                textDecorationLine: task.is_complete ? "line-through" : "none",
                opacity: task.is_complete ? 0.5 : 1,
              }}>{task.text}</Text>
            </View>

            {/* Steps */}
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: "600", marginBottom: 12 }}>
                STEPS {steps.length > 0 && `(${doneSteps}/${steps.length})`}
              </Text>
              {steps.map((s) => (
                <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border + "33" }}>
                  <TouchableOpacity onPress={() => toggleStep(s.id)}>
                    <View style={{
                      width: 18, height: 18, borderRadius: 5,
                      borderWidth: 1.5, borderColor: s.done ? C.green : C.textMuted,
                      backgroundColor: s.done ? C.green + "20" : "transparent",
                      justifyContent: "center", alignItems: "center",
                    }}>
                      {s.done && <Text style={{ color: C.green, fontSize: 10 }}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  <Text style={{
                    flex: 1, fontSize: 14, color: s.done ? C.textDisabled : C.textSecondary,
                    textDecorationLine: s.done ? "line-through" : "none", lineHeight: 20,
                  }}>{s.text}</Text>
                  <TouchableOpacity onPress={() => deleteStep(s.id)}>
                    <Text style={{ color: C.textDisabled, fontSize: 12, padding: 4 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                <Text style={{ color: C.textDisabled, fontSize: 14 }}>+</Text>
                <TextInput
                  value={newStep}
                  onChangeText={setNewStep}
                  onSubmitEditing={handleAddStep}
                  placeholder="Add a step"
                  placeholderTextColor={C.textDisabled}
                  style={{ flex: 1, color: C.textPrimary, fontSize: 14, paddingVertical: 8 }}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Session toggle */}
            <TouchableOpacity
              onPress={() => {
                if (inSession) removeFromSession(task.id);
                else addToSession(task.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text style={{ fontSize: 18, color: inSession ? C.gold : C.textMuted }}>☀</Text>
              <Text style={{ fontSize: 14, color: inSession ? C.gold : C.textSecondary }}>
                {inSession ? "Remove from Today's Session" : "Add to Today's Session"}
              </Text>
            </TouchableOpacity>

            {/* Due date */}
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setShowDueOptions(!showDueOptions)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 18, color: due ? due.color : C.textMuted }}>◷</Text>
                <Text style={{ flex: 1, fontSize: 14, color: due ? due.color : C.textSecondary }}>
                  {due ? `Due ${due.text}` : "Add due date"}
                </Text>
                {task.due_date && (
                  <TouchableOpacity onPress={() => setDueDate(null)}>
                    <Text style={{ color: C.textDisabled, fontSize: 12 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              {showDueOptions && (
                <View style={{ marginTop: 12, gap: 6 }}>
                  {DUE_PRESETS.map((p) => (
                    <TouchableOpacity key={p.label} onPress={() => setDueDate(getDateStr(p.days))}
                      style={{ backgroundColor: C.surfaceHigh, borderRadius: 8, padding: 12 }}>
                      <Text style={{ color: C.textSecondary, fontSize: 14 }}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Category / List */}
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: "600", marginBottom: 12 }}>LIST</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <TouchableOpacity onPress={() => updateTask(task.id, { list_name: undefined })}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                    backgroundColor: !task.list_name ? C.gold + "22" : C.surfaceHigh,
                    borderWidth: 1, borderColor: !task.list_name ? C.gold + "44" : C.border,
                  }}>
                  <Text style={{ fontSize: 12, color: !task.list_name ? C.gold : C.textMuted }}>Inbox</Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity key={cat.id} onPress={() => updateTask(task.id, { list_name: cat.id })}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                      backgroundColor: task.list_name === cat.id ? cat.color + "22" : C.surfaceHigh,
                      borderWidth: 1, borderColor: task.list_name === cat.id ? cat.color + "44" : C.border,
                    }}>
                    <Text style={{ fontSize: 12, color: task.list_name === cat.id ? cat.color : C.textMuted }}>
                      {cat.icon} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: "600", marginBottom: 12 }}>NOTES</Text>
              <TextInput
                value={notes}
                onChangeText={handleNotesChange}
                placeholder="Add a note..."
                placeholderTextColor={C.textDisabled}
                multiline
                style={{
                  color: C.textPrimary, fontSize: 14, lineHeight: 22,
                  minHeight: 80, textAlignVertical: "top",
                }}
              />
            </View>

            {/* Meta + Delete */}
            <View style={{ paddingVertical: 16, gap: 12 }}>
              <Text style={{ fontSize: 12, color: C.textDisabled }}>
                Created {new Date(task.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                {task.completed_at && ` · Completed ${new Date(task.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
              </Text>
              {cat && <Text style={{ fontSize: 12, color: cat.color }}>{cat.icon} {cat.label}</Text>}
              <TouchableOpacity onPress={handleDelete} style={{ alignSelf: "flex-start", marginTop: 8 }}>
                <Text style={{ color: C.red, fontSize: 14 }}>Delete Task</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Task Row ───
function TaskRow({
  task,
  onPress,
  onToggle,
  onStar,
  onAddToSession,
}: {
  task: Deliverable;
  onPress: () => void;
  onToggle: () => void;
  onStar: () => void;
  onAddToSession?: () => void;
}) {
  const due = formatRelativeDate(task.due_date);
  const steps: Step[] = task.steps || [];
  const doneSteps = steps.filter((s) => s.done).length;
  const cat = task.list_name ? CATEGORIES.find((c) => c.id === task.list_name) : null;
  const todayStr = new Date().toISOString().split("T")[0];
  const inSession = task.session_date === todayStr;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{
        flexDirection: "row", alignItems: "flex-start", gap: 12,
        backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 8,
      }}>
      <TouchableOpacity onPress={onToggle} hitSlop={8}>
        <View style={{
          width: 22, height: 22, borderRadius: 6, marginTop: 1,
          borderWidth: 1.5, borderColor: task.is_complete ? C.green : C.textMuted,
          backgroundColor: task.is_complete ? C.green + "20" : "transparent",
          justifyContent: "center", alignItems: "center",
        }}>
          {task.is_complete && <Text style={{ color: C.green, fontSize: 12 }}>✓</Text>}
        </View>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 15, color: task.is_complete ? C.textDisabled : C.textPrimary,
          textDecorationLine: task.is_complete ? "line-through" : "none",
          lineHeight: 22, opacity: task.is_complete ? 0.5 : 1,
        }}>{task.text}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
          {cat && <Text style={{ fontSize: 10, color: cat.color }}>{cat.icon} {cat.label}</Text>}
          {steps.length > 0 && (
            <Text style={{ fontSize: 10, color: doneSteps === steps.length ? C.green : C.textMuted }}>
              {doneSteps}/{steps.length} steps
            </Text>
          )}
          {due && <Text style={{ fontSize: 10, color: due.color }}>{due.text}</Text>}
          {inSession && <Text style={{ fontSize: 10, color: C.gold }}>☀ Session</Text>}
        </View>
      </View>

      <TouchableOpacity onPress={onStar} hitSlop={8}>
        <Text style={{ fontSize: 20, color: task.is_starred ? C.gold : C.textDisabled + "66", marginTop: 0 }}>
          {task.is_starred ? "★" : "☆"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Suggestion Card ───
function SuggestionCard({
  tasks,
  sessionIds,
  onAdd,
  onClose,
}: {
  tasks: Deliverable[];
  sessionIds: Set<string>;
  onAdd: (id: string) => void;
  onClose: () => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - DAY_MS).toISOString().split("T")[0];

  const suggestions = useMemo(() => {
    const items: (Deliverable & { reason: string })[] = [];
    const seen = new Set<string>();
    const push = (t: Deliverable, reason: string) => {
      if (!seen.has(t.id) && !sessionIds.has(t.id)) { seen.add(t.id); items.push({ ...t, reason }); }
    };
    tasks.filter((t) => !t.is_complete && t.due_date === todayStr).forEach((t) => push(t, "Due today"));
    tasks.filter((t) => !t.is_complete && t.due_date && t.due_date < todayStr).forEach((t) => push(t, "Overdue"));
    tasks.filter((t) => !t.is_complete && t.is_starred).forEach((t) => push(t, "Starred"));
    tasks.filter((t) => !t.is_complete && t.session_date === yesterdayStr).forEach((t) => push(t, "From yesterday"));
    return items.slice(0, 8);
  }, [tasks, sessionIds, todayStr]);

  if (suggestions.length === 0) {
    return (
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 13, color: C.gold, fontWeight: "600" }}>Suggestions</Text>
          <TouchableOpacity onPress={onClose}><Text style={{ color: C.textDisabled }}>✕</Text></TouchableOpacity>
        </View>
        <Text style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic", marginTop: 8 }}>All caught up.</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.gold + "33" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 13, color: C.gold, fontWeight: "600" }}>Suggestions</Text>
        <TouchableOpacity onPress={onClose}><Text style={{ color: C.textDisabled }}>✕</Text></TouchableOpacity>
      </View>
      {suggestions.map((t) => (
        <View key={t.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border + "33" }}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: 13, color: C.textSecondary }}>{t.text}</Text>
            <Text style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{t.reason}</Text>
          </View>
          <TouchableOpacity onPress={() => { onAdd(t.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={{ borderWidth: 1, borderColor: C.gold + "44", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 12, color: C.gold }}>+ Add</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ───
export default function TasksScreen() {
  const user = useUser((s) => s.user);
  const current = useProjects((s) => s.current);
  const deliverables = useDeliverables((s) => s.deliverables);
  const toggle = useDeliverables((s) => s.toggle);
  const addTask = useDeliverables((s) => s.addTask);
  const starTask = useDeliverables((s) => s.starTask);
  const addToSession = useDeliverables((s) => s.addToSession);
  const removeFromSession = useDeliverables((s) => s.removeFromSession);

  const [activeList, setActiveList] = useState("session");
  const [selectedTask, setSelectedTask] = useState<Deliverable | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showDuePresets, setShowDuePresets] = useState(false);
  const [newDue, setNewDue] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const allTasks = useMemo(() => deliverables.filter((d) => d.type === "task"), [deliverables]);
  const openTasks = useMemo(() => allTasks.filter((t) => !t.is_complete), [allTasks]);
  const completedTasks = useMemo(() => allTasks.filter((t) => t.is_complete), [allTasks]);
  const sessionIds = useMemo(() => new Set(openTasks.filter((t) => t.session_date === todayStr).map((t) => t.id)), [openTasks, todayStr]);

  const filteredTasks = useMemo(() => {
    switch (activeList) {
      case "session": return openTasks.filter((t) => sessionIds.has(t.id));
      case "starred": return openTasks.filter((t) => t.is_starred);
      case "planned": return openTasks.filter((t) => t.due_date).sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
      case "all": return openTasks;
      default: return openTasks.filter((t) => t.list_name === activeList);
    }
  }, [activeList, openTasks, sessionIds]);

  // Keep selected task fresh
  React.useEffect(() => {
    if (selectedTask) {
      const fresh = deliverables.find((d) => d.id === selectedTask.id);
      if (fresh) setSelectedTask(fresh);
      else setSelectedTask(null);
    }
  }, [deliverables]);

  const handleAdd = useCallback(async () => {
    const t = text.trim();
    if (!t || !user || busy) return;
    setBusy(true);
    Keyboard.dismiss();
    try {
      await addTask(user.id, t, newDue || undefined, current?.id);
      // If on session view, also add to session
      if (activeList === "session") {
        // The task was just created — we'd need its ID to add to session
        // For now, the user can tap the suggestion to add it
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setText("");
      setNewDue("");
      setShowDuePresets(false);
    } catch (e) {
      console.error("[Signal] addTask error:", e);
    }
    setBusy(false);
  }, [text, user, current, busy, addTask, newDue, activeList]);

  const activeListMeta = SMART_LISTS.find((l) => l.id === activeList) ||
    (() => { const cat = CATEGORIES.find((c) => c.id === activeList); return cat ? { ...cat } : SMART_LISTS[3]; })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.push("/(tabs)" as any)}>
            <Text style={{ color: C.gold, fontSize: 14 }}>← Home</Text>
          </TouchableOpacity>
          {activeList === "session" && (
            <TouchableOpacity onPress={() => setShowSuggestions(!showSuggestions)}>
              <Text style={{ fontSize: 20 }}>💡</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Smart list pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}>
        {SMART_LISTS.map((list) => {
          let count = 0;
          if (list.id === "session") count = sessionIds.size;
          else if (list.id === "starred") count = openTasks.filter((t) => t.is_starred).length;
          else if (list.id === "planned") count = openTasks.filter((t) => t.due_date).length;
          else if (list.id === "all") count = openTasks.length;
          return (
            <TouchableOpacity key={list.id} onPress={() => { setActiveList(list.id); Haptics.selectionAsync(); }}
              style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: activeList === list.id ? list.color + "20" : C.surface,
                borderWidth: 1, borderColor: activeList === list.id ? list.color + "44" : C.border,
              }}>
              <Text style={{ fontSize: 13, color: activeList === list.id ? list.color : C.textMuted }}>{list.icon}</Text>
              <Text style={{ fontSize: 13, color: activeList === list.id ? list.color : C.textSecondary }}>{list.label}</Text>
              {count > 0 && <Text style={{ fontSize: 11, color: C.textDisabled }}>{count}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List header */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <Text style={{ fontSize: 24, color: C.textPrimary, fontWeight: "600" }}>{activeListMeta.label}</Text>
        {activeList === "session" && (
          <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{todayLabel}</Text>
        )}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Suggestions */}
        {activeList === "session" && showSuggestions && (
          <SuggestionCard
            tasks={allTasks}
            sessionIds={sessionIds}
            onAdd={addToSession}
            onClose={() => setShowSuggestions(false)}
          />
        )}

        {/* Quick add */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ color: C.textDisabled, fontSize: 16 }}>+</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleAdd}
              placeholder="Add a task"
              placeholderTextColor={C.textDisabled}
              style={{ flex: 1, color: C.textPrimary, fontSize: 15, paddingVertical: 4 }}
              returnKeyType="done"
            />
          </View>
          {text.trim().length > 0 && (
            <View style={{ marginTop: 12, marginLeft: 26, gap: 8 }}>
              {/* Due date presets */}
              {!showDuePresets ? (
                <TouchableOpacity onPress={() => setShowDuePresets(true)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.border }}>
                  <Text style={{ fontSize: 13, color: C.textMuted }}>◷ {newDue ? formatRelativeDate(newDue)?.text : "Due date"}</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                  {DUE_PRESETS.map((p) => (
                    <TouchableOpacity key={p.label} onPress={() => { setNewDue(getDateStr(p.days)); setShowDuePresets(false); }}
                      style={{ backgroundColor: C.surfaceHigh, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ fontSize: 13, color: C.textSecondary }}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                  {newDue !== "" && (
                    <TouchableOpacity onPress={() => { setNewDue(""); setShowDuePresets(false); }}>
                      <Text style={{ color: C.textDisabled, fontSize: 12, padding: 6 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <TouchableOpacity onPress={handleAdd} disabled={busy}
                style={{
                  backgroundColor: C.gold, borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 4,
                }}>
                <Text style={{ color: C.bg, fontSize: 14, fontWeight: "600" }}>{busy ? "Adding..." : "Add"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Task list */}
        {filteredTasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            onPress={() => setSelectedTask(t)}
            onToggle={() => { toggle(t.id, t.is_complete); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            onStar={() => { starTask(t.id, !t.is_starred); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          />
        ))}

        {/* Empty states */}
        {filteredTasks.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            {activeList === "session" ? (
              <>
                <Text style={{ fontSize: 36, marginBottom: 12 }}>☀</Text>
                <Text style={{ fontSize: 17, color: C.textSecondary, marginBottom: 6 }}>Plan your creative session</Text>
                <Text style={{ fontSize: 13, color: C.textMuted, textAlign: "center", lineHeight: 20 }}>
                  What will you focus on today?{"\n"}Add tasks or tap 💡 for suggestions.
                </Text>
              </>
            ) : activeList === "starred" ? (
              <>
                <Text style={{ fontSize: 36, marginBottom: 12 }}>☆</Text>
                <Text style={{ fontSize: 14, color: C.textMuted }}>Star tasks to mark them as important</Text>
              </>
            ) : (
              <Text style={{ fontSize: 14, color: C.textMuted, fontStyle: "italic" }}>No tasks here yet.</Text>
            )}
          </View>
        )}

        {/* Completed (All view only) */}
        {activeList === "all" && completedTasks.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity onPress={() => setShowCompleted(!showCompleted)}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }}>
              <Text style={{ fontSize: 10, color: C.textDisabled, transform: [{ rotate: showCompleted ? "90deg" : "0deg" }] }}>▶</Text>
              <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, fontWeight: "600" }}>
                COMPLETED ({completedTasks.length})
              </Text>
            </TouchableOpacity>
            {showCompleted && completedTasks.slice(0, 20).map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onPress={() => setSelectedTask(t)}
                onToggle={() => { toggle(t.id, t.is_complete); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                onStar={() => { starTask(t.id, !t.is_starred); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              />
            ))}
          </View>
        )}

        {/* Stats footer */}
        <View style={{ marginTop: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: C.textDisabled }}>{openTasks.length} open · {completedTasks.length} done</Text>
        </View>
      </ScrollView>

      {/* Detail modal */}
      <TaskDetailModal task={selectedTask} visible={!!selectedTask} onClose={() => setSelectedTask(null)} />
    </SafeAreaView>
  );
}
