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

const seriesMap = {
  'timbor': '20cd421f-01f5-4d93-bf73-cd3d24939dfd',
  'ven-decor': 'c974d57d-0203-423d-89f5-71a9dc249227',
  'teak-veneer': '846f918d-d867-4096-8f84-1c2596af72a1',
  'lamorous': 'd8d816b8-cf70-46e8-88a8-e5fe2b4a9e61',
  'metalem': '726856dc-653c-4105-a072-d00dd488a84b',
  'espial': '01e641d5-19ca-474d-b3a5-650c8ae1f83e',
  'divine': '556bcefc-e3ed-499b-82fd-acc378ff4778',
  'embozz': 'e8a3e003-acf2-4f8c-b1de-680277ec1325',
  'lamina': '452502f8-8f8b-40db-a44a-20791469942f',
  'solid-white': '196e77fb-351f-409b-b80b-97d7468a043a',
  'flush-doors': '41d7f551-8662-4039-960c-9801c95ceee4',
  'lamorous-eco': '3d76bb9f-342d-407c-b94e-7a1b766d1894',
  'lamina-rich': 'e5ee14e5-f54d-4fe3-8437-dbdd4597968c',
  'lamina-eco': '8e39686d-4526-446c-8c4d-dccd009a2768',
  'solid-white-rich': 'a18f0952-d555-4cfc-8925-7d0609464514',
  'solid-white-eco': '53baea95-d318-48d8-915e-0fcb2a9ba9d7',
  'ven-decor-legend': '0f635588-1762-483f-be2a-defa38ea303d',
  'ven-decor-lavish': '06f8ae48-7440-4251-8bd6-83b237ab923c',
  'ven-decor-elite': 'f232b952-991c-4492-b26d-07563a59b35d',
  'ven-decor-rich': '04fa71fc-d7dd-4232-9b44-29f74243438c',
  'lamorous-elite': '5fb36618-3b35-42e6-9b1d-84a66fec5765',
  'lamorous-rich': 'ba71d395-d9a8-42db-8408-7593e62dab39',
  'lamorous-prime': 'd6ccabd6-5f57-455c-8863-503142dad648'
};

const pricingData = [];

function addRule(slug, thickness, finish, shade, rate, maxH = null, maxW = null) {
  if (seriesMap[slug]) {
    pricingData.push({
      series_id: seriesMap[slug],
      thickness,
      finish,
      shade,
      rate,
      max_height: maxH,
      max_width: maxW
    });
  }
}

// 1. TIMBOR
addRule('timbor', '32mm', '20mm Panel', null, 750);
addRule('timbor', '32mm', '32mm Panel', null, 870);
addRule('timbor', '38mm', '20mm Panel', null, 890);
addRule('timbor', '38mm', '32mm Panel', null, 1010);
addRule('timbor', '32mm', 'Pooja Door WG 1051-1070', null, 715);
// ignoring Horizontal Piece for now as it's /PC

// 2. VEN DECOR LEGEND
const venDecorFinishes = [
  { f: '1-Side', d: 0 },
  { f: '1-Side + Membrane', d: 25, h: '87"', w: '44"' },
  { f: '1-Side + 0.8Lam', d: 76 },
  { f: 'Both-Side', d: 760 }
];
const vdLegendBase = { '35mm': 980, '38mm': 1011 };
Object.entries(vdLegendBase).forEach(([t, b]) => {
  addRule('ven-decor-legend', t, '1-Side', null, b);
  addRule('ven-decor-legend', t, '+Membrane', null, b + 25, '87"', '44"');
  addRule('ven-decor-legend', t, '+0.8Lam', null, b + 76);
  addRule('ven-decor-legend', t, 'Both-Side', null, b + 760);
});

// VEN DECOR LAVISH
const vdLavishBase = { '35mm': 825, '38mm': 856 };
Object.entries(vdLavishBase).forEach(([t, b]) => {
  addRule('ven-decor-lavish', t, '1-Side', null, b);
  addRule('ven-decor-lavish', t, '+Membrane', null, b + 25, '87"', '44"');
  addRule('ven-decor-lavish', t, '+0.8Lam', null, b + 76);
  addRule('ven-decor-lavish', t, 'Both-Side', null, b + 610);
});

// VEN DECOR ELITE
const vdEliteBase = { '35mm': 765, '38mm': 796 };
Object.entries(vdEliteBase).forEach(([t, b]) => {
  addRule('ven-decor-elite', t, '1-Side', null, b);
  addRule('ven-decor-elite', t, '+Membrane', null, b + 25, '87"', '44"');
  addRule('ven-decor-elite', t, '+0.8Lam', null, b + 76);
  addRule('ven-decor-elite', t, 'Both-Side', null, b + 549);
});

