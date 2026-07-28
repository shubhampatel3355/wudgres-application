import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('app_hero_content').select('*');
  console.log("Table:", data);
  console.log("Error:", error);
}

test();
