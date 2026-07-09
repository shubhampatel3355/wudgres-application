const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

const dimensionRules = [
  {
    matchSlugs: ['timbor'],
    thickness: '32, 38',
    height: '78, 81, 84',
    width: '33, 36, 38, 42'
  },
  {
    matchSlugs: ['ven-decor', 'ven-decor-legend', 'ven-decor-lavish', 'ven-decor-elite', 'ven-decor-rich'],
    thickness: '35, 38',
    height: '72, 75, 78, 81, 84, 90, 96',
    width: '27, 30, 32, 33, 36, 38, 42, 48'
  },
  {
    matchSlugs: ['lamorous', 'lamorous-eco', 'lamorous-prime', 'lamorous-rich', 'lamorous-elite'],
    thickness: '32, 35, 40',
    height: '72, 75, 78, 81, 84, 90, 96',
    width: '27, 30, 32, 33, 36, 38, 42, 48'
  },
  {
    matchSlugs: ['teak-veneer'],
    thickness: '32, 35, 40',
    height: '72, 75, 78, 81, 84, 90, 96',
    width: '27, 30, 32, 33, 36, 38, 42, 48'
  },
  {
    matchSlugs: ['metalem', 'espial', 'divine', 'embozz', 'lamina', 'lamina-rich', 'lamina-eco'],
    thickness: '32',
    height: '72, 75, 78, 81, 84',
    width: '27, 30, 32, 33, 36, 38'
  },
  {
    matchSlugs: ['solid-white', 'solid-white-eco', 'solid-white-rich'],
    thickness: '32',
    height: '72, 75, 78, 81, 84, 90, 96',
    width: '27, 30, 32, 33, 36, 38, 42, 48'
  },
  {
    matchSlugs: ['flush-doors'],
    thickness: '32, 35, 38, 42',
    height: '72, 75, 78, 81, 84, 90, 96',
    width: '27, 30, 32, 33, 36, 38, 42, 48'
  }
];

async function seed() {
  console.log('Fetching all series...');
  const { data: allSeries } = await supabase.from('series').select('id, slug, name');
  
  if (!allSeries) return;

  for (const rule of dimensionRules) {
    const matchedSeries = allSeries.filter(s => rule.matchSlugs.includes(s.slug));
    const seriesIds = matchedSeries.map(s => s.id);
    
    if (seriesIds.length > 0) {
      console.log(`Updating ${matchedSeries.map(s => s.name).join(', ')}...`);
      const { error } = await supabase
        .from('products')
        .update({
          thickness: rule.thickness,
          height: rule.height,
          width: rule.width
        })
        .in('series_id', seriesIds);
        
      if (error) {
        console.error('Error updating:', error);
      } else {
        console.log('Updated successfully.');
      }
    }
  }
  
  console.log('Seeding dimensions complete!');
}

seed();
