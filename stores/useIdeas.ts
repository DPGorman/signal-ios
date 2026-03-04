import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { callAI } from "@/lib/ai";

export type Idea = {
  id: string;
  user_id: string;
  project_id?: string;
  text: string;
  category: string;
  ai_note: string;
  inspiration_question?: string;
  signal_strength: number;
  canon_resonance?: string;
  source: string;
  created_at: string;
  dimensions?: { label: string }[];
};

type IdeasStore = {
  ideas: Idea[];
  isLoading: boolean;
  isAnalyzing: boolean;
  loadIdeas: (userId: string, projectId?: string) => Promise<void>;
  captureIdea: (
    text: string, context: string, userId: string,
    projectName: string, canonDocs: any[], deliverables: any[],
    projectId?: string
  ) => Promise<Idea | null>;
  deleteIdea: (id: string) => Promise<void>;
};

export const useIdeas = create<IdeasStore>((set, get) => ({
  ideas: [],
  isLoading: true,
  isAnalyzing: false,

  loadIdeas: async (userId, projectId) => {
    let query = supabase
      .from("ideas")
      .select("*, dimensions(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    const { data } = await query;
    set({ ideas: data || [], isLoading: false });
  },

  captureIdea: async (text, context, userId, projectName, canonDocs, deliverables, projectId) => {
    set({ isAnalyzing: true });
    try {
      const { ideas } = get();
      const activeDocs = canonDocs.filter((d: any) => d.is_active);
      const canonContext = activeDocs.slice(0, 3).map((d: any) => `[${d.title}]:\n${d.content.slice(0, 800)}`).join("\n\n");
      const existing = ideas.slice(0, 20).map((i) => `"${i.text.slice(0, 100)}"`).join("\n");
      const openInvites = deliverables.filter((d: any) => !d.is_complete && d.type !== 'task').slice(0, 15).map((d: any) => `"${d.text}"`).join("\n");

      const analysis = await callAI(
        `You are a world-class script editor on a specific creative project.

${canonContext ? `CANON:\n${canonContext}\n\n` : ""}EXISTING IDEAS:\n${existing || "None yet."}

OPEN INVITATIONS:\n${openInvites || "None yet."}

${context ? `WHY THIS FELT IMPORTANT:\n"${context}"\n\n` : ""}Rules: if substantially same as existing idea, say so in aiNote and set signalStrength to 1. Max 2 invitations. signalStrength: 1=noise, 2=interesting, 3=strong, 4=urgent, 5=essential.

Raw JSON only:
{"category":"premise|character|scene|dialogue|arc|production|research|business","dimensions":["level 1","level 2"],"aiNote":"specific insight","invitations":[],"signalStrength":3,"canonResonance":""}`,
        `Project: ${projectName}\n\nNew idea: "${text}"`,
        1200
      );

      const { data: saved } = await supabase
        .from("ideas")
        .insert([{
          user_id: userId, project_id: projectId || null, text, source: "app",
          category: analysis.category || "premise", ai_note: analysis.aiNote || "",
          inspiration_question: context || null, signal_strength: analysis.signalStrength || 3,
          canon_resonance: analysis.canonResonance || "",
        }])
        .select()
        .single();

      if (!saved) return null;

      if (analysis.dimensions?.length) {
        await supabase.from("dimensions").insert(analysis.dimensions.map((label: string) => ({ idea_id: saved.id, label })));
      }
      if (analysis.invitations?.length) {
        await supabase.from("deliverables").insert(
          analysis.invitations.map((t: string) => ({ idea_id: saved.id, user_id: userId, project_id: projectId || null, text: t, type: "creative" }))
        );
      }

      const newIdea = { ...saved, dimensions: (analysis.dimensions || []).map((label: string) => ({ label })) };
      set({ ideas: [newIdea, ...get().ideas] });
      return newIdea;
    } catch (e) { console.error("Capture:", e); return null; }
    finally { set({ isAnalyzing: false }); }
  },

  deleteIdea: async (id) => {
    await supabase.from("connections").delete().or(`idea_id_a.eq.${id},idea_id_b.eq.${id}`);
    await supabase.from("deliverables").delete().eq("idea_id", id);
    await supabase.from("dimensions").delete().eq("idea_id", id);
    await supabase.from("replies").delete().eq("idea_id", id);
    await supabase.from("ideas").delete().eq("id", id);
    set({ ideas: get().ideas.filter((i) => i.id !== id) });
  },
}));
