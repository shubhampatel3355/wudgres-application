const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: series } = await supabase.from('series').select('id, name');
  const divine = series.find(s => s.name === 'Divine');
  console.log("Divine ID:", divine?.id);
  
  if (divine) {
    const { data: rules } = await supabase.from('pricing_rules').select('finish, shade').eq('series_id', divine.id);
    console.log("Rules:", rules);
    
    const finishes = Array.from(new Set(rules.map(d => d.finish).filter(Boolean))).join(', ');
    const shades = Array.from(new Set(rules.map(d => d.shade).filter(Boolean))).join(', ');
    
    console.log("Pricing Finishes:", finishes);
    console.log("Pricing Shades:", shades);
  }
}

test().catch(console.error);
