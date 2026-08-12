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

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'category-images';
const ASSETS = path.join(__dirname, '..', 'app', 'src', 'assets', 'images');

// ─── Complete NFC Image Map ───────────────────────────────────────────────────
// Screen            | Image File                          | Used As
// ───────────────────────────────────────────────────────────────────────────────
// NfcCategoryScreen | wpc/NFC Doors.png                   | NFC Doors category card
// NfcCategoryScreen | wpc/NFC Frames Bg.png               | NFC Frames category card
// NfcDoorScreen     | door/nfc/NFC Legend.png             | Series tab thumbnail (legend/eco)
// NfcDoorScreen     | door/nfc/NFC rich.png               | Series tab thumbnail (rich)
// NfcDoorScreen     | wpc/NFC Doors.png                   | Default fallback thumbnail
// NfcDoorDetailScreen| door/nfc/NFC Legend.png            | Product hero (already seeded)
// NfcDoorDetailScreen| door/nfc/NFC rich.png              | Product hero (already seeded)
// NfcFrameDetailScreen| wpc/wpc-frame/wpc-frame1.png      | Frame product image 1
// NfcFrameDetailScreen| wpc/wpc-frame/wpc-frame2.png      | Frame product image 2

const nfcImageSet = [
  // Category cards for NFCCategoryScreen (nfcCategory.ts)
  {
    key: 'nfc-doors-category',
    localPath: path.join(ASSETS, 'wpc', 'NFC Doors.png'),
    storagePath: 'nfc/nfc-doors-category.png',
    description: 'NFC Doors category card image (NfcCategoryScreen)',
    updateDb: { table: 'app_category_images', field: 'hero_image_url', id: 'nfc' },
  },
  {
    key: 'nfc-frames-category',
    localPath: path.join(ASSETS, 'wpc', 'NFC Frames Bg.png'),
    storagePath: 'nfc/nfc-frames-category.png',
    description: 'NFC Frames category card image (NfcCategoryScreen)',
    updateDb: null,
  },
  // Door series thumbnails (NfcDoorScreen series tabs) — already in storage from previous seed
  {
    key: 'nfc-legend',
    localPath: path.join(ASSETS, 'door', 'nfc', 'NFC Legend.png'),
    storagePath: 'nfc/nfc-legend.png',
    description: 'NFC Legend door — series thumbnail + product hero (already seeded, re-uploading to confirm)',
    updateDb: null,
  },
  {
    key: 'nfc-rich',
    localPath: path.join(ASSETS, 'door', 'nfc', 'NFC rich.png'),
    storagePath: 'nfc/nfc-rich.png',
    description: 'NFC Rich door — series thumbnail + product hero (already seeded)',
    updateDb: null,
  },
  {
    key: 'nfc-eco-rich',
    localPath: path.join(ASSETS, 'door', 'nfc', 'nfc_eco_rich.png'),
    storagePath: 'nfc/nfc-eco-rich.png',
    description: 'NFC Eco Rich door (already seeded)',
    updateDb: null,
  },
  // Frame detail product images (NfcFrameDetailScreen)
  {
    key: 'wpc-frame1',
    localPath: path.join(ASSETS, 'wpc', 'wpc-frame', 'wpc-frame1.png'),
    storagePath: 'nfc/wpc-frame1.png',
    description: 'WPC/NFC Frame product image 1 (NfcFrameDetailScreen)',
    updateDb: null,
  },
  {
    key: 'wpc-frame2',
    localPath: path.join(ASSETS, 'wpc', 'wpc-frame', 'wpc-frame2.png'),
    storagePath: 'nfc/wpc-frame2.png',
    description: 'WPC/NFC Frame product image 2 (NfcFrameDetailScreen)',
    updateDb: null,
  },
];

// ─── Step 1: Verify ────────────────────────────────────────────────────────────
console.log('\n📋 STEP 1: Verifying all NFC module images...\n');
let allOk = true;
for (const img of nfcImageSet) {
  if (fs.existsSync(img.localPath)) {
    const size = (fs.statSync(img.localPath).size / 1024).toFixed(1);
    console.log(`  ✅ [${img.key}]  (${size} KB)`);
    console.log(`     ${img.description}`);
  } else {
    console.log(`  ❌ MISSING: ${img.localPath}`);
    allOk = false;
  }
}

if (!allOk) {
  console.error('\n❌ Verification failed. Fix missing files and retry.');
  process.exit(1);
}

console.log(`\n✅ All ${nfcImageSet.length} images verified.\n`);

// ─── Step 2: Upload & DB Update ────────────────────────────────────────────────
console.log('📤 STEP 2: Uploading to Supabase Storage...\n');

const results = [];

async function seed() {
  for (const img of nfcImageSet) {
    const fileBuffer = fs.readFileSync(img.localPath);
    const ext = path.extname(img.localPath).slice(1).toLowerCase();
    const mimeType = `image/${ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext}`;

    process.stdout.write(`  📁 Uploading [${img.key}] → ${img.storagePath} ... `);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(img.storagePath, fileBuffer, { contentType: mimeType, upsert: true });

    if (uploadError) {
      console.log(`❌ ${uploadError.message}`);
      results.push({ key: img.key, success: false, error: uploadError.message });
      continue;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(img.storagePath);
    const publicUrl = urlData?.publicUrl;
    console.log(`✅`);
    console.log(`     🔗 ${publicUrl}`);

    // Update DB if this image maps to a category row
    if (img.updateDb) {
      const { error: dbError } = await supabase
        .from(img.updateDb.table)
        .update({ [img.updateDb.field]: publicUrl })
        .eq('id', img.updateDb.id);

      if (dbError) {
        console.log(`     ⚠️  DB update failed: ${dbError.message}`);
      } else {
        console.log(`     ✅ DB updated → ${img.updateDb.table}.${img.updateDb.field} for id="${img.updateDb.id}"`);
      }
    }

    results.push({ key: img.key, success: true, url: publicUrl });
    console.log('');
  }

  // ─── Step 3: Print Summary ───────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────');
  console.log('📊 FINAL SEED SUMMARY — NFC Module Images\n');
  results.forEach(r => {
    if (r.success) {
      console.log(`  ✅ ${r.key}`);
      console.log(`     ${r.url}\n`);
    } else {
      console.log(`  ❌ ${r.key} — ${r.error}\n`);
    }
  });

  const ok = results.filter(r => r.success).length;
  console.log(`🎉 ${ok}/${nfcImageSet.length} images seeded successfully.`);
  console.log('⚠️  Source files untouched — verify in app & dashboard before deletion.\n');
}

seed();
