import { createClient } from '@supabase/supabase-js';

// Use the EXACT same credentials as the mobile app
const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseAnonKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing with mobile app credentials...\n');

  const { data, error } = await supabase
    .from('frame_dimensions')
    .select('*')
    .eq('series_slug', 'eng-wood-frames')
    .order('sort_order');

  if (error) {
    console.error('ERROR:', error.message, error.code, error.hint);
  } else {
    console.log(`Got ${data.length} rows:`);
    data.forEach(r => console.log(`  - ${r.description} | col5=${r.col5}`));
  }
}

test();
