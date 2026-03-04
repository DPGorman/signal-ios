import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="capture" />
      <Tabs.Screen name="library/index" options={{ href: null }} />
      <Tabs.Screen name="library/[id]" options={{ href: null }} />
      <Tabs.Screen name="canon/index" options={{ href: null }} />
      <Tabs.Screen name="canon/[id]" options={{ href: null }} />
      <Tabs.Screen name="studio/index" options={{ href: null }} />
      <Tabs.Screen name="studio/actions" options={{ href: null }} />
      <Tabs.Screen name="studio/pulse" options={{ href: null }} />
      <Tabs.Screen name="studio/insight" options={{ href: null }} />
      <Tabs.Screen name="studio/invitation" options={{ href: null }} />
      <Tabs.Screen name="studio/tasks" options={{ href: null }} />
      <Tabs.Screen name="studio/projects" options={{ href: null }} />
    </Tabs>
  );
}
