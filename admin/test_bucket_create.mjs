import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('run_sql', { sql: "INSERT INTO storage.buckets (id, name, public) VALUES ('app-content', 'app-content', true);" });
  console.log("Result:", data, error);
}

test();
