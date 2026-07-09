import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  const { data: rules } = await supabase.from('pricing_rules').select('*').order('series_id');
  const { data: series } = await supabase.from('series').select('id, name');
  
  let md = `# Pricing Rules Data\n\n`;
  
  // Group rules by series name
  const grouped = {};
  for (const rule of rules) {
    const s = series.find(s => s.id === rule.series_id);
    const seriesName = s ? s.name : 'Unknown Series';
    if (!grouped[seriesName]) grouped[seriesName] = [];
    grouped[seriesName].push(rule);
  }
  
  for (const [seriesName, seriesRules] of Object.entries(grouped)) {
    md += `## Series: ${seriesName}\n\n`;
    
    // Extract unique shades and finishes
    const uniqueFinishes = Array.from(new Set(seriesRules.map(r => r.finish).filter(Boolean)));
    const uniqueShades = Array.from(new Set(seriesRules.map(r => r.shade).filter(Boolean)));
    
    md += `**Available Finishes:** ${uniqueFinishes.length > 0 ? uniqueFinishes.join(', ') : '*None*'}\n\n`;
    md += `**Available Shades:** ${uniqueShades.length > 0 ? uniqueShades.join(', ') : '*None*'}\n\n`;
    
    // Create a detailed table for the rules
    md += `### Pricing Rules\n\n`;
    md += `| Finish | Shade | Type | Thickness Min | Height Min | Width Min | Price |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    for (const r of seriesRules) {
      md += `| ${r.finish || '-'} | ${r.shade || '-'} | ${r.type || '-'} | ${r.thickness_min || '-'} | ${r.height_min || '-'} | ${r.width_min || '-'} | ₹${r.price} |\n`;
    }
    md += `\n`;
  }
  
  fs.writeFileSync('C:/Users/sures/.gemini/antigravity-ide/brain/f887b129-9cf0-44a2-8aed-c4dc8a738d26/pricing_data.md', md);
  console.log("Artifact generated at pricing_data.md");
}

exportData().catch(console.error);
