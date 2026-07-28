import { useEffect, useState, type KeyboardEvent } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Save, X, FolderTree, ArrowRight } from 'lucide-react';

const TagInput = ({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder: string }) => {
  const [inputValue, setInputValue] = useState('');
  
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        const newTags = [...tags, inputValue.trim()];
        onChange(newTags.join(', '));
        setInputValue('');
      }
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags.join(', '));
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
      {tags.map((tag, i) => (
        <div key={i} style={{ background: 'var(--accent-gold)', color: '#000', padding: '0.4rem 1.25rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          {tag}
          <button type="button" onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.6 }}>
            <X size={14} />
          </button>
        </div>
      ))}
      <div style={{ background: 'var(--bg-tertiary)', padding: '0.4rem 1.25rem', borderRadius: '24px', display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              const newTags = [...tags, inputValue.trim()];
              onChange(newTags.join(', '));
              setInputValue('');
            }
          }}
          placeholder={placeholder}
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '80px', padding: 0, color: 'var(--text-primary)', fontSize: '0.875rem' }}
        />
      </div>
    </div>
  );
};

const SeriesManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);

  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [activeSeries, setActiveSeries] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    category_id: '',
    allowed_thicknesses: '',
    allowed_heights: '',
    allowed_widths: '',
    allowed_shades: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: catData, error: catError } = await supabase.from('categories').select('*').order('name');
    if (catError) console.error(catError);
    else setCategories(catData || []);

    const { data: serData, error: serError } = await supabase.from('series').select('*').order('name');
    if (serError) console.error(serError);
    else setSeriesList(serData || []);

    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: formData.category_id || null,
      parent_id: formData.parent_id || null,
      allowed_thicknesses: formData.allowed_thicknesses || null,
      allowed_heights: formData.allowed_heights || null,
      allowed_widths: formData.allowed_widths || null,
      allowed_shades: formData.allowed_shades || null,
    };

    if (isEditing && isEditing !== 'new') {
      await supabase.from('series').update(payload).eq('id', isEditing);
    } else {
      await supabase.from('series').insert([payload]);
    }
    
    setIsEditing(null);
    setActiveSeries(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this series? All child series and products will also be deleted!')) {
      await supabase.from('series').delete().eq('id', id);
      fetchData();
    }
  };

  const startEdit = (series?: any, defaultParentId?: string, defaultCategoryId?: string) => {
    if (series) {
      setIsEditing(series.id);
      setActiveSeries(series);
      setFormData({
        name: series.name || '',
        slug: series.slug || '',
        parent_id: series.parent_id || '',
        category_id: series.category_id || '',
        allowed_thicknesses: series.allowed_thicknesses || '',
        allowed_heights: series.allowed_heights || '',
        allowed_widths: series.allowed_widths || '',
        allowed_shades: series.allowed_shades || ''
      });
    } else {
      setIsEditing('new');
      setActiveSeries(null);
      setFormData({ 
        name: '', 
        slug: '', 
        parent_id: defaultParentId || '', 
        category_id: defaultCategoryId || '',
        allowed_thicknesses: '', 
        allowed_heights: '', 
        allowed_widths: '',
        allowed_shades: '' 
      });
    }
  };

  return (
    <div className="animate-fade-in split-layout" style={{ height: 'calc(100vh - 4rem)', display: 'flex', gap: '2rem' }}>
      
      {/* Left Sidebar Collections List */}
      <div style={{ width: '380px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
        <div style={{ padding: '2rem 2rem 1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Collections</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage series and material groupings</p>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 2rem 2rem' }}>
          {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : null}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {seriesList.filter(s => !s.parent_id).map(series => {
              const isActive = activeSeries?.id === series.id;
              const cat = categories.find(c => c.id === series.category_id);
              const subSeries = seriesList.filter(s => s.parent_id === series.id);
              
              return (
                <div key={series.id}>
                  <div 
                    onClick={() => startEdit(series)}
                    style={{
                      background: isActive ? 'var(--bg-secondary)' : 'transparent',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                      boxShadow: isActive ? '0 0 15px rgba(192, 162, 103, 0.05)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      {series.thumbnail_url ? (
                        <img src={series.thumbnail_url} alt={series.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <FolderTree size={16} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.95rem' }}>{series.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                         {cat ? cat.name : 'Uncategorized'}
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: isActive ? 'var(--accent-gold)' : 'transparent' }} />
                  </div>

                  {subSeries.length > 0 && (
                    <div style={{ marginLeft: '3rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {subSeries.map(sub => {
                        const isSubActive = activeSeries?.id === sub.id;
                        return (
                          <div 
                            key={sub.id}
                            onClick={() => startEdit(sub)}
                            style={{
                              background: isSubActive ? 'var(--bg-secondary)' : 'transparent',
                              borderRadius: '8px',
                              padding: '0.6rem 1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              cursor: 'pointer',
                              border: isSubActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ flex: 1, fontWeight: isSubActive ? 600 : 400, color: isSubActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {sub.name}
                            </div>
                            <ArrowRight size={12} style={{ color: isSubActive ? 'var(--accent-gold)' : 'transparent' }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => startEdit()} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 
              }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px dashed var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} />
              </div>
              Add New Collection
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        <div style={{ padding: '3rem 4rem', overflowY: 'auto', flex: 1 }}>
          {!isEditing ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '10rem' }}>
              <FolderTree size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem' }} />
              <p style={{ fontSize: '1.1rem' }}>Select a collection from the sidebar to manage its properties.</p>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '800px' }}>
              
              <div>
                <div style={{ 
                  color: 'var(--accent-gold)', 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '1rem' 
                }}>
                  Catalog &gt; Series Management &gt; {isEditing === 'new' ? 'Create' : 'Edit'}
                </div>
                
                <h1 className="serif-heading" style={{ 
                  fontSize: '3rem', 
                  fontWeight: 400, 
                  fontStyle: 'italic', 
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  lineHeight: 1.1
                }}>
                  {isEditing === 'new' ? 'Create New Collection' : `Edit ${activeSeries?.name} Collection`}
                </h1>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '90%' }}>
                  Refine the specifications, visual assets, and dimensional constraints for the {isEditing === 'new' ? 'new' : activeSeries?.name} series.
                </p>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'var(--accent-gold)' }}>Collection Name</label>
                  <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ background: 'var(--bg-secondary)', border: 'none' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'var(--accent-gold)' }}>Category</label>
                  <select className="input-field" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required style={{ background: 'var(--bg-secondary)', border: 'none' }}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="serif-heading" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  Dimensional Constraints
                </h3>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Available Heights (Inches)</label>
                  <TagInput 
                    value={formData.allowed_heights} 
                    onChange={(v) => setFormData({...formData, allowed_heights: v})}
                    placeholder='+ Custom'
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Available Widths (Inches)</label>
                  <TagInput 
                    value={formData.allowed_widths} 
                    onChange={(v) => setFormData({...formData, allowed_widths: v})}
                    placeholder='+ Custom'
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Thicknesses (mm)</label>
                  <TagInput 
                    value={formData.allowed_thicknesses} 
                    onChange={(v) => setFormData({...formData, allowed_thicknesses: v})}
                    placeholder='+ Custom'
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Shades</label>
                  <TagInput 
                    value={formData.allowed_shades} 
                    onChange={(v) => setFormData({...formData, allowed_shades: v})}
                    placeholder='e.g. Walnut, Oak, + Custom'
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                  <Save size={18} /> Save Changes
                </button>
                {isEditing !== 'new' && (
                  <button type="button" onClick={() => handleDelete(activeSeries.id)} className="btn btn-danger">
                    <Trash2 size={18} /> Delete
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesManager;
