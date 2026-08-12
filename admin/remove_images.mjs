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

async function removeImages() {
  console.log('Fetching NFC category data...');
  const { data, error } = await supabase.from('app_category_images').select('*').eq('id', 'nfc').single();
  
  if (error) {
    console.error('Error fetching NFC data:', error.message);
    return;
  }
  
  let extraImages = data.extra_images || [];
  // Filter out NFC Eco Rich Door
  const filteredExtraImages = extraImages.filter(img => img.label !== 'NFC Eco Rich Door');
  
  console.log('Updating NFC category...');
  const { error: updateError } = await supabase
    .from('app_category_images')
    .update({ 
      hero_image_url: null,
      extra_images: filteredExtraImages
    })
    .eq('id', 'nfc');
    
  if (updateError) {
    console.error('Error updating NFC data:', updateError.message);
  } else {
    console.log('Successfully removed Detail Page Hero Image and NFC Eco Rich Door extra image.');
  }
}

removeImages();
