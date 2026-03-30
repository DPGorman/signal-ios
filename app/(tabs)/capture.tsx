import { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Keyboard,
  KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView,
  Platform, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C, getCat } from "@/lib/constants";
import { useUser } from "@/stores/useUser";
import { useIdeas } from "@/stores/useIdeas";
import { useDeliverables } from "@/stores/useDeliverables";
import { useCanon } from "@/stores/useCanon";
import { useProjects } from "@/stores/useProjects";

export default function CaptureScreen() {
  const user = useUser((s) => s.user);
  const current = useProjects((s) => s.current);
  const captureIdea = useIdeas((s) => s.captureIdea);
  const isAnalyzing = useIdeas((s) => s.isAnalyzing);
  const deliverables = useDeliverables((s) => s.deliverables);
  const canonDocs = useCanon((s) => s.canonDocs);
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<TextInput>(null);

  const handleCapture = async () => {
    if (!text.trim() || !user || isAnalyzing) return;
    Keyboard.dismiss();
    const saved = await captureIdea(text.trim(), context.trim(), user.id, current?.name || user.project_name, canonDocs, deliverables, current?.id);
    if (saved) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult(saved); setText(""); setContext("");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Capture failed", "Try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => router.push("/(tabs)/")} style={{ marginBottom: 28 }}>
              <Text style={{ color: C.gold, fontSize: 14 }}>← Home</Text>
            </TouchableOpacity>

            {result && !isAnalyzing ? (
              <View>
                <Text style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 14, fontWeight: "600" }}>SIGNAL CAPTURED</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <Text style={{ fontSize: 14, color: getCat(result.category).color }}>{getCat(result.category).icon}</Text>
                  <Text style={{ fontSize: 11, color: getCat(result.category).color, letterSpacing: 1, fontWeight: "500" }}>
                    {getCat(result.category).label.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontSize: 17, color: C.textPrimary, lineHeight: 28, marginBottom: 24 }}>{result.text}</Text>
                {result.ai_note ? (
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 10, fontWeight: "600" }}>ANALYSIS</Text>
                    <Text style={{ fontSize: 15, color: C.textSecondary, lineHeight: 26 }}>{result.ai_note}</Text>
                  </View>
                ) : null}
                <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={() => { setResult(null); setTimeout(() => inputRef.current?.focus(), 100); }}
                    style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 18, alignItems: "center" }}
                  >
                    <Text style={{ color: C.textSecondary, fontSize: 14, fontWeight: "500" }}>Capture Another</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setResult(null); router.push(`/(tabs)/library/${result.id}`); }}
                    style={{ flex: 1, backgroundColor: C.gold, borderRadius: 14, padding: 18, alignItems: "center" }}
                  >
                    <Text style={{ color: C.bg, fontSize: 14, fontWeight: "600" }}>View in Library</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, marginBottom: 14, fontWeight: "500" }}>
                  WHAT'S IN YOUR HEAD RIGHT NOW
                </Text>
                <TextInput
                  ref={inputRef} value={text} onChangeText={setText}
                  placeholder="Don't edit. Don't qualify. Just send the signal."
                  placeholderTextColor={C.textDisabled} multiline blurOnSubmit={false}
                  style={{
                    backgroundColor: C.surface, borderRadius: 14, color: C.textPrimary,
                    fontSize: 17, lineHeight: 28, padding: 20, minHeight: 130, maxHeight: 220,
                    textAlignVertical: "top", marginBottom: 20,
                  }}
                />
                <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, marginBottom: 10, fontWeight: "500" }}>
                  WHY DOES THIS FEEL IMPORTANT? <Text style={{ color: C.textDisabled }}>(optional)</Text>
                </Text>
                <TextInput
                  value={context} onChangeText={setContext} placeholder="Context..."
                  placeholderTextColor={C.textDisabled} returnKeyType="done" onSubmitEditing={Keyboard.dismiss}
                  style={{
                    backgroundColor: C.surface, borderRadius: 14, color: C.textPrimary,
                    fontSize: 15, padding: 18, marginBottom: 32,
                  }}
                />
                <TouchableOpacity
                  onPress={handleCapture} disabled={!text.trim() || isAnalyzing}
                  style={{
                    backgroundColor: !text.trim() || isAnalyzing ? C.surfaceHigh : C.gold,
                    borderRadius: 14, padding: 20, alignItems: "center",
                  }}
                >
                  <Text style={{
                    color: !text.trim() || isAnalyzing ? C.textMuted : C.bg,
                    fontSize: 14, fontWeight: "600", letterSpacing: 1,
                  }}>
                    {isAnalyzing ? "ANALYZING..." : "SEND THE SIGNAL →"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
