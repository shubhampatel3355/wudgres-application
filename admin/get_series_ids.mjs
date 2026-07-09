import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://iglmngvjazarthujdofo.supabase.co', 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O');

async function main() {
  const { data: series } = await supabase.from('series').select('id, name').order('name');
  for (const s of series) {
    console.log(`${s.name}  →  ${s.id}`);
  }
}
main();
