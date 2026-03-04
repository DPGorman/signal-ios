import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type CanonDoc = {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  doc_type: string;
  content: string;
  is_active: boolean;
  created_at: string;
};

type CanonStore = {
  canonDocs: CanonDoc[];
  loadCanon: (userId: string, projectId?: string) => Promise<void>;
  toggleActive: (id: string, current: boolean) => Promise<void>;
  deleteDoc: (id: string) => Promise<void>;
  uploadDoc: (userId: string, title: string, type: string, content: string, projectId?: string) => Promise<void>;
};

export const useCanon = create<CanonStore>((set, get) => ({
  canonDocs: [],

  loadCanon: async (userId, projectId) => {
    let query = supabase.from("canon_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    const { data } = await query;
    set({ canonDocs: data || [] });
  },

  toggleActive: async (id, current) => {
    await supabase.from("canon_documents").update({ is_active: !current }).eq("id", id);
    set({ canonDocs: get().canonDocs.map((d) => d.id === id ? { ...d, is_active: !current } : d) });
  },

  deleteDoc: async (id) => {
    await supabase.from("canon_documents").delete().eq("id", id);
    set({ canonDocs: get().canonDocs.filter((d) => d.id !== id) });
  },

  uploadDoc: async (userId, title, type, content, projectId) => {
    const { data } = await supabase
      .from("canon_documents")
      .insert([{ user_id: userId, title, doc_type: type, content, is_active: true, project_id: projectId || null }])
      .select().single();
    if (data) set({ canonDocs: [data, ...get().canonDocs] });
  },
}));
