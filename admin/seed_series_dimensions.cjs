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
    allowed_thicknesses: '32, 38',
    allowed_heights: '78, 81, 84',
    allowed_widths: '33, 36, 38, 42'
  },
  {
    matchSlugs: ['ven-decor', 'ven-decor-legend', 'ven-decor-lavish', 'ven-decor-elite', 'ven-decor-rich'],
    allowed_thicknesses: '35, 38',
    allowed_heights: '72, 75, 78, 81, 84, 90, 96',
    allowed_widths: '27, 30, 32, 33, 36, 38, 42, 48'
  },
  {
    matchSlugs: ['lamorous', 'lamorous-eco', 'lamorous-prime', 'lamorous-rich', 'lamorous-elite'],
    allowed_thicknesses: '32, 35, 40',
    allowed_heights: '72, 75, 78, 81, 84, 90, 96',
    allowed_widths: '27, 30, 32, 33, 36, 38, 42, 48'
  },
  {
    matchSlugs: ['teak-veneer'],
    allowed_thicknesses: '32, 35, 40',
    allowed_heights: '72, 75, 78, 81, 84, 90, 96',
    allowed_widths: '27, 30, 32, 33, 36, 38, 42, 48'
  },
  {
    matchSlugs: ['metalem', 'espial', 'divine', 'embozz', 'lamina', 'lamina-rich', 'lamina-eco'],
    allowed_thicknesses: '32',
    allowed_heights: '72, 75, 78, 81, 84',
    allowed_widths: '27, 30, 32, 33, 36, 38'
  },
  {
    matchSlugs: ['solid-white', 'solid-white-eco', 'solid-white-rich'],
    allowed_thicknesses: '32',
    allowed_heights: '72, 75, 78, 81, 84, 90, 96',
    allowed_widths: '27, 30, 32, 33, 36, 38, 42, 48'
  },
  {
    matchSlugs: ['flush-doors'],
    allowed_thicknesses: '32, 35, 38, 42',
    allowed_heights: '72, 75, 78, 81, 84, 90, 96',
    allowed_widths: '27, 30, 32, 33, 36, 38, 42, 48'
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
      console.log(`Updating properties for ${matchedSeries.map(s => s.name).join(', ')}...`);
      const { error } = await supabase
        .from('series')
        .update({
          allowed_thicknesses: rule.allowed_thicknesses,
          allowed_heights: rule.allowed_heights,
          allowed_widths: rule.allowed_widths
        })
        .in('id', seriesIds);
        
      if (error) {
        console.error('Error updating:', error);
      } else {
        console.log('Updated successfully.');
      }
    }
  }
  
  console.log('Seeding collection dimensions complete!');
}

seed();
