import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const doorImages = [
  { file: '../app/src/assets/images/door/divine/Divine.png', label: 'Divine', name: 'divine.png' },
  { file: '../app/src/assets/images/door/door-image/Flush Doors.png', label: 'Flush Doors', name: 'flush-doors.png' },
  { file: '../app/src/assets/images/door/door-image/Lamorous.png', label: 'Lamorous', name: 'lamorous.png' },
  { file: '../app/src/assets/images/door/door-image/Solid White.png', label: 'Solid White', name: 'solid-white.png' },
  { file: '../app/src/assets/images/door/door-image/Ven-Decor.png', label: 'Ven-Decor', name: 'ven-decor.png' },
  { file: '../app/src/assets/images/door/embozz/Embozz.png', label: 'Embozz', name: 'embozz.png' },
  { file: '../app/src/assets/images/door/espial/Espial.png', label: 'Espial', name: 'espial.png' },
  { file: '../app/src/assets/images/door/lamina/Lamina 2.png', label: 'Lamina 2', name: 'lamina-2.png' },
  { file: '../app/src/assets/images/door/lamina/Lamina.png', label: 'Lamina', name: 'lamina.png' },
  { file: '../app/src/assets/images/door/lamorous/lamrours-img/lamorous eco.png', label: 'Lamorous Eco', name: 'lamorous-eco.png' },
  { file: '../app/src/assets/images/door/lamorous/lamrours-img/lamorous elite.png', label: 'Lamorous Elite', name: 'lamorous-elite.png' },
  { file: '../app/src/assets/images/door/lamorous/lamrours-img/Lamorous Prime.png', label: 'Lamorous Prime', name: 'lamorous-prime.png' },
  { file: '../app/src/assets/images/door/lamorous/lamrours-img/lamorous rich.png', label: 'Lamorous Rich', name: 'lamorous-rich.png' },
  { file: '../app/src/assets/images/door/metalem/Metalem Bg.png', label: 'Metalem Bg', name: 'metalem-bg.png' },
  { file: '../app/src/assets/images/door/metalem/Metalem.png', label: 'Metalem', name: 'metalem.png' },
  { file: '../app/src/assets/images/door/solid-white/sloid-img/solid white eco.png', label: 'Solid White Eco', name: 'solid-white-eco.png' },
  { file: '../app/src/assets/images/door\solid-white/sloid-img/solid white rich.png', label: 'Solid White Rich', name: 'solid-white-rich.png' },
  { file: '../app/src/assets/images/door/teak/Teak Veneer Bg.png', label: 'Teak Veneer Bg', name: 'teak-veneer-bg.png' },
  { file: '../app/src/assets/images/door/teak/Teak Veneer.png', label: 'Teak Veneer', name: 'teak-veneer.png' },
  { file: '../app/src/assets/images/door/timbor/Timbor.png', label: 'Timbor', name: 'timbor.png' },
  { file: '../app/src/assets/images/door/ven/Ven Decor Legend.png', label: 'Ven Decor Legend', name: 'ven-decor-legend.png' },
  { file: '../app/src/assets/images/door/ven/ven elite.png', label: 'Ven Elite', name: 'ven-elite.png' },
  { file: '../app/src/assets/images/door/ven/ven lavish.png', label: 'Ven Lavish', name: 'ven-lavish.png' },
  { file: '../app/src/assets/images/door/ven/ven rich.png', label: 'Ven Rich', name: 'ven-rich.png' },
];

// Fix for backslash in path for solid white rich
doorImages[16].file = '../app/src/assets/images/door/solid-white/sloid-img/solid white rich.png';

async function seed() {
  const extraImages = [];

  for (const img of doorImages) {
    const filePath = path.join(__dirname, img.file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `doors/${img.name}`;
    
    console.log(`Uploading ${img.name}...`);
    const { error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error(`Failed to upload ${img.name}:`, uploadError.message);
      continue;
    }

    const { data } = supabase.storage.from('category-images').getPublicUrl(storagePath);
    extraImages.push({
      label: img.label,
      url: data.publicUrl
    });
    console.log(`✅ Uploaded ${img.name} -> ${data.publicUrl}`);
  }

  // Update category
  console.log('Updating DB record for doors category...');
  
  const { data: catData } = await supabase.from('app_category_images').select('extra_images').eq('id', 'doors').single();
  let existingExtras = catData?.extra_images || [];
  
  for (const newImg of extraImages) {
    const idx = existingExtras.findIndex(e => e.label === newImg.label);
    if (idx >= 0) existingExtras[idx] = newImg;
    else existingExtras.push(newImg);
  }

  const { error: updateError } = await supabase
    .from('app_category_images')
    .update({ extra_images: existingExtras })
    .eq('id', 'doors');

  if (updateError) {
    console.error('Failed to update DB:', updateError.message);
  } else {
    console.log('✅ Successfully updated doors category with extra images.');
  }
}

seed();
