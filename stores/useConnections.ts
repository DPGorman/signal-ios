import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Connection = {
  id: string;
  idea_id_a: string;
  idea_id_b: string;
  reason: string;
  strength: number;
};

type ConnectionsStore = {
  connections: Connection[];
  loadConnections: () => Promise<void>;
};

export const useConnections = create<ConnectionsStore>((set) => ({
  connections: [],

  loadConnections: async () => {
    const { data } = await supabase.from("connections").select("*");
    set({ connections: data || [] });
  },
}));
