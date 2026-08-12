import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  const { data: pData } = await supabase.from('products').select('id, name, thickness').ilike('name', '%legend%');
  console.log('Products:', pData);
  
  const { data: sData } = await supabase.from('series').select('id, name, allowed_thicknesses').ilike('name', '%legend%');
  console.log('Series:', sData);
  
  const { data: rData } = await supabase.from('pricing_rules').select('*').eq('series_id', sData?.[0]?.id);
  console.log('Pricing Rules for Series:', rData);
}

checkDb();
