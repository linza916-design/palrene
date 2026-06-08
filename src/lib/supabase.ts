import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Cache the client instance on the window object during local development
if (!(window as any).__supabaseClient) {
  (window as any).__supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = (window as any).__supabaseClient;
