import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hjqhkpnhwjkowodiirbj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcWhrcG5od2prb3dvZGlpcmJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Mzc3NDYsImV4cCI6MjA3MDIxMzc0Nn0.XdK5lyuu_j_cG8-mz1phzNcUvOiRX71GkMCcvHrNKwg";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
