import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iglmngvjazarthujdofo.supabase.co';
const supabaseAnonKey = 'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding Flush Doors data...');

  const flushDoorsData = [
    {
      series_slug: 'flush-doors',
      description: '67MM X 32MM Height Upto 48 Inches',
      col2: '295.00',
      sort_order: 1,
    },
    {
      series_slug: 'flush-doors',
      description: '67MM X 32MM Height above 48 Inches',
      col2: '320.00',
      sort_order: 2,
    },
    {
      series_slug: 'flush-doors',
      description: '92MM X 32MM Height Upto 48 Inches',
      col2: '395.00',
      sort_order: 3,
    },
    {
      series_slug: 'flush-doors',
      description: '92MM X 32MM Height above 48 Inches',
      col2: '420.00',
      sort_order: 4,
    },
  ];

  for (const row of flushDoorsData) {
    const { error } = await supabase.from('frame_dimensions').insert([row]);
    if (error) {
      console.error(`Error inserting ${row.description}:`, error.message);
    }
  }

  console.log('  ✓ Inserted 4 rows.');
  console.log('Done!');
}

seed();
