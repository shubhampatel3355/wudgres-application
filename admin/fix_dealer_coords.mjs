import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseAnonKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fix() {
  // First find all dealers with clearly wrong coordinates
  // (Hubli, Mysuru, etc. that have Bangalore-area coords)
  const { data: allDealers, error } = await supabase
    .from('dealers')
    .select('id, store_name, pincode, address, lat, lon');
  
  if (error) { console.error(error.message); return; }

  // Known PIN code → correct lat/lon mappings for non-Bangalore cities
  const PINCODE_COORDS = {
    // Hubli
    '580020': { lat: 15.3647, lon: 75.1240 },
    '580021': { lat: 15.3590, lon: 75.1360 },
    '580023': { lat: 15.3500, lon: 75.1300 },
    '580028': { lat: 15.3400, lon: 75.1100 },
    '580029': { lat: 15.3550, lon: 75.1200 },
    '580031': { lat: 15.3700, lon: 75.1350 },
    '580032': { lat: 15.3800, lon: 75.1400 },
    // Dharwad
    '580001': { lat: 15.4589, lon: 75.0078 },
    '580002': { lat: 15.4700, lon: 75.0200 },
    // Mysuru
    '570001': { lat: 12.2958, lon: 76.6394 },
    '570005': { lat: 12.3086, lon: 76.6560 },
    '570008': { lat: 12.3200, lon: 76.6400 },
    '570010': { lat: 12.2850, lon: 76.6500 },
    '570012': { lat: 12.2950, lon: 76.6600 },
    '570016': { lat: 12.3100, lon: 76.6700 },
    '570017': { lat: 12.3000, lon: 76.6800 },
    '570019': { lat: 12.3150, lon: 76.6900 },
    '570020': { lat: 12.3050, lon: 76.6350 },
    '570022': { lat: 12.2900, lon: 76.6300 },
    '570027': { lat: 12.2800, lon: 76.6200 },
    '570029': { lat: 12.2700, lon: 76.6100 },
    '570048': { lat: 12.3300, lon: 76.6200 },
    // Mangalore
    '575001': { lat: 12.8698, lon: 74.8431 },
    '575004': { lat: 12.8800, lon: 74.8500 },
    '575006': { lat: 12.8600, lon: 74.8300 },
    // Hassan
    '573201': { lat: 13.0068, lon: 76.0996 },
    // Tumkur
    '572101': { lat: 13.3379, lon: 77.1173 },
    '572102': { lat: 13.3400, lon: 77.1200 },
    // Davangere
    '577002': { lat: 14.4644, lon: 75.9218 },
    '577004': { lat: 14.4700, lon: 75.9300 },
    '577005': { lat: 14.4600, lon: 75.9100 },
    // Shivamogga
    '577201': { lat: 13.9299, lon: 75.5681 },
    // Bidar
    '585401': { lat: 17.9104, lon: 77.5199 },
    // Bellary
    '583101': { lat: 15.1394, lon: 76.9214 },
    // Gadag
    '582101': { lat: 15.4260, lon: 75.6212 },
    // Udupi
    '576101': { lat: 13.3379, lon: 74.7420 },
    // Bagalkot
    '587101': { lat: 16.1691, lon: 75.6962 },
    // Vijayapura (Bijapur)
    '586101': { lat: 16.8302, lon: 75.7100 },
  };

  let fixCount = 0;
  for (const dealer of allDealers) {
    const correctCoords = PINCODE_COORDS[dealer.pincode];
    if (!correctCoords) continue;

    // Check if the stored coords look wrong (within 50km of Bangalore but shouldn't be)
    const blrLat = 12.9716, blrLon = 77.5946;
    const dLat = (dealer.lat - blrLat) * Math.PI / 180;
    const dLon = (dealer.lon - blrLon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(blrLat * Math.PI/180) * Math.cos(dealer.lat * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const distFromBlr = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    // If the dealer is stored within 80km of Bangalore but has a non-Bangalore pincode
    const blrPincodes = ['560', '561', '562', '563'];
    const isBlrPincode = blrPincodes.some(p => dealer.pincode.startsWith(p));
    
    if (!isBlrPincode && distFromBlr < 80) {
      console.log(`FIXING: ${dealer.store_name} (${dealer.pincode})`);
      console.log(`  Old: lat=${dealer.lat}, lon=${dealer.lon} (${distFromBlr.toFixed(0)}km from Blr)`);
      console.log(`  New: lat=${correctCoords.lat}, lon=${correctCoords.lon}`);
      
      const { error: updateErr } = await supabase
        .from('dealers')
        .update({ lat: correctCoords.lat, lon: correctCoords.lon })
        .eq('id', dealer.id);
      
      if (updateErr) console.error(`  ERROR: ${updateErr.message}`);
      else { console.log(`  ✓ Fixed!`); fixCount++; }
    }
  }

  console.log(`\nFixed ${fixCount} dealer(s).`);
}

fix();
