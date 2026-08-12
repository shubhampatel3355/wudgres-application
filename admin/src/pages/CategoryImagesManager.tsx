import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ImageIcon, Upload, Loader2, Save, ArrowLeft, Edit2, Check, X, Trash2 } from 'lucide-react';

interface CategoryContent {
  id: string;
  name: string;
  image_url: string | null;
  hero_image_url: string | null;
  hero_title: string | null;
  description: string | null;
  features: any[];
  specifications: any[];
  pricing_source: string;
  pricing_data: any[];
  extra_images: { label: string; url: string }[];
}

// ─── Single Image Card (reusable) ─────────────────────────────────────────────
function ImageCard({
  label,
  url,
  uploading,
  onFile,
  onDrop,
  onRemove,
}: {
  label: string;
  url: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
  onDrop?: (file: File) => void;
  onRemove?: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <p style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{label}</p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setDragging(false); }}
        onDrop={e => {
          e.preventDefault(); setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) { onDrop ? onDrop(file) : onFile(file); }
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          flex: 1,
          minHeight: '200px',
          borderRadius: '10px',
          border: dragging ? '2px dashed var(--primary-color)' : '2px dashed rgba(255,255,255,0.1)',
          backgroundColor: dragging ? 'rgba(212,175,55,0.07)' : 'var(--bg-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '0.75rem',
          position: 'relative',
        }}
      >
        {url ? (
          <>
            <img src={url} alt={label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            <div style={{
              position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              className="img-overlay"
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
            >
              <Edit2 size={24} color="white" />
              <span style={{ color: 'white', fontSize: '0.75rem', marginTop: '0.4rem' }}>Click or drop to replace</span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <ImageIcon size={40} opacity={0.4} />
            <span style={{ fontSize: '0.8rem' }}>Drag & Drop or Click</span>
          </div>
        )}
      </div>

      {/* Upload button & Remove button */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <label
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer',
            backgroundColor: 'rgba(212,175,55,0.12)', color: 'var(--primary-color)',
            border: '1px solid rgba(212,175,55,0.3)', fontSize: '0.8rem', fontWeight: 600,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.12)')}
        >
          {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
        {url && onRemove && (
          <button
            onClick={onRemove}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.6rem', borderRadius: '8px', cursor: 'pointer',
              backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545',
              border: '1px solid rgba(220, 53, 69, 0.3)', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)')}
            title="Remove Image"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Extra Image Card (editable label + uploadable image) ─────────────────────
function ExtraImageCard({
  img,
  index,
  uploading,
  onUpload,
  onLabelChange,
  onRemove,
}: {
  img: { label: string; url: string };
  index: number;
  uploading: boolean;
  onUpload: (index: number, file: File) => void;
  onLabelChange: (index: number, label: string) => void;
  onRemove: (index: number) => void;
}) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(img.label);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Image Preview */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setDragging(false); }}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) onUpload(index, f); }}
        onClick={() => inputRef.current?.click()}
        style={{
          height: '160px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
          backgroundColor: 'var(--bg-color)', position: 'relative',
          border: dragging ? '2px dashed var(--primary-color)' : '2px dashed rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {img.url ? (
          <>
            <img src={img.url} alt={img.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            <div
              style={{
                position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
              className="img-overlay"
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
            >
              {uploading ? <Loader2 size={22} color="white" style={{ animation: 'spin 1s linear infinite' }} /> : <Edit2 size={22} color="white" />}
              <span style={{ color: 'white', fontSize: '0.72rem', marginTop: '0.4rem' }}>Click or drop to replace</span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
            {uploading ? <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /> : <ImageIcon size={32} opacity={0.4} />}
            <span style={{ fontSize: '0.72rem' }}>Drop image here</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && onUpload(index, e.target.files[0])} />
      </div>

      {/* Editable Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {editingLabel ? (
          <>
            <input
              value={tempLabel}
              onChange={e => setTempLabel(e.target.value)}
              autoFocus
              style={{
                flex: 1, background: 'var(--bg-color)', border: '1px solid var(--primary-color)',
                borderRadius: '6px', padding: '0.3rem 0.5rem', color: 'var(--text-primary)', fontSize: '0.8rem',
              }}
            />
            <button onClick={() => { onLabelChange(index, tempLabel); setEditingLabel(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}>
              <Check size={16} />
            </button>
            <button onClick={() => { setTempLabel(img.label); setEditingLabel(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <p style={{ flex: 1, margin: 0, fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{img.label}</p>
            <button onClick={() => setEditingLabel(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
              <Edit2 size={13} />
            </button>
          </>
        )}
      </div>

      {/* Storage link */}
      <a href={img.url} target="_blank" rel="noreferrer"
        style={{ fontSize: '0.68rem', color: 'var(--primary-color)', wordBreak: 'break-all', textDecoration: 'none', opacity: 0.8 }}>
        {img.url.split('/').pop()}
      </a>

      {/* Upload button & Remove */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <label style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          padding: '0.5rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600,
          backgroundColor: 'rgba(212,175,55,0.10)', color: 'var(--primary-color)',
          border: '1px solid rgba(212,175,55,0.25)', transition: 'background 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.1)')}
        >
          <Upload size={13} /> Replace Image
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && onUpload(index, e.target.files[0])} />
        </label>
        <button
          onClick={() => onRemove(index)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0.5rem', borderRadius: '7px', cursor: 'pointer',
            backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545',
            border: '1px solid rgba(220, 53, 69, 0.3)', transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.2)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)')}
          title="Remove Image"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CategoryImagesManager() {
  const [categories, setCategories] = useState<CategoryContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryContent | null>(null);
  const [formData, setFormData] = useState<CategoryContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<'image_url' | 'hero_image_url' | null>(null);
  const [uploadingExtraIndex, setUploadingExtraIndex] = useState<number | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('app_category_images').select('*').order('id');
      if (error) throw error;
      const parsed = (data || []).map(cat => ({
        ...cat,
        features: cat.features || [],
        specifications: cat.specifications || [],
        pricing_data: cat.pricing_data || [],
        extra_images: cat.extra_images || [],
      }));
      setCategories(parsed);
    } catch (err: any) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (cat: CategoryContent) => {
    setSelectedCategory(cat);
    setFormData(JSON.parse(JSON.stringify(cat)));
    window.scrollTo(0, 0);
  };

  const handleBack = () => { setSelectedCategory(null); setFormData(null); };

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('app_category_images').update({
        extra_images: formData.extra_images,
        updated_at: new Date().toISOString(),
      }).eq('id', formData.id);
      if (error) throw error;
      setCategories(categories.map(c => c.id === formData.id ? formData : c));
      alert('Saved successfully!');
    } catch (err: any) {
      alert('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // Upload core category image (thumbnail / hero banner)
  const uploadCoreImage = async (field: 'image_url' | 'hero_image_url', file: File) => {
    if (!formData) return;
    setUploadingImage(field);
    try {
      const ext = file.name.split('.').pop();
      const path = `category-images/thumbnails/${formData.id}_${field}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('category-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from('app_category_images').update({ [field]: url, updated_at: new Date().toISOString() }).eq('id', formData.id);
      const updated = { ...formData, [field]: url };
      setFormData(updated);
      setCategories(categories.map(c => c.id === formData.id ? { ...c, [field]: url } : c));
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(null);
    }
  };

  const removeCoreImage = async (field: 'image_url' | 'hero_image_url') => {
    if (!formData || !window.confirm('Are you sure you want to remove this image?')) return;
    try {
      const updated = { ...formData, [field]: null };
      setFormData(updated);
      await supabase.from('app_category_images').update({ [field]: null, updated_at: new Date().toISOString() }).eq('id', formData.id);
      setCategories(categories.map(c => c.id === formData.id ? updated : c));
    } catch (err: any) {
      alert('Remove failed.');
    }
  };

  // Upload an extra_images entry by index
  const uploadExtraImage = async (index: number, file: File) => {
    if (!formData) return;
    setUploadingExtraIndex(index);
    try {
      const ext = file.name.split('.').pop();
      const label = formData.extra_images[index].label.replace(/\s+/g, '-').toLowerCase();
      const path = `nfc/${label}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('category-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(path);
      const url = urlData.publicUrl;
      const newExtras = [...formData.extra_images];
      newExtras[index] = { ...newExtras[index], url };
      const updated = { ...formData, extra_images: newExtras };
      setFormData(updated);
      // Persist to DB
      await supabase.from('app_category_images').update({ extra_images: newExtras, updated_at: new Date().toISOString() }).eq('id', formData.id);
      setCategories(categories.map(c => c.id === formData.id ? { ...c, extra_images: newExtras } : c));
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingExtraIndex(null);
    }
  };

  const updateExtraLabel = async (index: number, label: string) => {
    if (!formData) return;
    const newExtras = [...formData.extra_images];
    newExtras[index] = { ...newExtras[index], label };
    const updated = { ...formData, extra_images: newExtras };
    setFormData(updated);
    await supabase.from('app_category_images').update({ extra_images: newExtras, updated_at: new Date().toISOString() }).eq('id', formData.id);
    setCategories(categories.map(c => c.id === formData.id ? { ...c, extra_images: newExtras } : c));
  };

  const removeExtraImage = async (index: number) => {
    if (!formData || !window.confirm('Are you sure you want to remove this image?')) return;
    try {
      const newExtras = formData.extra_images.filter((_, i) => i !== index);
      const updated = { ...formData, extra_images: newExtras };
      setFormData(updated);
      await supabase.from('app_category_images').update({ extra_images: newExtras, updated_at: new Date().toISOString() }).eq('id', formData.id);
      setCategories(categories.map(c => c.id === formData.id ? updated : c));
    } catch (err: any) {
      alert('Remove failed.');
    }
  };

  // ─── Loading / Edit View ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={24} />
        <span>Loading Categories...</span>
      </div>
    );
  }

  if (selectedCategory && formData) {
    return (
      <div style={{ width: '100%', padding: '2rem', boxSizing: 'border-box' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button onClick={handleBack} className="btn btn-secondary" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={18} /> Back
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>Editing — {formData.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage all images for this category.</p>
          </div>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {saving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* ── Section: Core Images ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Core Category Images
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <ImageCard
                label="Home Screen Grid Image (Thumbnail)"
                url={formData.image_url}
                uploading={uploadingImage === 'image_url'}
                onFile={file => uploadCoreImage('image_url', file)}
                onRemove={() => removeCoreImage('image_url')}
              />
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <ImageCard
                label="Detail Page Hero Image (Banner)"
                url={formData.hero_image_url}
                uploading={uploadingImage === 'hero_image_url'}
                onFile={file => uploadCoreImage('hero_image_url', file)}
                onRemove={() => removeCoreImage('hero_image_url')}
              />
            </div>
          </div>
        </div>

        {/* ── Section: Module / Extra Images ── */}
        {formData.extra_images && formData.extra_images.length > 0 && (
          <div>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Module Images ({formData.extra_images.length} images — click any to replace)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {formData.extra_images.map((img, i) => (
                <ExtraImageCard
                  key={i}
                  img={img}
                  index={i}
                  uploading={uploadingExtraIndex === i}
                  onUpload={uploadExtraImage}
                  onLabelChange={updateExtraLabel}
                  onRemove={removeExtraImage}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Category Grid List ────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', padding: '2rem', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Category Content CMS</h2>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Select a category to customize its dedicated landing page on the mobile app.</p>
      </div>

      {error && <div className="error-message"><span>{error}</span></div>}

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {categories.map(category => (
          <div key={category.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', margin: '0 0 1rem' }}>{category.name}</h3>

            {/* Preview image */}
            <div style={{
              width: '100%', height: '160px', backgroundColor: 'var(--bg-color)',
              borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {category.image_url || category.hero_image_url ? (
                <img
                  src={category.image_url || category.hero_image_url || ''}
                  alt={category.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ImageIcon size={48} style={{ opacity: 0.3 }} />
              )}
            </div>

            {/* Extra images count badge */}
            {category.extra_images?.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                + {category.extra_images.length} module image{category.extra_images.length > 1 ? 's' : ''}
              </p>
            )}

            <button
              onClick={() => handleSelectCategory(category)}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 'auto' }}
            >
              Edit Category Content
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>No categories found. Please run the SQL database script first.</p>
        </div>
      )}
    </div>
  );
}
