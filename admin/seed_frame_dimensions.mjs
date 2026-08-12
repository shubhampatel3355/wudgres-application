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

// ──────────────────────────────────────────────
// DEFAULT DATA (mirrors the hardcoded app data)
// ──────────────────────────────────────────────

const nfcFrameRows = [
  { description: 'FRAME SECTION 75X50',  col2: '0.950 KG / RFT', col3: '165 / RFT', sort_order: 1 },
  { description: 'FRAME SECTION 100X63', col2: '1.750 KG / RFT', col3: '320 / RFT', sort_order: 2 },
  { description: 'FRAME SECTION 125x63', col2: '2.250 KG / RFT', col3: '385 / RFT', sort_order: 3 },
];

const windowShutterRows = [
  { description: '67MM X 32MM Height Upto 48 Inches',  col2: '295.00',  sort_order: 1 },
  { description: '67MM X 32MM Height above 48 Inches', col2: '320.00',  sort_order: 2 },
  { description: '92MM X 32MM Height Upto 48 Inches',  col2: '395.00',  sort_order: 3 },
  { description: '92MM X 32MM Height above 48 Inches', col2: '420.00',  sort_order: 4 },
];

const engWoodFrameRows = [
  { description: 'FRAME SECTION 3.5"x2.5"', col2: "3' / 6' / 7' / 8'", col3: '--',        col4: '300 / RFT', col5: '205 / RFT', sort_order: 1 },
  { description: 'FRAME SECTION 4"x3"',     col2: "3' / 6' / 7' / 8'", col3: '480 / RFT', col4: '360 / RFT', col5: '252 / RFT', sort_order: 2 },
  { description: 'FRAME SECTION 5"x3"',     col2: "3' / 6' / 7' / 8'", col3: '600 / RFT', col4: '450 / RFT', col5: '315 / RFT', sort_order: 3 },
  { description: 'FRAME SECTION 6"x3"',     col2: "3' / 6' / 7' / 8'", col3: '740 / RFT', col4: '555 / RFT', col5: '--',        sort_order: 4 },
  { description: 'FRAME SECTION 6"x4"',     col2: "3' / 6' / 7' / 8'", col3: '985 / RFT', col4: '740 / RFT', col5: '--',        sort_order: 5 },
  { description: 'FRAME SECTION 9"x3"',     col2: "3' / 6' / 7' / 8'", col3: '1110 / RFT',col4: '833 / RFT', col5: '--',        sort_order: 6 },
  { description: 'FRAME SECTION 9"x4"',     col2: "3' / 6' / 7' / 8'", col3: '1480 / RFT',col4: '--',        col5: '--',        sort_order: 7 },
  { description: 'FRAME SECTION 12"x4"',    col2: "3' / 6' / 7' / 8'", col3: '2030 / RFT',col4: '--',        col5: '--',        sort_order: 8 },
];

async function seedCategory(slug, rows) {
  console.log(`\nSeeding ${slug}...`);

  // Check if already seeded
  const { data: existing } = await supabase
    .from('frame_dimensions')
    .select('id')
    .eq('series_slug', slug);

  if (existing && existing.length > 0) {
    console.log(`  ✓ Already has ${existing.length} rows — skipping.`);
    return;
  }

  const payload = rows.map(r => ({ ...r, series_slug: slug }));
  const { error } = await supabase.from('frame_dimensions').insert(payload);
  if (error) {
    console.error(`  ✗ Error:`, error.message);
  } else {
    console.log(`  ✓ Inserted ${rows.length} rows.`);
  }
}

async function main() {
  console.log('Seeding frame_dimensions table...');
  await seedCategory('nfc-frames', nfcFrameRows);
  await seedCategory('window-shutters', windowShutterRows);
  await seedCategory('eng-wood-frames', engWoodFrameRows);
  console.log('\nDone!');
}

main();
