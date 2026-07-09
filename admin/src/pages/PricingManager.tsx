import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, IndianRupee, Calculator } from 'lucide-react';

const FINISH_DESCRIPTIONS: Record<string, string> = {
  '1-Side': 'Front face design only, back is plain',
  '+Membrane': 'Front design + thin membrane on back (Max 87"×44")',
  '+0.8Lam': 'Front design + 0.8mm laminate on back',
  'Both-Side': 'Full design on both front and back faces',
  '1-Side+Membrane': 'Front design + thin membrane on back (Max 87"×44")',
  '+Plain Lam': 'Front design + plain laminate on back',
  'Plain': 'Smooth teak veneer on both sides, no grooves',
  'Grooved-OS': 'Decorative grooves on front face only',
  'Grooved-BS': 'Decorative grooves on both front and back faces',
  'Pooja Door (WG 1051–1070)': 'Pooja door design, 32mm only',
};

const PricingManager = () => {
  const [series, setSeries] = useState<any[]>([]);
  const [activeSeries, setActiveSeries] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Price Calculator State
  const [calcHeight, setCalcHeight] = useState('84');
  const [calcWidth, setCalcWidth] = useState('36');
  const [calcThickness, setCalcThickness] = useState('');
  const [calcFinishOrShade, setCalcFinishOrShade] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    thickness: '',
    finish: '',
    shade: '',
    rate: '',
    max_height: '',
    max_width: ''
  });

  useEffect(() => {
    fetchSeries();
  }, []);

  useEffect(() => {
    if (activeSeries) {
      fetchRules(activeSeries.id);
      setCalcThickness('');
      setCalcFinishOrShade('');
    } else {
      setRules([]);
    }
  }, [activeSeries]);

  const fetchSeries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('series').select('*').is('parent_id', null).order('name');
    if (error) console.error(error);
    else {
      setSeries(data || []);
      if (data && data.length > 0) setActiveSeries(data[0]);
    }
    setLoading(false);
  };

  const fetchRules = async (seriesId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('series_id', seriesId)
      .order('thickness')
      .order('finish');
    if (error) console.error(error);
    else setRules(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeries) return;

    const payload = {
      series_id: activeSeries.id,
      thickness: formData.thickness || null,
      finish: formData.finish || null,
      shade: formData.shade || null,
      rate: parseFloat(formData.rate) || 0,
      max_height: formData.max_height || null,
      max_width: formData.max_width || null
    };

    if (isEditing && isEditing !== 'new') {
      await supabase.from('pricing_rules').update(payload).eq('id', isEditing);
    } else {
      await supabase.from('pricing_rules').insert([payload]);
    }
    
    setIsEditing(null);
    fetchRules(activeSeries.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this pricing rule?')) {
      await supabase.from('pricing_rules').delete().eq('id', id);
      fetchRules(activeSeries.id!);
    }
  };

  const startEdit = (rule?: any) => {
    if (rule) {
      setIsEditing(rule.id);
      setFormData({
        thickness: rule.thickness || '',
        finish: rule.finish || '',
        shade: rule.shade || '',
        rate: rule.rate.toString(),
        max_height: rule.max_height || '',
        max_width: rule.max_width || ''
      });
    } else {
      setIsEditing('new');
      setFormData({ thickness: '', finish: '', shade: '', rate: '', max_height: '', max_width: '' });
    }
  };

  // Calculator logic: (H/12) × (W/12) × rate
  const calcEstimate = useMemo(() => {
    if (!rules.length || !calcHeight || !calcWidth) return null;
    const matchingRule =
      rules.find(r =>
        r.thickness === calcThickness &&
        (r.finish === calcFinishOrShade || r.shade === calcFinishOrShade)
      ) ||
      rules.find(r => r.thickness === calcThickness) ||
      rules.find(r => r.finish === calcFinishOrShade || r.shade === calcFinishOrShade) ||
      rules[0];

    const rate = matchingRule?.rate || 0;
    const h = parseFloat(calcHeight) || 84;
    const w = parseFloat(calcWidth) || 36;
    const sqft = (h / 12) * (w / 12);
    const total = rate * sqft;
    return { rate, sqft: sqft.toFixed(2), total: Math.round(total).toLocaleString('en-IN'), rule: matchingRule };
  }, [rules, calcHeight, calcWidth, calcThickness, calcFinishOrShade]);

  // Unique thickness and finish/shade options for calculator dropdowns
  const thicknessOptions = [...new Set(rules.map(r => r.thickness).filter(Boolean))].sort();
  const finishShadeOptions = [...new Set(rules.map(r => r.finish || r.shade).filter(Boolean))];

  return (
    <div className="animate-fade-in split-layout" style={{ height: 'calc(100vh - 4rem)', display: 'flex', gap: '1.5rem' }}>
      {/* Sidebar for Series Selection */}
      <div className="glass-panel" style={{ width: '260px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
          Door Series
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading && !series.length ? <div style={{ padding: '1rem' }}>Loading...</div> : null}
          {series.map(s => (
            <div 
              key={s.id} 
              onClick={() => { setActiveSeries(s); setIsEditing(null); }}
              style={{ 
                padding: '0.85rem 1rem', 
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: activeSeries?.id === s.id ? 'rgba(194, 164, 111, 0.15)' : 'transparent',
                borderLeft: activeSeries?.id === s.id ? '3px solid var(--accent-gold)' : '3px solid transparent'
              }}
            >
              <div style={{ fontWeight: activeSeries?.id === s.id ? 700 : 400, fontSize: '0.85rem' }}>{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
        
        {/* Price Calculator Card */}
        {activeSeries && rules.length > 0 && !isEditing && (
          <div className="glass-panel" style={{ padding: '1.25rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 700 }}>
              <Calculator size={18} color="var(--accent-gold)" /> Price Calculator — {activeSeries.name}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Height (in)</label>
                <input className="input-field" value={calcHeight} onChange={e => setCalcHeight(e.target.value)} style={{ width: '90px' }} placeholder="84" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Width (in)</label>
                <input className="input-field" value={calcWidth} onChange={e => setCalcWidth(e.target.value)} style={{ width: '90px' }} placeholder="36" />
              </div>
              {thicknessOptions.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Thickness</label>
                  <select className="input-field" value={calcThickness} onChange={e => setCalcThickness(e.target.value)} style={{ width: '110px' }}>
                    <option value="">Any</option>
                    {thicknessOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
              {finishShadeOptions.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Finish / Shade</label>
                  <select className="input-field" value={calcFinishOrShade} onChange={e => setCalcFinishOrShade(e.target.value)} style={{ width: '200px' }}>
                    <option value="">Any</option>
                    {finishShadeOptions.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}
              {calcEstimate && (
                <div style={{ background: 'rgba(194,164,111,0.12)', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '0.75rem 1.25rem', marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Rate: ₹{calcEstimate.rate}/sqft × {calcEstimate.sqft} sqft
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    ₹{calcEstimate.total}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Incl. GST • Freight extra</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rules Table */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>
              {activeSeries ? `Pricing Rules — ${activeSeries.name}` : 'Select a Series'}
            </h2>
            {activeSeries && !isEditing && (
              <button onClick={() => startEdit()} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                <Plus size={16} /> Add Rule
              </button>
            )}
          </div>

          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
            {!activeSeries ? (
              <div style={{ color: 'var(--text-muted)' }}>Select a series from the left to view its pricing rules.</div>
            ) : isEditing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{isEditing === 'new' ? 'New Pricing Rule' : 'Edit Rule'}</h3>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Thickness (e.g. 32mm)</label>
                    <input type="text" className="input-field" value={formData.thickness} onChange={e => setFormData({...formData, thickness: e.target.value})} placeholder="32mm" />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label>Finish (e.g. 1-Side, Both-Side)</label>
                    <input type="text" className="input-field" value={formData.finish} onChange={e => setFormData({...formData, finish: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 2 }}>
                    <label>Shade (for shade-based series)</label>
                    <input type="text" className="input-field" value={formData.shade} onChange={e => setFormData({...formData, shade: e.target.value})} placeholder="e.g. Mahogany" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Rate (₹/SQFT) *</label>
                    <input type="number" step="0.01" required className="input-field" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Max Height (e.g. 87")</label>
                    <input type="text" className="input-field" value={formData.max_height} onChange={e => setFormData({...formData, max_height: e.target.value})} placeholder='87"' />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Max Width (e.g. 44")</label>
                    <input type="text" className="input-field" value={formData.max_width} onChange={e => setFormData({...formData, max_width: e.target.value})} placeholder='44"' />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary"><Save size={16}/> Save Rule</button>
                  <button type="button" onClick={() => setIsEditing(null)} className="btn btn-secondary"><X size={16}/> Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                {loading ? (
                  <div>Loading rules...</div>
                ) : rules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No pricing rules defined for this series yet.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Thickness</th>
                        <th>Finish / Design</th>
                        <th>Shade</th>
                        <th>Max Size</th>
                        <th>Rate (₹/SQFT)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map(rule => (
                        <tr key={rule.id}>
                          <td><span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{rule.thickness || 'Any'}</span></td>
                          <td>
                            {rule.finish || '-'}
                            {rule.finish && FINISH_DESCRIPTIONS[rule.finish] && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{FINISH_DESCRIPTIONS[rule.finish]}</div>
                            )}
                          </td>
                          <td>{rule.shade || '-'}</td>
                          <td>
                            {(rule.max_height || rule.max_width) ? 
                              <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,150,50,0.15)', color: '#f90', padding: '2px 6px', borderRadius: '4px' }}>
                                ≤ {rule.max_height || 'Any'} × {rule.max_width || 'Any'}
                              </span> 
                              : <span style={{ color: 'var(--text-muted)' }}>No limit</span>}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '1rem' }}>
                              <IndianRupee size={14}/>{rule.rate.toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => startEdit(rule)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDelete(rule.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingManager;
