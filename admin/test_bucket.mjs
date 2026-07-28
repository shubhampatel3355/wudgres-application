import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.storage.getBucket('app-content');
  console.log("Bucket:", data);
  console.log("Error:", error);
}

test();
