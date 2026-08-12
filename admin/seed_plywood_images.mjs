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
  { file: '../app/src/assets/images/home/plywoodmain.jpeg', label: 'Plywood Category Card', name: 'plywoodmain.jpeg' },
  { file: '../app/src/assets/images/home/blockboardmain.jpeg', label: 'Block Board Category Card', name: 'blockboardmain.jpeg' },
  { file: '../app/src/assets/images/products/Ply-BWR.png', label: 'Plywood BWR', name: 'ply-bwr.png' },
  { file: '../app/src/assets/images/products/Ply-BWP.png', label: 'Plywood BWP', name: 'ply-bwp.png' },
  { file: '../app/src/assets/images/products/BLOCK-MR.png', label: 'Block Board MR', name: 'block-mr.png' },
  { file: '../app/src/assets/images/products/BLOCK-BWP.png', label: 'Block Board BWP', name: 'block-bwp.png' },
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
    const storagePath = `plywood/${img.name}`;
    
    console.log(`Uploading ${img.name}...`);
    const { error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(storagePath, fileBuffer, {
        contentType: img.name.endsWith('.png') ? 'image/png' : 'image/jpeg',
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

  // Update plywood category
  console.log('Updating DB record for plywood category...');
  
  // First, get the existing extra_images to merge or just replace
  const { data: catData } = await supabase.from('app_category_images').select('extra_images').eq('id', 'plywood').single();
  let existingExtras = catData?.extra_images || [];
  
  // Replace items with same label, add new ones
  for (const newImg of extraImages) {
    const idx = existingExtras.findIndex(e => e.label === newImg.label);
    if (idx >= 0) existingExtras[idx] = newImg;
    else existingExtras.push(newImg);
  }

  const { error: updateError } = await supabase
    .from('app_category_images')
    .update({ extra_images: existingExtras })
    .eq('id', 'plywood');

  if (updateError) {
    console.error('Failed to update DB:', updateError.message);
  } else {
    console.log('✅ Successfully updated plywood category with extra images.');
  }
}

seed();
