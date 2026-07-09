import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: rules } = await supabase.from('pricing_rules').select('series_id, finish, shade');
  
  const { data: series } = await supabase.from('series').select('id, name');
  
  const rulesWithSeries = rules.map(r => {
    const s = series.find(s => s.id === r.series_id);
    return {
      series_name: s ? s.name : 'Unknown',
      finish: r.finish,
      shade: r.shade
    };
  });
  
  console.log("All pricing rules:");
  console.dir(rulesWithSeries, { maxArrayLength: null });
}

test().catch(console.error);
