import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseAnonKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Inserting default categories...');
  
  const { data, error } = await supabase.from('app_category_images').upsert([
    { id: 'doors', name: 'Doors', image_url: null },
    { id: 'nfc', name: 'NFC', image_url: null },
    { id: 'window-shutters', name: 'Window Shutters', image_url: null },
    { id: 'plywood', name: 'Plywood & Block Boards', image_url: null },
    { id: 'eng-wood-frames', name: 'Eng. Wood Frames', image_url: null }
  ]);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Inserted successfully!');
  }
}

test();
