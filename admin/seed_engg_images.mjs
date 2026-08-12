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

const imagesToSeed = [
  { file: '../app/src/assets/images/products/engg1.webp', label: 'Eng Wood Frame 1', name: 'engg1.webp' },
  { file: '../app/src/assets/images/products/engg2.webp', label: 'Eng Wood Frame 2', name: 'engg2.webp' },
];

async function seed() {
  const extraImages = [];

  for (const img of imagesToSeed) {
    const filePath = path.join(__dirname, img.file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `eng-wood-frames/${img.name}`;
    
    console.log(`Uploading ${img.name}...`);
    const { error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
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
  console.log('Updating DB record for eng-wood-frames category...');
  
  const { data: catData } = await supabase.from('app_category_images').select('extra_images').eq('id', 'eng-wood-frames').single();
  let existingExtras = catData?.extra_images || [];
  
  for (const newImg of extraImages) {
    const idx = existingExtras.findIndex(e => e.label === newImg.label);
    if (idx >= 0) existingExtras[idx] = newImg;
    else existingExtras.push(newImg);
  }

  const { error: updateError } = await supabase
    .from('app_category_images')
    .update({ extra_images: existingExtras })
    .eq('id', 'eng-wood-frames');

  if (updateError) {
    console.error('Failed to update DB:', updateError.message);
  } else {
    console.log('✅ Successfully updated eng-wood-frames category with extra images.');
  }
}

seed();
