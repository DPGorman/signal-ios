import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUser } from "@/stores/useUser";
import { useProjects } from "@/stores/useProjects";
import { useIdeas } from "@/stores/useIdeas";
import { useDeliverables } from "@/stores/useDeliverables";
import { useCanon } from "@/stores/useCanon";
import { useConnections } from "@/stores/useConnections";
import { C } from "@/lib/constants";

export default function RootLayout() {
  const loadUser = useUser((s) => s.loadUser);
  const user = useUser((s) => s.user);
  const loadProjects = useProjects((s) => s.loadProjects);
  const current = useProjects((s) => s.current);

  // Step 1: load user
  useEffect(() => { loadUser(); }, []);

  // Step 2: once user loads, load projects
  useEffect(() => {
    if (user?.id) {
      loadProjects(user.id);
    }
  }, [user?.id]);

  // Step 3: once current project is set, load all project-scoped data
  useEffect(() => {
    if (user?.id && current?.id) {
      useIdeas.getState().loadIdeas(user.id, current.id);
      useDeliverables.getState().loadDeliverables(user.id, current.id);
      useCanon.getState().loadCanon(user.id, current.id);
      useConnections.getState().loadConnections();
    }
  }, [user?.id, current?.id]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: "slide_from_right" }} />
    </>
  );
}