// VEN DECOR RICH
const vdRichBase = { '35mm': 605, '38mm': 636 };
Object.entries(vdRichBase).forEach(([t, b]) => {
  addRule('ven-decor-rich', t, '1-Side', null, b);
  addRule('ven-decor-rich', t, '+Membrane', null, b + 25, '87"', '44"');
  addRule('ven-decor-rich', t, '+0.8Lam', null, b + 76);
  addRule('ven-decor-rich', t, 'Both-Side', null, b + 399);
});

// TEAK VENEER
const teakBase = { '32mm': 345, '35mm': 376, '40mm': 407 };
Object.entries(teakBase).forEach(([t, b]) => {
  addRule('teak-veneer', t, 'Plain', null, b);
  addRule('teak-veneer', t, 'Grooved-OS', null, b + 35);
  addRule('teak-veneer', t, 'Grooved-BS', null, b + 70);
});

// LAMOROUS ELITE
const lamEliteBase = { '32mm': 505, '35mm': 536, '40mm': 567 };
Object.entries(lamEliteBase).forEach(([t, b]) => {
  addRule('lamorous-elite', t, '1-Side+Membrane', null, b, '87"', '44"');
  addRule('lamorous-elite', t, '+Plain Lam', null, b + 118);
  addRule('lamorous-elite', t, 'Both-Side', null, b + 253);
});

// LAMOROUS RICH
const lamRichBase = { '32mm': 405, '35mm': 436, '40mm': 467 };
Object.entries(lamRichBase).forEach(([t, b]) => {
  addRule('lamorous-rich', t, '1-Side+Membrane', null, b, '87"', '44"');
  addRule('lamorous-rich', t, '+Plain Lam', null, b + 118);
  addRule('lamorous-rich', t, 'Both-Side', null, b + 153);
});

// LAMOROUS PRIME
const lamPrimeBase = { '32mm': 415, '35mm': 446, '40mm': 477 };
Object.entries(lamPrimeBase).forEach(([t, b]) => {
  addRule('lamorous-prime', t, '1-Side+Membrane', null, b, '87"', '44"');
  addRule('lamorous-prime', t, '+Plain Lam', null, b + 76);
  addRule('lamorous-prime', t, 'Both-Side', null, b + 211);
});

// LAMOROUS ECO
const lamEcoBase = { '32mm': 315, '35mm': 346, '40mm': 377 };
Object.entries(lamEcoBase).forEach(([t, b]) => {
  addRule('lamorous-eco', t, '1-Side+Membrane', null, b, '87"', '44"');
  addRule('lamorous-eco', t, '+Plain Lam', null, b + 76);
  addRule('lamorous-eco', t, 'Both-Side', null, b + 111);
});

// METALEM, ESPIAL, DIVINE, EMBOZZ, LAMINA
const shadePrices = [
  { slug: 'metalem', b: 367 },
  { slug: 'espial', b: 300 },
  { slug: 'divine', b: 300 },
  { slug: 'embozz', b: 300 },
  { slug: 'lamina', b: 252 } // Note lamina-rich/lamina-eco might exist but user gave WG 001 Series for Lamina
];
shadePrices.forEach(({slug, b}) => {
  addRule(slug, '32mm', null, 'Natural Teak / Andhra Teak / Rosewood', b, '87"', '44"');
  addRule(slug, '32mm', null, 'Mahogany', b + 19, '87"', '44"');
  addRule(slug, '32mm', null, 'Natural Wenge / Jungle Teak', b + 31, '87"', '44"');
});

// SOLID WHITE RICH
addRule('solid-white-rich', '32mm', 'Solid White Rich', null, 315);
addRule('solid-white-rich', '32mm', 'Divine Collection Designs', null, 286);

// SOLID WHITE ECO
addRule('solid-white-eco', '32mm', 'Solid White ECO', null, 235);

// FLUSH DOORS
addRule('flush-doors', '32mm', null, null, 165);
addRule('flush-doors', '35mm', null, null, 196);
addRule('flush-doors', '38mm', null, null, 227);
addRule('flush-doors', '42mm', null, null, 258);

async function seed() {
  console.log('Clearing existing pricing rules...');
  await supabase.from('pricing_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log(`Inserting ${pricingData.length} pricing rules...`);
  
  // Insert in batches of 50
  for (let i = 0; i < pricingData.length; i += 50) {
    const chunk = pricingData.slice(i, i + 50);
    const { error } = await supabase.from('pricing_rules').insert(chunk);
    if (error) {
      console.error('Error inserting batch:', error);
    } else {
      console.log(`Inserted batch ${i/50 + 1}`);
    }
  }
  console.log('Seeding complete!');
}

seed();
