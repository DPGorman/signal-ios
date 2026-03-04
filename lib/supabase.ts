import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://krhidwibweznwakaoxjw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyaGlkd2lid2V6bndha2FveGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjYwMzMsImV4cCI6MjA4NzAwMjAzM30.bFMmWor_mWn96SUvz4mBDWSTIfM8zQm2D2VVBiMmKmI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
