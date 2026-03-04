import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { C } from "@/lib/constants";
import { API_BASE } from "@/lib/constants";

export default function PulseScreen() {
  const [nudge, setNudge] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPulse = async () => {
    setLoading(true);
    setError(null);
    setNudge(null);
    try {
      const res = await fetch(`${API_BASE}/api/pulse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "nudge" }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.nudge) {
        setNudge(data.nudge);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (data.message) {
        setNudge(data.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setNudge(JSON.stringify(data));
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: C.gold, fontSize: 14 }}>← Studio</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 28, color: C.textPrimary, fontWeight: "600", letterSpacing: -0.5, marginBottom: 10 }}>
          Pulse
        </Text>
        <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 36, lineHeight: 24 }}>
          A context-aware creative nudge from Claude, based on the totality of your project.
        </Text>

        {nudge ? (
          <View style={{
            backgroundColor: C.surface, borderRadius: 16, padding: 24,
            marginBottom: 32, borderLeftWidth: 3, borderLeftColor: C.gold,
          }}>
            <Text style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 14, fontWeight: "600" }}>
              PULSE
            </Text>
            <Text style={{ fontSize: 16, color: C.textPrimary, lineHeight: 28 }}>
              {nudge}
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 20, marginBottom: 28 }}>
            <Text style={{ fontSize: 13, color: C.red, lineHeight: 22 }}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={requestPulse}
          disabled={loading}
          style={{
            backgroundColor: loading ? C.surfaceHigh : C.gold,
            borderRadius: 14, padding: 20, alignItems: "center",
          }}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ActivityIndicator color={C.textMuted} size="small" />
              <Text style={{ color: C.textMuted, fontSize: 14, fontWeight: "600", letterSpacing: 1 }}>
                THINKING...
              </Text>
            </View>
          ) : (
            <Text style={{ color: C.bg, fontSize: 14, fontWeight: "600", letterSpacing: 1 }}>
              {nudge ? "REQUEST ANOTHER PULSE" : "REQUEST PULSE →"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
