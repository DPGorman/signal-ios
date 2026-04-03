import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Step = {
  id: string;
  text: string;
  done: boolean;
};

export type Deliverable = {
  id: string;
  idea_id?: string;
  user_id: string;
  project_id?: string;
  text: string;
  type: "creative" | "task";
  is_complete: boolean;
  completed_at?: string;
  due_date?: string;
  reminder_at?: string;
  priority: number;
  created_at: string;
  idea?: { text: string; category: string };
  is_starred?: boolean;
  session_date?: string;
  steps?: Step[];
  notes?: string;
  list_name?: string;
  duration_minutes?: number;
};

type DeliverablesStore = {
  deliverables: Deliverable[];
  loadDeliverables: (userId: string, projectId?: string) => Promise<void>;
  toggle: (id: string, current: boolean) => Promise<void>;
  addTask: (userId: string, text: string, dueDate?: string, projectId?: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Deliverable>) => Promise<void>;
  starTask: (id: string, starred: boolean) => Promise<void>;
  addToSession: (id: string) => Promise<void>;
  removeFromSession: (id: string) => Promise<void>;
};

export const useDeliverables = create<DeliverablesStore>((set, get) => ({
  deliverables: [],

  loadDeliverables: async (userId, projectId) => {
    let query = supabase
      .from("deliverables")
      .select("*, idea:ideas(text,category)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) console.error("[Signal] loadDeliverables error:", error);
    set({ deliverables: data || [] });
  },

  toggle: async (id, current) => {
    await supabase.from("deliverables").update({
      is_complete: !current,
      completed_at: !current ? new Date().toISOString() : null,
    }).eq("id", id);
    set({ deliverables: get().deliverables.map((d) => d.id === id ? { ...d, is_complete: !current } : d) });
  },

  addTask: async (userId, text, dueDate, projectId) => {
    const insertData: any = {
      user_id: userId,
      text,
      type: "task",
      priority: 2,
    };
    if (projectId) insertData.project_id = projectId;
    // due_date column is type 'date', needs YYYY-MM-DD or null
    if (dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      insertData.due_date = dueDate;
    }

    const { data, error } = await supabase
      .from("deliverables")
      .insert([insertData])
      .select("*, idea:ideas(text,category)")
      .single();

    if (error) {
      console.error("[Signal] addTask error:", error);
      return;
    }
    if (data) set({ deliverables: [data, ...get().deliverables] });
  },

  deleteTask: async (id) => {
    await supabase.from("deliverables").delete().eq("id", id);
    set({ deliverables: get().deliverables.filter((d) => d.id !== id) });
  },

  updateTask: async (id, updates) => {
    set({ deliverables: get().deliverables.map((d) => d.id === id ? { ...d, ...updates } : d) });
    await supabase.from("deliverables").update(updates).eq("id", id);
  },

  starTask: async (id, starred) => {
    set({ deliverables: get().deliverables.map((d) => d.id === id ? { ...d, is_starred: starred } : d) });
    await supabase.from("deliverables").update({ is_starred: starred }).eq("id", id);
  },

  addToSession: async (id) => {
    const todayStr = new Date().toISOString().split("T")[0];
    set({ deliverables: get().deliverables.map((d) => d.id === id ? { ...d, session_date: todayStr } : d) });
    await supabase.from("deliverables").update({ session_date: todayStr }).eq("id", id);
  },

  removeFromSession: async (id) => {
    set({ deliverables: get().deliverables.map((d) => d.id === id ? { ...d, session_date: null } : d) });
    await supabase.from("deliverables").update({ session_date: null }).eq("id", id);
  },
}));
