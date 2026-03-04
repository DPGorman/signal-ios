import { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Keyboard,
  KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView,
  Platform, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { C } from "@/lib/constants";
import { useUser } from "@/stores/useUser";
import { useIdeas } from "@/stores/useIdeas";
import { useDeliverables } from "@/stores/useDeliverables";
import { useCanon } from "@/stores/useCanon";

export default function InvitationScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const user = useUser((s) => s.user);
  const captureIdea = useIdeas((s) => s.captureIdea);
  const isAnalyzing = useIdeas((s) => s.isAnalyzing);
  const deliverables = useDeliverables((s) => s.deliverables);
  const canonDocs = useCanon((s) => s.canonDocs);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (!text.trim() || !user || isAnalyzing) return;
    Keyboard.dismiss();
    const saved = await captureIdea(
      text.trim(), q || "", user.id, user.project_name, canonDocs, deliverables
    );
    if (saved) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);
    } else {
      Alert.alert("Failed", "Try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 36 }}>
              <Text style={{ color: C.gold, fontSize: 14 }}>← Home</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 24, color: C.textMuted, fontStyle: "italic", lineHeight: 38, marginBottom: 48 }}>
              {q || ""}
            </Text>

            {done ? (
              <View>
                <Text style={{ fontSize: 14, color: C.green, letterSpacing: 1, fontWeight: "500", marginBottom: 24 }}>
                  Signal captured.
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => { setDone(false); setText(""); setTimeout(() => inputRef.current?.focus(), 100); }}
                    style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 18, alignItems: "center" }}
                  >
                    <Text style={{ color: C.textSecondary, fontSize: 14, fontWeight: "500" }}>Write More</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/")}
                    style={{ flex: 1, backgroundColor: C.gold, borderRadius: 14, padding: 18, alignItems: "center" }}
                  >
                    <Text style={{ color: C.bg, fontSize: 14, fontWeight: "600" }}>Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <TextInput
                  ref={inputRef}
                  value={text}
                  onChangeText={setText}
                  placeholder="Write your response..."
                  placeholderTextColor={C.textDisabled}
                  multiline
                  blurOnSubmit={false}
                  autoFocus
                  style={{
                    backgroundColor: C.surface, borderRadius: 14, color: C.textPrimary,
                    fontSize: 17, lineHeight: 28, padding: 20, minHeight: 160, maxHeight: 280,
                    textAlignVertical: "top", marginBottom: 28,
                  }}
                />
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!text.trim() || isAnalyzing}
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
