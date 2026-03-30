import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  project_name: string;
  email?: string;
  expo_push_token?: string;
};

type UserStore = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loadUser: () => Promise<void>;
};

export const useUser = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  loadUser: async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .limit(1);
      if (error) { set({ error: error.message, isLoading: false }); return; }
      if (data && data.length > 0) {
        set({ user: data[0], isLoading: false });
      } else {
        set({ error: "No user found", isLoading: false });
      }
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },
}));
