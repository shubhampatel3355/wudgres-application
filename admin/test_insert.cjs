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

async function check() {
    const { data: series } = await supabase.from('series').select('id').limit(1).single();
    
    const payload = { 
        name: '', 
        slug: 'test-empty-name',
        description: '',
        series_id: series.id,
        image_url: '',
    };
    
    console.log('Testing empty name:');
    const { error: err, status } = await supabase.from('products').insert([payload]);
    console.log('Error status:', status, err);
    if (!err) {
        await supabase.from('products').delete().eq('slug', 'test-empty-name');
    }
}

check();
