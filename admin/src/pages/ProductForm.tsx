import { useEffect, useState, type KeyboardEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Helper component for multiple values (tags)
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
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-secondary)' }}>
      {tags.map((tag, i) => (
        <div key={i} style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          {tag}
          <button type="button" onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
      ))}
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
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: '150px', padding: 0 }}
      />
    </div>
  );
};

const ChipSelector = ({ available, selected, onChange }: { available: string, selected: string, onChange: (v: string) => void }) => {
  const availableList = available ? available.split(',').map(s => s.trim()).filter(Boolean) : [];
  const selectedList = selected ? selected.split(',').map(s => s.trim()).filter(Boolean) : [];

  const addOpt = (opt: string) => {
    if (!selectedList.includes(opt)) {
      onChange([...selectedList, opt].join(', '));
    }
  };

  const removeOpt = (opt: string) => {
    onChange(selectedList.filter(s => s !== opt).join(', '));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
    
    const newSelected = [...selectedList];
    const [moved] = newSelected.splice(sourceIndex, 1);
    newSelected.splice(targetIndex, 0, moved);
    
    onChange(newSelected.join(', '));
  };

  const unselectedList = availableList.filter(opt => !selectedList.includes(opt));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Selected (Draggable) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', minHeight: selectedList.length ? 'auto' : '40px', padding: '0.5rem', background: 'rgba(0,0,0,0.15)', border: '1px dashed var(--border-subtle)', borderRadius: '8px' }}>
        {selectedList.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center', margin: '0 auto' }}>Select options from below...</span>}
        {selectedList.map((opt, index) => (
          <div 
            key={opt}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            style={{ 
              padding: '0.3rem 0.6rem 0.3rem 0.8rem', 
              borderRadius: '24px', 
              border: '1px solid var(--accent-gold)',
              background: 'var(--accent-gold)',
              color: '#000',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              userSelect: 'none'
            }}
          >
            {opt}
            <div onClick={() => removeOpt(opt)} style={{ cursor: 'pointer', padding: '0 4px', fontSize: '1.2rem', lineHeight: 1, opacity: 0.7 }}>&times;</div>
          </div>
        ))}
      </div>
      
      {/* Available */}
      {unselectedList.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {unselectedList.map(opt => (
            <button 
              key={opt}
              type="button" 
              onClick={() => addOpt(opt)}
              style={{ 
                padding: '0.35rem 0.8rem', 
                borderRadius: '24px', 
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              + {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categories, setCategories] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pricingFinishes, setPricingFinishes] = useState<string>('');
  const [pricingShades, setPricingShades] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    parent_series_id: '',
    series_id: '',
    image_url: '',
    height: '',
    width: '',
    thickness: '',
    shade: '',
    finish: '',
    dimensions: '',
    rate: '',
    is_active: true,
    brass_dome_enabled: false,
    hrztl_pcs_enabled: false,
  });

  useEffect(() => {
    const loadData = async () => {
      const allSeries = await fetchDropdowns();
      if (isEditing) {
        await fetchProduct(allSeries);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    const ids = [formData.series_id, formData.parent_series_id].filter(Boolean);
    if (ids.length > 0) {
      const fetchPricing = async () => {
        const { data } = await supabase.from('pricing_rules').select('finish, shade').in('series_id', ids);
        if (data && data.length > 0) {
          const finishes = Array.from(new Set(data.map(d => d.finish).filter(Boolean))).join(', ');
          const shades = Array.from(new Set(data.map(d => d.shade).filter(Boolean))).join(', ');
          setPricingFinishes(finishes);
          setPricingShades(shades);
        } else {
          setPricingFinishes('');
          setPricingShades('');
        }
      };
      fetchPricing();
    } else {
      setPricingFinishes('');
      setPricingShades('');
    }
  }, [formData.series_id, formData.parent_series_id]);

  const fetchDropdowns = async () => {
    const { data: catData } = await supabase.from('categories').select('id, name');
    if (catData) setCategories(catData);
    
    const { data: serData } = await supabase.from('series').select('id, name, category_id, parent_id, allowed_thicknesses, allowed_heights, allowed_widths, allowed_shades');
    if (serData) setSeriesList(serData);
    
    return serData || [];
  };

  const fetchProduct = async (allSeries: any[]) => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      // Find out if the selected series is a child
      const currentSeries = allSeries.find(s => s.id === data.series_id);
      let parent_id = '';
      let child_id = '';
      
      if (currentSeries?.parent_id) {
        parent_id = currentSeries.parent_id;
        child_id = data.series_id;
      } else {
        parent_id = data.series_id || '';
      }

      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        category_id: currentSeries?.category_id || '',
        parent_series_id: parent_id,
        series_id: child_id,
        image_url: data.image_url || '',
        height: data.height || '',
        width: data.width || '',
        thickness: data.thickness || '',
        shade: data.shade || '',
        finish: data.finish || '',
        dimensions: data.dimensions || '',
        rate: data.rate || '',
        is_active: data.is_active !== false,
        brass_dome_enabled: data.brass_dome_enabled !== false,
        hrztl_pcs_enabled: data.hrztl_pcs_enabled !== false,
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      const allSeries = await fetchDropdowns();
      if (isEditing) {
        await fetchProduct(allSeries);
      }
    };
    init();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
      
      // Reset series when category changes
      if (name === 'category_id') {
        newData.parent_series_id = '';
        newData.series_id = '';
      }
      
      // Reset sub-series when parent series changes
      if (name === 'parent_series_id') {
        newData.series_id = '';
      }

      // Auto-fill dimensions based on series selection
      if (name === 'series_id' || (name === 'parent_series_id' && !newData.series_id)) {
        const activeId = name === 'series_id' ? value : (newData.series_id || value);
        if (activeId) {
          const selectedSeries = seriesList.find(s => s.id === activeId);
          if (selectedSeries) {
            // If it's a new product or dimensions are empty, auto-select all allowed options
            if (!isEditing || (!newData.thickness && !newData.height && !newData.width)) {
              newData.thickness = selectedSeries.allowed_thicknesses || '';
              newData.height = selectedSeries.allowed_heights || '';
              newData.width = selectedSeries.allowed_widths || '';
              newData.shade = selectedSeries.allowed_shades || '';
            }
          }
        }
      }

      return newData;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      // Upload to 'product-images' bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      
      if (data && data.publicUrl) {
        setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      }
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If there is a sub-series selected, use that, otherwise use parent series ID.
    const finalSeriesId = formData.series_id || formData.parent_series_id;
    const finalSlug = formData.name || `product-${Date.now()}`;

    const payload: any = { 
      name: formData.name || '',
      slug: finalSlug,
      description: formData.description,
      series_id: finalSeriesId,
      image_url: formData.image_url,
      height: formData.height,
      width: formData.width,
      thickness: formData.thickness,
      shade: formData.shade,
      finish: formData.finish,
      dimensions: formData.dimensions,
      rate: formData.rate ? parseFloat(formData.rate) : null,
      is_active: formData.is_active,
      brass_dome_enabled: formData.brass_dome_enabled,
      hrztl_pcs_enabled: formData.hrztl_pcs_enabled,
    };
    
    if (isEditing) {
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (!error) navigate('/products');
      else {
        console.error(error);
        alert(error.message || 'Error updating product');
      }
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (!error) navigate('/products');
      else {
        console.error(error);
        alert(error.message || 'Error creating product');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/products" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* Determine if selected category is a frame category */}
        {(() => {
          const selectedCat = categories.find(c => c.id === formData.category_id);
          const isFrame = selectedCat?.name?.toLowerCase().includes('frame') || false;
          
          return (
            <>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Code</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} style={{ width: '100%' }} required>
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {!isFrame && (
            <div className="form-group">
              <label className="form-label">Series</label>
              <select name="parent_series_id" value={formData.parent_series_id} onChange={handleChange} style={{ width: '100%' }} disabled={!formData.category_id} required={!isFrame}>
                <option value="">Select a series</option>
                {seriesList.filter(s => s.category_id === formData.category_id && !s.parent_id).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {!isFrame && seriesList.some(s => s.parent_id === formData.parent_series_id) && (
            <div className="form-group">
              <label className="form-label">Sub-Series</label>
              <select name="series_id" value={formData.series_id} onChange={handleChange} style={{ width: '100%' }} required={!isFrame}>
                <option value="">Select a sub-series</option>
                {seriesList.filter(s => s.parent_id === formData.parent_series_id).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-grid">
          {!isFrame ? (
            <>
              {(() => {
                const activeSeriesId = formData.series_id || formData.parent_series_id;
                const activeSeriesRaw = seriesList.find(s => s.id === activeSeriesId);
                const parentSeries = formData.parent_series_id ? seriesList.find(s => s.id === formData.parent_series_id) : null;
                
                const activeSeries = {
                  ...activeSeriesRaw,
                  allowed_heights: activeSeriesRaw?.allowed_heights || parentSeries?.allowed_heights,
                  allowed_widths: activeSeriesRaw?.allowed_widths || parentSeries?.allowed_widths,
                  allowed_thicknesses: activeSeriesRaw?.allowed_thicknesses || parentSeries?.allowed_thicknesses,
                  allowed_shades: activeSeriesRaw?.allowed_shades || parentSeries?.allowed_shades,
                };

                return (
                  <>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Heights (Inches)</label>
                      {activeSeries?.allowed_heights ? (
                        <ChipSelector available={activeSeries.allowed_heights} selected={formData.height} onChange={(v) => setFormData(prev => ({...prev, height: v}))} />
                      ) : (
                        <TagInput value={formData.height} onChange={(v) => setFormData(prev => ({...prev, height: v}))} placeholder="e.g. 78, 81" />
                      )}
                    </div>
                    
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Widths (Inches)</label>
                      {activeSeries?.allowed_widths ? (
                        <ChipSelector available={activeSeries.allowed_widths} selected={formData.width} onChange={(v) => setFormData(prev => ({...prev, width: v}))} />
                      ) : (
                        <TagInput value={formData.width} onChange={(v) => setFormData(prev => ({...prev, width: v}))} placeholder="e.g. 32, 33, 36" />
                      )}
                    </div>
                    
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Thicknesses (mm)</label>
                      {activeSeries?.allowed_thicknesses ? (
                        <ChipSelector available={activeSeries.allowed_thicknesses} selected={formData.thickness} onChange={(v) => setFormData(prev => ({...prev, thickness: v}))} />
                      ) : (
                        <TagInput value={formData.thickness} onChange={(v) => setFormData(prev => ({...prev, thickness: v}))} placeholder="e.g. 30, 32" />
                      )}
                    </div>
                    
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Finishes</label>
                      {pricingFinishes ? (
                        <ChipSelector available={pricingFinishes} selected={formData.finish} onChange={(v) => setFormData(prev => ({...prev, finish: v}))} />
                      ) : (
                        <TagInput value={formData.finish} onChange={(v) => setFormData(prev => ({...prev, finish: v}))} placeholder="e.g. Matte, Gloss" />
                      )}
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Shades</label>
                      {(() => {
                        const availableShades = Array.from(new Set([
                          ...(pricingShades ? pricingShades.split(',').map((s: string) => s.trim()) : []),
                          ...(activeSeries?.allowed_shades ? activeSeries.allowed_shades.split(',').map((s: string) => s.trim()) : [])
                        ])).filter(Boolean).join(', ');
                        
                        return availableShades ? (
                          <ChipSelector available={availableShades} selected={formData.shade} onChange={(v) => setFormData(prev => ({...prev, shade: v}))} />
                        ) : (
                          <TagInput value={formData.shade} onChange={(v) => setFormData(prev => ({...prev, shade: v}))} placeholder="e.g. Walnut, Oak" />
                        );
                      })()}
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Dimensions (comma separated)</label>
                <TagInput 
                  value={formData.dimensions} 
                  onChange={(val) => setFormData(prev => ({ ...prev, dimensions: val }))} 
                  placeholder="e.g. FRAME SECTION 75X50 (press enter)" 
                />
              </div>
                
              <div className="form-group">
                <label className="form-label">Rates (comma separated)</label>
                <TagInput 
                  value={formData.rate} 
                  onChange={(val) => setFormData(prev => ({ ...prev, rate: val }))} 
                  placeholder="e.g. 165 / RFT, 320 / RFT (press enter)" 
                />
              </div>
            </>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Image URL or Upload</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              name="image_url" 
              value={formData.image_url} 
              onChange={handleChange} 
              style={{ flex: 1 }}
              placeholder="https://... or upload a file"
            />
            <span style={{ color: 'var(--text-muted)' }}>OR</span>
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                disabled={uploading}
              >
                <ImageIcon size={18} style={{ marginRight: 8 }} />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
          {formData.image_url && (
            <div style={{ marginTop: '1rem', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
              <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: '48px', height: '24px', backgroundColor: formData.is_active ? 'var(--primary)' : 'var(--bg-secondary)', borderRadius: '12px', transition: 'background-color 0.2s', border: '1px solid var(--border-color)' }}>
              <div style={{ position: 'absolute', top: '2px', left: formData.is_active ? '26px' : '2px', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '1rem', fontWeight: 500 }}>Product Active</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: '48px', height: '24px', backgroundColor: formData.brass_dome_enabled ? 'var(--primary)' : 'var(--bg-secondary)', borderRadius: '12px', transition: 'background-color 0.2s', border: '1px solid var(--border-color)' }}>
              <div style={{ position: 'absolute', top: '2px', left: formData.brass_dome_enabled ? '26px' : '2px', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <input
              type="checkbox"
              name="brass_dome_enabled"
              checked={formData.brass_dome_enabled}
              onChange={(e) => setFormData({ ...formData, brass_dome_enabled: e.target.checked })}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>Brass Dome</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formData.brass_dome_enabled ? 'Available' : 'Hidden'}</span>
            </div>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: '48px', height: '24px', backgroundColor: formData.hrztl_pcs_enabled ? 'var(--primary)' : 'var(--bg-secondary)', borderRadius: '12px', transition: 'background-color 0.2s', border: '1px solid var(--border-color)' }}>
              <div style={{ position: 'absolute', top: '2px', left: formData.hrztl_pcs_enabled ? '26px' : '2px', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <input
              type="checkbox"
              name="hrztl_pcs_enabled"
              checked={formData.hrztl_pcs_enabled}
              onChange={(e) => setFormData({ ...formData, hrztl_pcs_enabled: e.target.checked })}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>Hrztl Pcs & Brass Domes</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formData.hrztl_pcs_enabled ? 'Available' : 'Hidden'}</span>
            </div>
          </label>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/products" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
            </>
          );
        })()}
      </form>
    </div>
  );
};

export default ProductForm;
