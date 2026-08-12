import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
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

async function seedNfc() {
  console.log('Checking for NFC series...');
  
  const seriesToInsert = [
    { id: '10000000-0000-0000-0000-000000000101', name: 'NFC Doors', slug: 'nfc-doors', sort_order: 90 },
    { id: '10000000-0000-0000-0000-000000000102', name: 'NFC Frames', slug: 'nfc-frames', sort_order: 91 }
  ];

  for (const s of seriesToInsert) {
    const { data: existing } = await supabase.from('series').select('*').eq('slug', s.slug).single();
    if (!existing) {
      console.log(`Inserting ${s.name}...`);
      const { error } = await supabase.from('series').insert([{
        name: s.name,
        slug: s.slug
      }]);
      if (error) console.error(`Error inserting ${s.name}:`, error);
      else console.log(`Inserted ${s.name} successfully.`);
    } else {
      console.log(`${s.name} already exists.`);
    }
  }
}

seedNfc();
