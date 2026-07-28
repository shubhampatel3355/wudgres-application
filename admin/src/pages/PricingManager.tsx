import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, IndianRupee, Calculator, ChevronRight, ChevronDown, FolderTree, Layers } from 'lucide-react';

const PricingManager = () => {
  const [series, setSeries] = useState<any[]>([]);
  const [activeSeries, setActiveSeries] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [finishes, setFinishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Expanded categories state
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

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
    fetchInitialData();
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

  const fetchInitialData = async () => {
    setLoading(true);
    // Fetch all series (both parent and sub-categories)
    const { data: seriesData } = await supabase.from('series').select('*').order('name');
    if (seriesData) setSeries(seriesData);
    
    // Fetch dynamic finishes
    const { data: finishesData } = await supabase.from('finishes').select('*').order('name');
    if (finishesData) setFinishes(finishesData);

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

  const toggleCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Build a tree of series
  const topLevelSeries = series.filter(s => !s.parent_id);
  const getSubSeries = (parentId: string) => series.filter(s => s.parent_id === parentId);

  // Calculator logic
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

  const thicknessOptions = [...new Set(rules.map(r => r.thickness).filter(Boolean))].sort();
  const finishShadeOptions = [...new Set(rules.map(r => r.finish || r.shade).filter(Boolean))];

  return (
    <div className="animate-fade-in pricing-layout">
      {/* Sidebar for Series Selection */}
      <div className="pricing-sidebar">
        <div style={{ padding: '2rem 1.5rem 1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Pricing Rules</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select a series or sub-category to manage prices</p>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 1rem 2rem' }}>
          {loading && !series.length ? <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading...</div> : null}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {topLevelSeries.map(s => {
              const subSeries = getSubSeries(s.id);
              const hasSub = subSeries.length > 0;
              const isExpanded = expandedCats[s.id];
              const isActive = activeSeries?.id === s.id;

              return (
                <div key={s.id}>
                  {/* Top Level Item */}
                  <div 
                    onClick={() => { setActiveSeries(s); setIsEditing(null); }}
                    style={{ 
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: isActive ? 'var(--bg-secondary)' : 'transparent',
                      border: isActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                    }}
                  >
                    {hasSub ? (
                      <div onClick={(e) => toggleCategory(s.id, e)} style={{ padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    ) : (
                      <div style={{ width: '24px' }}></div>
                    )}
                    <FolderTree size={16} style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)' }} />
                    <div style={{ fontWeight: isActive ? 600 : 500, fontSize: '0.95rem', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {s.name}
                    </div>
                  </div>

                  {/* Sub Categories */}
                  {hasSub && isExpanded && (
                    <div style={{ marginLeft: '2.5rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {subSeries.map(sub => {
                        const isSubActive = activeSeries?.id === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => { setActiveSeries(sub); setIsEditing(null); }}
                            style={{ 
                              padding: '0.6rem 1rem',
                              cursor: 'pointer',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: isSubActive ? 'var(--bg-secondary)' : 'transparent',
                              border: isSubActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                            }}
                          >
                            <Layers size={14} style={{ color: isSubActive ? 'var(--accent-gold)' : 'var(--text-muted)' }} />
                            <div style={{ fontWeight: isSubActive ? 600 : 400, fontSize: '0.9rem', color: isSubActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {sub.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pricing-content">
        
        {/* Left Column: Rules Form & Table */}
        <div className="pricing-content-main">
          
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>
                  {activeSeries ? `Pricing Rules for ${activeSeries.name}` : 'Select a Series or Sub-category'}
                </h2>
                {activeSeries && activeSeries.parent_id && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginTop: '0.25rem' }}>
                    Sub-category of {series.find(s => s.id === activeSeries.parent_id)?.name}
                  </div>
                )}
              </div>
              {activeSeries && !isEditing && (
                <button onClick={() => startEdit()} className="btn btn-primary">
                  <Plus size={16} /> Add Rule
                </button>
              )}
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              {!activeSeries ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>
                  <IndianRupee size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>Select a series from the left sidebar to view or edit its pricing rules.</p>
                </div>
              ) : isEditing ? (
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {isEditing === 'new' ? 'Create New Pricing Rule' : 'Edit Pricing Rule'}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Thickness</label>
                      <input 
                        className="input-field" 
                        list="thickness-options" 
                        value={formData.thickness} 
                        onChange={e => setFormData({...formData, thickness: e.target.value})} 
                        placeholder="Any Thickness" 
                      />
                      <datalist id="thickness-options">
                        {activeSeries?.allowed_thicknesses?.split(',').filter(Boolean).map((t: string) => <option key={t.trim()} value={t.trim()} />)}
                      </datalist>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Finish / Design</label>
                      <input 
                        className="input-field" 
                        list="finish-options" 
                        value={formData.finish} 
                        onChange={e => setFormData({...formData, finish: e.target.value})} 
                        placeholder="Any Finish" 
                      />
                      <datalist id="finish-options">
                        {finishes.map(f => <option key={f.name} value={f.name} />)}
                      </datalist>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Shade</label>
                      <input 
                        className="input-field" 
                        list="shade-options" 
                        value={formData.shade} 
                        onChange={e => setFormData({...formData, shade: e.target.value})} 
                        placeholder="Any Shade" 
                      />
                      <datalist id="shade-options">
                        {activeSeries?.allowed_shades?.split(',').filter(Boolean).map((s: string) => <option key={s.trim()} value={s.trim()} />)}
                      </datalist>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Rate (₹/SQFT) *</label>
                      <input type="number" step="0.01" required className="input-field" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} placeholder="e.g. 1500" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Max Height (Optional)</label>
                      <input 
                        className="input-field" 
                        list="height-options" 
                        value={formData.max_height} 
                        onChange={e => setFormData({...formData, max_height: e.target.value})} 
                        placeholder="No Limit" 
                      />
                      <datalist id="height-options">
                        {activeSeries?.allowed_heights?.split(',').filter(Boolean).map((h: string) => <option key={h.trim()} value={h.trim()} />)}
                      </datalist>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Max Width (Optional)</label>
                      <input 
                        className="input-field" 
                        list="width-options" 
                        value={formData.max_width} 
                        onChange={e => setFormData({...formData, max_width: e.target.value})} 
                        placeholder="No Limit" 
                      />
                      <datalist id="width-options">
                        {activeSeries?.allowed_widths?.split(',').filter(Boolean).map((w: string) => <option key={w.trim()} value={w.trim()} />)}
                      </datalist>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary"><Save size={16}/> Save Rule</button>
                    <button type="button" onClick={() => setIsEditing(null)} className="btn btn-secondary"><X size={16}/> Cancel</button>
                  </div>
                </form>
              ) : (
                <div>
                  {loading ? (
                    <div style={{ color: 'var(--text-muted)' }}>Loading rules...</div>
                  ) : rules.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                      <p>No pricing rules defined for this series yet.</p>
                      <button onClick={() => startEdit()} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        <Plus size={16} /> Create First Rule
                      </button>
                    </div>
                  ) : (
                    <table className="data-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '15%' }}>Thickness</th>
                          <th style={{ width: '25%' }}>Finish / Design</th>
                          <th style={{ width: '20%' }}>Shade</th>
                          <th style={{ width: '20%' }}>Max Size</th>
                          <th style={{ width: '15%' }}>Rate (₹/SQFT)</th>
                          <th style={{ width: '5%', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rules.map(rule => (
                          <tr key={rule.id}>
                            <td>
                              <span style={{ background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                {rule.thickness || 'Any'}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{rule.finish || 'Any'}</div>
                              {rule.finish && finishes.find(f => f.name === rule.finish) && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  {finishes.find(f => f.name === rule.finish)?.description}
                                </div>
                              )}
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{rule.shade || 'Any'}</td>
                            <td>
                              {(rule.max_height || rule.max_width) ? 
                                <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,150,50,0.15)', color: '#f90', padding: '4px 8px', borderRadius: '4px' }}>
                                  ≤ {rule.max_height || 'Any'} × {rule.max_width || 'Any'}
                                </span> 
                                : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No limit</span>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1.05rem' }}>
                                <IndianRupee size={14}/>{rule.rate.toLocaleString('en-IN')}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button onClick={() => startEdit(rule)} className="btn btn-icon"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(rule.id)} className="btn btn-icon" style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
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

        {/* Right Column: Calculator (Sticky) */}
        {activeSeries && rules.length > 0 && !isEditing && (
          <div className="pricing-calculator">
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '1rem', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                <Calculator size={20} /> Price Calculator
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Height (in)</label>
                    <input className="input-field" style={{ minWidth: 0, width: '100%' }} value={calcHeight} onChange={e => setCalcHeight(e.target.value)} placeholder="84" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Width (in)</label>
                    <input className="input-field" style={{ minWidth: 0, width: '100%' }} value={calcWidth} onChange={e => setCalcWidth(e.target.value)} placeholder="36" />
                  </div>
                </div>

                {thicknessOptions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Thickness</label>
                    <select className="input-field" value={calcThickness} onChange={e => setCalcThickness(e.target.value)}>
                      <option value="">Any</option>
                      {thicknessOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}
                
                {finishShadeOptions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Finish / Shade</label>
                    <select className="input-field" value={calcFinishOrShade} onChange={e => setCalcFinishOrShade(e.target.value)}>
                      <option value="">Any</option>
                      {finishShadeOptions.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                )}

                {calcEstimate && (
                  <div style={{ 
                    background: 'rgba(194,164,111,0.12)', 
                    border: '1px solid rgba(194,164,111,0.3)', 
                    borderRadius: '12px', 
                    padding: '1.25rem', 
                    marginTop: '0.5rem',
                    textAlign: 'center' 
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Rate: ₹{calcEstimate.rate}/sqft × {calcEstimate.sqft} sqft
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      ₹{calcEstimate.total}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PricingManager;
