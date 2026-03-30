import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
};

type ProjectsStore = {
  projects: Project[];
  current: Project | null;
  isLoaded: boolean;
  loadProjects: (userId: string) => Promise<void>;
  setCurrent: (project: Project) => void;
  createProject: (userId: string, name: string, description?: string) => Promise<Project | null>;
};

export const useProjects = create<ProjectsStore>((set, get) => ({
  projects: [],
  current: null,
  isLoaded: false,

  loadProjects: async (userId) => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    const projects = data || [];
    // Always set the first project as current if none selected
    const current = get().current;
    const activeCurrent = current && projects.find(p => p.id === current.id);
    set({
      projects,
      isLoaded: true,
      current: activeCurrent || projects[0] || null,
    });
  },

  setCurrent: (project) => set({ current: project }),

  createProject: async (userId, name, description) => {
    const { data } = await supabase
      .from("projects")
      .insert([{ user_id: userId, name, description }])
      .select()
      .single();
    if (data) {
      set({ projects: [data, ...get().projects], current: data });
    }
    return data;
  },
}));
