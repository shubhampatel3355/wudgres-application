import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseAnonKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase
    .from('dealers')
    .select('store_name, pincode, address, lat, lon')
    .eq('pincode', '580020');

  if (error) { console.error(error.message); return; }
  console.log('Dealers with pincode 580020:');
  data.forEach(d => {
    console.log(`  Store: ${d.store_name}`);
    console.log(`  Address: ${d.address}`);
    console.log(`  lat=${d.lat} | lon=${d.lon}`);
    console.log();
  });

  if (data.length > 0 && data[0].lat && data[0].lon) {
    const dLat = ((data[0].lat - 12.9716)) * Math.PI / 180;
    const dLon = ((data[0].lon - 77.5946)) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(12.9716 * Math.PI/180) * Math.cos(data[0].lat * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    console.log(`Distance from Bangalore center → stored coords: ${(6371*c).toFixed(1)} km`);
    console.log();
  }

  // Expected: Hubli 580020 real coords
  console.log('Expected: Hubli 580020 real coords are ~15.3647, 75.1240');
  const dLat2 = (15.3647 - 12.9716) * Math.PI / 180;
  const dLon2 = (75.1240 - 77.5946) * Math.PI / 180;
  const a2 = Math.sin(dLat2/2) * Math.sin(dLat2/2) +
             Math.cos(12.9716 * Math.PI/180) * Math.cos(15.3647 * Math.PI/180) *
             Math.sin(dLon2/2) * Math.sin(dLon2/2);
  const c2 = 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1-a2));
  console.log(`Expected distance: ${(6371*c2).toFixed(1)} km`);
}

check();
