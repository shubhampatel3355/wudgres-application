import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Load .env credentials ───────────────────────────────────────────────────
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

// ─── Category → Image Mapping ─────────────────────────────────────────────────
// Verified against: app/src/data/mockData.ts + app/src/assets/images/home/
const IMAGES_DIR = path.join(__dirname, '..', 'app', 'src', 'assets', 'images', 'home');

const categoryImageMap = [
  {
    id: 'doors',
    name: 'Doors',
    thumbnail: 'Door Forest Web bg.jpg',
  },
  {
    id: 'nfc',
    name: 'NFC',
    thumbnail: 'NFC Web bg.jpg',
  },
  {
    id: 'window-shutters',
    name: 'Window Shutters',
    thumbnail: 'WINDOWS Web BG.jpg',
  },
  {
    id: 'plywood',
    name: 'Plywood & Block Boards',
    thumbnail: 'Ply Wood Bg.jpg',
  },
  {
    id: 'eng-wood-frames',
    name: 'Eng. Wood Frames',
    thumbnail: 'Frames Bg.jpg',
  },
];

// ─── Step 1: Verify all files exist ──────────────────────────────────────────
console.log('\n📋 STEP 1: Verifying source images...\n');
let allVerified = true;
for (const cat of categoryImageMap) {
  const fullPath = path.join(IMAGES_DIR, cat.thumbnail);
  if (fs.existsSync(fullPath)) {
    const size = (fs.statSync(fullPath).size / 1024).toFixed(1);
    console.log(`  ✅ [${cat.id}]  ${cat.thumbnail}  (${size} KB)`);
  } else {
    console.log(`  ❌ [${cat.id}]  MISSING: ${fullPath}`);
    allVerified = false;
  }
}

if (!allVerified) {
  console.error('\n❌ Verification failed. Fix missing files before seeding.');
  process.exit(1);
}

console.log('\n✅ All images verified.\n');

// ─── Step 2: Upload to Supabase Storage & update DB ──────────────────────────
console.log('📤 STEP 2: Uploading images to Supabase Storage...\n');
const BUCKET = 'category-images';

async function seedImages() {
  for (const cat of categoryImageMap) {
    const localPath = path.join(IMAGES_DIR, cat.thumbnail);
    const fileBuffer = fs.readFileSync(localPath);
    const ext = path.extname(cat.thumbnail).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;

    const storagePath = `thumbnails/${cat.id}.${ext}`;

    console.log(`  📁 Uploading [${cat.id}] → ${storagePath}`);

    // Upload (upsert = overwrite if exists)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ❌ Upload failed for [${cat.id}]:`, uploadError.message);
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) {
      console.error(`  ❌ Could not get public URL for [${cat.id}]`);
      continue;
    }

    console.log(`  🔗 URL: ${publicUrl}`);

    // Update the DB row
    const { error: dbError } = await supabase
      .from('app_category_images')
      .update({ image_url: publicUrl })
      .eq('id', cat.id);

    if (dbError) {
      console.error(`  ❌ DB update failed for [${cat.id}]:`, dbError.message);
    } else {
      console.log(`  ✅ [${cat.id}] seeded successfully!\n`);
    }
  }

  console.log('\n🎉 Seeding complete! Open your Admin Panel to verify images.');
  console.log('⚠️  Do NOT delete source images until you have verified everything in the app.\n');
}

seedImages();
