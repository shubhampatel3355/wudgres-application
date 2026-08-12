import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Load credentials ─────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=').slice(1).join('=').trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=').slice(1).join('=').trim();
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Could not read Supabase credentials from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── NFC Images ────────────────────────────────────────────────────────────────
// Source: app/src/assets/images/door/nfc/
const NFC_DIR = path.join(__dirname, '..', 'app', 'src', 'assets', 'images', 'door', 'nfc');
const BUCKET = 'category-images';

const nfcImages = [
  {
    key: 'nfc-legend',
    file: 'NFC Legend.png',
    storagePath: 'nfc/nfc-legend.png',
    description: 'NFC Legend Door — used in NfcDoorScreen & NfcDoorDetailScreen',
  },
  {
    key: 'nfc-rich',
    file: 'NFC rich.png',
    storagePath: 'nfc/nfc-rich.png',
    description: 'NFC Rich Door — used in NfcDoorScreen & NfcDoorDetailScreen',
  },
  {
    key: 'nfc-eco-rich',
    file: 'nfc_eco_rich.png',
    storagePath: 'nfc/nfc-eco-rich.png',
    description: 'NFC Eco Rich Door — in nfc folder (available for future use)',
  },
];

// ─── Step 1: Verify ────────────────────────────────────────────────────────────
console.log('\n📋 STEP 1: Verifying NFC source images...\n');
let allOk = true;
for (const img of nfcImages) {
  const fullPath = path.join(NFC_DIR, img.file);
  if (fs.existsSync(fullPath)) {
    const size = (fs.statSync(fullPath).size / 1024).toFixed(1);
    console.log(`  ✅ [${img.key}]  ${img.file}  (${size} KB)`);
    console.log(`     → ${img.description}`);
  } else {
    console.log(`  ❌ MISSING: ${fullPath}`);
    allOk = false;
  }
}

if (!allOk) {
  console.error('\n❌ Verification failed. Aborting.');
  process.exit(1);
}

console.log('\n✅ All NFC images verified.\n');

// ─── Step 2: Upload ────────────────────────────────────────────────────────────
console.log('📤 STEP 2: Uploading to Supabase Storage...\n');

const results = [];

async function seedNfcImages() {
  for (const img of nfcImages) {
    const localPath = path.join(NFC_DIR, img.file);
    const fileBuffer = fs.readFileSync(localPath);

    console.log(`  📁 Uploading [${img.key}] → ${BUCKET}/${img.storagePath}`);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(img.storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ❌ Upload failed for [${img.key}]:`, uploadError.message);
      results.push({ key: img.key, success: false });
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(img.storagePath);

    const publicUrl = urlData?.publicUrl;
    console.log(`  🔗 URL: ${publicUrl}`);
    results.push({ key: img.key, url: publicUrl, success: true });
    console.log(`  ✅ [${img.key}] uploaded successfully!\n`);
  }

  console.log('\n─────────────────────────────────────────────');
  console.log('📊 SEED SUMMARY\n');
  results.forEach(r => {
    if (r.success) {
      console.log(`  ✅ ${r.key}`);
      console.log(`     ${r.url}\n`);
    } else {
      console.log(`  ❌ ${r.key} — FAILED\n`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎉 ${successCount}/${nfcImages.length} NFC images seeded to Supabase Storage.`);
  console.log('⚠️  Source files are unchanged. Verify in the app before deleting.\n');
}

seedNfcImages();
