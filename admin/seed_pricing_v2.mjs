/**
 * WUDGRES COMPREHENSIVE PRICING SEED SCRIPT
 * Clears all existing pricing rules and inserts correct data from the official price list.
 * Run: node seed_pricing_v2.mjs
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iglmngvjazarthujdofo.supabase.co',
  'sb_publishable_SGOpbsEHYBdVSObNYDB9Jg_TK9gG50O'
);

// Series IDs (fetched from database)
const IDS = {
  TIMBOR:           '20cd421f-01f5-4d93-bf73-cd3d24939dfd',
  VEN_DECOR_LEGEND: '0f635588-1762-483f-be2a-defa38ea303d',
  VEN_DECOR_LAVISH: '06f8ae48-7440-4251-8bd6-83b237ab923c',
  VEN_DECOR_ELITE:  'f232b952-991c-4492-b26d-07563a59b35d',
  VEN_DECOR_RICH:   '04fa71fc-d7dd-4232-9b44-29f74243438c',
  TEAK_VENEER:      '846f918d-d867-4096-8f84-1c2596af72a1',
  LAMOROUS_ELITE:   '5fb36618-3b35-42e6-9b1d-84a66fec5765',
  LAMOROUS_RICH:    'ba71d395-d9a8-42db-8408-7593e62dab39',
  LAMOROUS_PRIME:   'd6ccabd6-5f57-455c-8863-503142dad648',
  LAMOROUS_ECO:     '3d76bb9f-342d-407c-b94e-7a1b766d1894',
  METALEM:          '726856dc-653c-4105-a072-d00dd488a84b',
  ESPIAL:           '01e641d5-19ca-474d-b3a5-650c8ae1f83e',
  DIVINE:           '556bcefc-e3ed-499b-82fd-acc378ff4778',
  EMBOZZ:           'e8a3e003-acf2-4f8c-b1de-680277ec1325',
  LAMINA:           '452502f8-8f8b-40db-a44a-20791469942f',
  SOLID_WHITE_RICH: 'a18f0952-d555-4cfc-8925-7d0609464514',
  SOLID_WHITE_ECO:  '53baea95-d318-48d8-915e-0fcb2a9ba9d7',
  FLUSH_DOORS:      '41d7f551-8662-4039-960c-9801c95ceee4',
};

// ─────────────────────────────────────────────────────────────────
// PRICE TABLE DATA
// ─────────────────────────────────────────────────────────────────

const rules = [];

// Helper to push a rule
function addRule(series_id, thickness, finish, shade, rate, max_height = null, max_width = null) {
  rules.push({ series_id, thickness: thickness || null, finish: finish || null, shade: shade || null, rate, max_height, max_width });
}

// ── TIMBOR ────────────────────────────────────────────────────────
// Main Door WG 1001–1020
addRule(IDS.TIMBOR, '32mm', '20mm Panel', null, 750);
addRule(IDS.TIMBOR, '32mm', '32mm Panel', null, 870);
addRule(IDS.TIMBOR, '38mm', '20mm Panel', null, 890);
addRule(IDS.TIMBOR, '38mm', '32mm Panel', null, 1010);
// Pooja Door
addRule(IDS.TIMBOR, '32mm', 'Pooja Door (WG 1051–1070)', null, 715);

// ── VEN DECOR LEGEND ─────────────────────────────────────────────
addRule(IDS.VEN_DECOR_LEGEND, '35mm', '1-Side',    null, 980);
addRule(IDS.VEN_DECOR_LEGEND, '35mm', '+Membrane', null, 1005, '87"', '44"');
addRule(IDS.VEN_DECOR_LEGEND, '35mm', '+0.8Lam',   null, 1056);
addRule(IDS.VEN_DECOR_LEGEND, '35mm', 'Both-Side', null, 1740);
addRule(IDS.VEN_DECOR_LEGEND, '38mm', '1-Side',    null, 1011);
addRule(IDS.VEN_DECOR_LEGEND, '38mm', '+Membrane', null, 1036, '87"', '44"');
addRule(IDS.VEN_DECOR_LEGEND, '38mm', '+0.8Lam',   null, 1087);
addRule(IDS.VEN_DECOR_LEGEND, '38mm', 'Both-Side', null, 1771);

// ── VEN DECOR LAVISH ─────────────────────────────────────────────
addRule(IDS.VEN_DECOR_LAVISH, '35mm', '1-Side',    null, 825);
addRule(IDS.VEN_DECOR_LAVISH, '35mm', '+Membrane', null, 850,  '87"', '44"');
addRule(IDS.VEN_DECOR_LAVISH, '35mm', '+0.8Lam',   null, 901);
addRule(IDS.VEN_DECOR_LAVISH, '35mm', 'Both-Side', null, 1435);
addRule(IDS.VEN_DECOR_LAVISH, '38mm', '1-Side',    null, 856);
addRule(IDS.VEN_DECOR_LAVISH, '38mm', '+Membrane', null, 881,  '87"', '44"');
addRule(IDS.VEN_DECOR_LAVISH, '38mm', '+0.8Lam',   null, 932);
addRule(IDS.VEN_DECOR_LAVISH, '38mm', 'Both-Side', null, 1466);

// ── VEN DECOR ELITE ──────────────────────────────────────────────
addRule(IDS.VEN_DECOR_ELITE, '35mm', '1-Side',    null, 765);
addRule(IDS.VEN_DECOR_ELITE, '35mm', '+Membrane', null, 790,  '87"', '44"');
addRule(IDS.VEN_DECOR_ELITE, '35mm', '+0.8Lam',   null, 841);
addRule(IDS.VEN_DECOR_ELITE, '35mm', 'Both-Side', null, 1314);
addRule(IDS.VEN_DECOR_ELITE, '38mm', '1-Side',    null, 796);
addRule(IDS.VEN_DECOR_ELITE, '38mm', '+Membrane', null, 821,  '87"', '44"');
addRule(IDS.VEN_DECOR_ELITE, '38mm', '+0.8Lam',   null, 872);
addRule(IDS.VEN_DECOR_ELITE, '38mm', 'Both-Side', null, 1345);

// ── VEN DECOR RICH ───────────────────────────────────────────────
addRule(IDS.VEN_DECOR_RICH, '35mm', '1-Side',    null, 605);
addRule(IDS.VEN_DECOR_RICH, '35mm', '+Membrane', null, 630,  '87"', '44"');
addRule(IDS.VEN_DECOR_RICH, '35mm', '+0.8Lam',   null, 681);
addRule(IDS.VEN_DECOR_RICH, '35mm', 'Both-Side', null, 1004);
addRule(IDS.VEN_DECOR_RICH, '38mm', '1-Side',    null, 636);
addRule(IDS.VEN_DECOR_RICH, '38mm', '+Membrane', null, 661,  '87"', '44"');
addRule(IDS.VEN_DECOR_RICH, '38mm', '+0.8Lam',   null, 712);
addRule(IDS.VEN_DECOR_RICH, '38mm', 'Both-Side', null, 1035);

// ── TEAK VENEER ──────────────────────────────────────────────────
addRule(IDS.TEAK_VENEER, '32mm', 'Plain',      null, 345);
addRule(IDS.TEAK_VENEER, '32mm', 'Grooved-OS', null, 380);
addRule(IDS.TEAK_VENEER, '32mm', 'Grooved-BS', null, 415);
addRule(IDS.TEAK_VENEER, '35mm', 'Plain',      null, 376);
addRule(IDS.TEAK_VENEER, '35mm', 'Grooved-OS', null, 411);
addRule(IDS.TEAK_VENEER, '35mm', 'Grooved-BS', null, 446);
addRule(IDS.TEAK_VENEER, '40mm', 'Plain',      null, 407);
addRule(IDS.TEAK_VENEER, '40mm', 'Grooved-OS', null, 442);
addRule(IDS.TEAK_VENEER, '40mm', 'Grooved-BS', null, 477);

// ── LAMOROUS ELITE ───────────────────────────────────────────────
addRule(IDS.LAMOROUS_ELITE, '32mm', '1-Side+Membrane', null, 505,  '87"', '44"');
addRule(IDS.LAMOROUS_ELITE, '32mm', '+Plain Lam',      null, 623);
addRule(IDS.LAMOROUS_ELITE, '32mm', 'Both-Side',       null, 758);
addRule(IDS.LAMOROUS_ELITE, '35mm', '1-Side+Membrane', null, 536,  '87"', '44"');
addRule(IDS.LAMOROUS_ELITE, '35mm', '+Plain Lam',      null, 654);
addRule(IDS.LAMOROUS_ELITE, '35mm', 'Both-Side',       null, 789);
addRule(IDS.LAMOROUS_ELITE, '40mm', '1-Side+Membrane', null, 567,  '87"', '44"');
addRule(IDS.LAMOROUS_ELITE, '40mm', '+Plain Lam',      null, 685);
addRule(IDS.LAMOROUS_ELITE, '40mm', 'Both-Side',       null, 820);

// ── LAMOROUS RICH ────────────────────────────────────────────────
addRule(IDS.LAMOROUS_RICH, '32mm', '1-Side+Membrane', null, 405, '87"', '44"');
addRule(IDS.LAMOROUS_RICH, '32mm', '+Plain Lam',      null, 523);
addRule(IDS.LAMOROUS_RICH, '32mm', 'Both-Side',       null, 558);
addRule(IDS.LAMOROUS_RICH, '35mm', '1-Side+Membrane', null, 436, '87"', '44"');
addRule(IDS.LAMOROUS_RICH, '35mm', '+Plain Lam',      null, 554);
addRule(IDS.LAMOROUS_RICH, '35mm', 'Both-Side',       null, 589);
addRule(IDS.LAMOROUS_RICH, '40mm', '1-Side+Membrane', null, 467, '87"', '44"');
addRule(IDS.LAMOROUS_RICH, '40mm', '+Plain Lam',      null, 585);
addRule(IDS.LAMOROUS_RICH, '40mm', 'Both-Side',       null, 620);

// ── LAMOROUS PRIME ───────────────────────────────────────────────
addRule(IDS.LAMOROUS_PRIME, '32mm', '1-Side+Membrane', null, 415, '87"', '44"');
addRule(IDS.LAMOROUS_PRIME, '32mm', '+Plain Lam',      null, 491);
addRule(IDS.LAMOROUS_PRIME, '32mm', 'Both-Side',       null, 626);
addRule(IDS.LAMOROUS_PRIME, '35mm', '1-Side+Membrane', null, 446, '87"', '44"');
addRule(IDS.LAMOROUS_PRIME, '35mm', '+Plain Lam',      null, 522);
addRule(IDS.LAMOROUS_PRIME, '35mm', 'Both-Side',       null, 657);
addRule(IDS.LAMOROUS_PRIME, '40mm', '1-Side+Membrane', null, 477, '87"', '44"');
addRule(IDS.LAMOROUS_PRIME, '40mm', '+Plain Lam',      null, 553);
addRule(IDS.LAMOROUS_PRIME, '40mm', 'Both-Side',       null, 688);

// ── LAMOROUS ECO ─────────────────────────────────────────────────
addRule(IDS.LAMOROUS_ECO, '32mm', '1-Side+Membrane', null, 315, '87"', '44"');
addRule(IDS.LAMOROUS_ECO, '32mm', '+Plain Lam',      null, 391);
addRule(IDS.LAMOROUS_ECO, '32mm', 'Both-Side',       null, 426);
addRule(IDS.LAMOROUS_ECO, '35mm', '1-Side+Membrane', null, 346, '87"', '44"');
addRule(IDS.LAMOROUS_ECO, '35mm', '+Plain Lam',      null, 422);
addRule(IDS.LAMOROUS_ECO, '35mm', 'Both-Side',       null, 457);
addRule(IDS.LAMOROUS_ECO, '40mm', '1-Side+Membrane', null, 377, '87"', '44"');
addRule(IDS.LAMOROUS_ECO, '40mm', '+Plain Lam',      null, 453);
addRule(IDS.LAMOROUS_ECO, '40mm', 'Both-Side',       null, 488);

// ── METALEM (32mm only) ───────────────────────────────────────────
addRule(IDS.METALEM, '32mm', null, 'Natural Teak / Andhra Teak / Rosewood', 367, '87"', '44"');
addRule(IDS.METALEM, '32mm', null, 'Mahogany',                              386, '87"', '44"');
addRule(IDS.METALEM, '32mm', null, 'Natural Wenge / Jungle Teak',           398, '87"', '44"');

// ── ESPIAL (32mm only) ────────────────────────────────────────────
addRule(IDS.ESPIAL, '32mm', null, 'Natural Teak / Andhra Teak / Rosewood', 300, '87"', '44"');
addRule(IDS.ESPIAL, '32mm', null, 'Mahogany',                              319, '87"', '44"');
addRule(IDS.ESPIAL, '32mm', null, 'Natural Wenge / Jungle Teak',           331, '87"', '44"');

// ── DIVINE (32mm only) ────────────────────────────────────────────
addRule(IDS.DIVINE, '32mm', null, 'Natural Teak / Andhra Teak / Rosewood', 300, '87"', '44"');
addRule(IDS.DIVINE, '32mm', null, 'Mahogany',                              319, '87"', '44"');
addRule(IDS.DIVINE, '32mm', null, 'Natural Wenge / Jungle Teak',           331, '87"', '44"');

// ── EMBOZZ (32mm only) ────────────────────────────────────────────
addRule(IDS.EMBOZZ, '32mm', null, 'Natural Teak / Andhra Teak / Rosewood', 300, '87"', '44"');
addRule(IDS.EMBOZZ, '32mm', null, 'Mahogany',                              319, '87"', '44"');
addRule(IDS.EMBOZZ, '32mm', null, 'Natural Wenge / Jungle Teak',           331, '87"', '44"');

// ── LAMINA (32mm only) ────────────────────────────────────────────
addRule(IDS.LAMINA, '32mm', null, 'Natural Teak / Andhra Teak / Rosewood', 252, '87"', '44"');
addRule(IDS.LAMINA, '32mm', null, 'Mahogany',                              271, '87"', '44"');
addRule(IDS.LAMINA, '32mm', null, 'Natural Wenge / Jungle Teak',           283, '87"', '44"');

// ── SOLID WHITE RICH (32mm only) ─────────────────────────────────
addRule(IDS.SOLID_WHITE_RICH, '32mm', 'Solid White Rich',          null, 315);
addRule(IDS.SOLID_WHITE_RICH, '32mm', 'Divine Collection Designs', null, 286);

// ── SOLID WHITE ECO (32mm only) ──────────────────────────────────
addRule(IDS.SOLID_WHITE_ECO, '32mm', 'Solid White ECO', null, 235);

// ── FLUSH DOORS ───────────────────────────────────────────────────
addRule(IDS.FLUSH_DOORS, '32mm', 'Standard', null, 165);
addRule(IDS.FLUSH_DOORS, '35mm', 'Standard', null, 196);
addRule(IDS.FLUSH_DOORS, '38mm', 'Standard', null, 227);
addRule(IDS.FLUSH_DOORS, '42mm', 'Standard', null, 258);

// ─────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\nClearing old pricing rules...`);
  const { error: delErr } = await supabase.from('pricing_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) { console.error('Delete error:', delErr.message); process.exit(1); }

  console.log(`Inserting ${rules.length} new pricing rules...`);
  
  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < rules.length; i += BATCH) {
    const batch = rules.slice(i, i + BATCH);
    const { error: insErr } = await supabase.from('pricing_rules').insert(batch);
    if (insErr) { console.error('Insert error:', insErr.message); process.exit(1); }
    inserted += batch.length;
    console.log(`  ✓ Inserted ${inserted}/${rules.length} rules...`);
  }

  console.log(`\n✅ DONE! Seeded ${rules.length} pricing rules successfully.\n`);
}

seed().catch(console.error);
