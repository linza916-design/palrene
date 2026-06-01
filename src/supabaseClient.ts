import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://nbzicsevsjmdgnvdsypz.supabase.co";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_VZ9SHIyNgJWWETEmEHfDHQ_X8l2RRQo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
