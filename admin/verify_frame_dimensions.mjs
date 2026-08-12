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

async function verify() {
  console.log('=== Verifying frame_dimensions table ===\n');

  for (const slug of ['nfc-frames', 'window-shutters', 'eng-wood-frames']) {
    const { data, error } = await supabase
      .from('frame_dimensions')
      .select('*')
      .eq('series_slug', slug)
      .order('sort_order');

    if (error) {
      console.error(`[${slug}] ERROR:`, error.message);
    } else {
      console.log(`[${slug}] ${data.length} rows:`);
      data.forEach(r => console.log(`  - ${r.description} | col2=${r.col2} | col3=${r.col3} | col4=${r.col4} | col5=${r.col5}`));
    }
    console.log();
  }
}

verify();
