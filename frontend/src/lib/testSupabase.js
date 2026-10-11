
import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .limit(5);

  if (error) {
    console.error("Supabase read error:", error.message);
    return;
  }

  console.log("Supabase connection successful!");
  console.log("Projects data:", data);
}
