import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Upload, Video, Image as ImageIcon, Plus, Trash2, AlertCircle, MonitorPlay } from 'lucide-react';

interface HeroContent {
  id: string;
  media_type: 'video' | 'carousel';
  video_url: string | null;
  poster_url: string | null;
  carousel_images: string[];
}

export default function HomeContentManager() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('app_hero_content')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found, might need to insert one
          const defaultData: HeroContent = {
            id: '00000000-0000-0000-0000-000000000001',
            media_type: 'video',
            video_url: null,
            poster_url: null,
            carousel_images: []
          };
          const { data: newData, error: insertError } = await supabase
            .from('app_hero_content')
            .insert(defaultData)
            .select()
            .single();
          if (!insertError && newData) {
            setContent(newData);
          } else {
            setContent(defaultData);
          }
        } else {
          throw error;
        }
      } else if (data) {
        setContent(data as HeroContent);
      }
    } catch (err: any) {
      console.error('Error fetching content:', err);
      setError('Failed to load home content configuration. Ensure the database script has been run.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('app_hero_content')
        .update({
          media_type: content.media_type,
          video_url: content.video_url,
          poster_url: content.poster_url,
          carousel_images: content.carousel_images,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id);

      if (error) throw error;
      setSuccess('Home content saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving content:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File, type: 'video' | 'image') => {
    try {
      setUploading(true);
      setError('');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('app-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('app-content')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Make sure the app-content bucket exists and is public.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !content) return;
    const url = await uploadFile(e.target.files[0], 'video');
    if (url) {
      setContent({ ...content, video_url: url });
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !content) return;
    const url = await uploadFile(e.target.files[0], 'image');
    if (url) {
      setContent({ ...content, poster_url: url });
    }
  };

  const handleCarouselImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !content) return;
    
    setUploading(true);
    const newUrls: string[] = [];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const url = await uploadFile(e.target.files[i], 'image');
      if (url) newUrls.push(url);
    }
    
    setContent(prev => prev ? {
      ...prev,
      carousel_images: [...prev.carousel_images, ...newUrls]
    } : prev);
    
    // Reset the input value so the same file can be uploaded again if needed
    e.target.value = '';
    setUploading(false);
  };

  const removeCarouselImage = (index: number) => {
    setContent(prev => {
      if (!prev) return prev;
      const newImages = [...prev.carousel_images];
      newImages.splice(index, 1);
      return { ...prev, carousel_images: newImages };
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setContent(prev => {
      if (!prev) return prev;
      const newImages = [...prev.carousel_images];
      if (direction === 'up' && index > 0) {
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      }
      return { ...prev, carousel_images: newImages };
    });
  };

  if (loading) {
    return <div className="animate-fade-in"><h1 className="page-title">Loading...</h1></div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MonitorPlay size={24} className="text-primary" /> App Home Content
        </h1>
        <button 
          onClick={handleSave} 
          disabled={saving || uploading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'var(--accent-gold)', 
            color: 'var(--bg-primary)', 
            borderRadius: '4px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Save size={20} />
          <span>{success}</span>
        </div>
      )}

      {content && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          {/* Settings Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              Media Configuration
            </h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div 
                onClick={() => setContent({ ...content, media_type: 'video' })}
                style={{ 
                  flex: 1, padding: '1.5rem', borderRadius: '8px', 
                  border: `2px solid ${content.media_type === 'video' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}`, 
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  background: content.media_type === 'video' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Video size={32} color={content.media_type === 'video' ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
                <span style={{ fontWeight: 'bold', color: content.media_type === 'video' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>Auto-playing Video</span>
              </div>
              
              <div 
                onClick={() => setContent({ ...content, media_type: 'carousel' })}
                style={{ 
                  flex: 1, padding: '1.5rem', borderRadius: '8px', 
                  border: `2px solid ${content.media_type === 'carousel' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}`, 
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  background: content.media_type === 'carousel' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ImageIcon size={32} color={content.media_type === 'carousel' ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
                <span style={{ fontWeight: 'bold', color: content.media_type === 'carousel' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>Image Carousel</span>
              </div>
            </div>

            {/* Video Settings */}
            {content.media_type === 'video' && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Video File (MP4)</label>
                  <div style={{ padding: '2rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <input type="file" accept="video/mp4,video/quicktime" onChange={handleVideoUpload} style={{ display: 'none' }} id="video-upload" />
                    <label htmlFor="video-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                      <Upload size={28} className="text-primary" />
                      <span>{uploading ? 'Uploading...' : 'Click to upload a new video'}</span>
                    </label>
                  </div>
                  {content.video_url && (
                    <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', wordBreak: 'break-all', fontSize: '0.9rem', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <strong style={{ color: 'var(--accent-gold)' }}>Current:</strong> {content.video_url}
                    </div>
                  )}
                  {!content.video_url && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Using default built-in video</div>
                  )}
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Poster Image (Shows while video loads)</label>
                  <div style={{ padding: '2rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <input type="file" accept="image/*" onChange={handlePosterUpload} style={{ display: 'none' }} id="poster-upload" />
                    <label htmlFor="poster-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                      <ImageIcon size={28} className="text-primary" />
                      <span>{uploading ? 'Uploading...' : 'Click to upload a poster image'}</span>
                    </label>
                  </div>
                  {content.poster_url && (
                    <div style={{ marginTop: '1rem' }}>
                      <img src={content.poster_url} alt="Poster" style={{ height: '120px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                  )}
                  {!content.poster_url && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Using default built-in poster</div>
                  )}
                </div>
              </div>
            )}

            {/* Carousel Settings */}
            {content.media_type === 'carousel' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ margin: 0, color: 'var(--text-secondary)' }}>Carousel Images</label>
                  <input type="file" accept="image/*" multiple onChange={handleCarouselImageUpload} style={{ display: 'none' }} id="carousel-upload" />
                  <label htmlFor="carousel-upload" style={{ cursor: 'pointer', display: 'inline-flex', padding: '0.5rem 1rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s ease' }}>
                    <Plus size={16} /> Add Images
                  </label>
                </div>
                
                {content.carousel_images.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    No images added yet. Add at least one image to display the carousel.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {content.carousel_images.map((url, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', gap: '0.25rem' }}>
                          <button onClick={() => moveImage(idx, 'up')} disabled={idx === 0} style={{ color: 'var(--text-secondary)', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                          <button onClick={() => moveImage(idx, 'down')} disabled={idx === content.carousel_images.length - 1} style={{ color: 'var(--text-secondary)', cursor: idx === content.carousel_images.length - 1 ? 'default' : 'pointer', opacity: idx === content.carousel_images.length - 1 ? 0.3 : 1 }}>▼</button>
                        </div>
                        <img src={url} alt={`Slide ${idx + 1}`} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</span>
                        <button onClick={() => removeCarouselImage(idx)} style={{ color: '#ef4444', padding: '0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', transition: 'background 0.2s ease' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              App Preview
            </h2>
            <div style={{ 
              width: '100%', 
              aspectRatio: '9/16', // Approximate mobile aspect ratio
              maxHeight: '450px',
              backgroundColor: '#000', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              position: 'relative', 
              border: '6px solid #333',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
              {content.media_type === 'video' ? (
                content.video_url ? (
                  <video src={content.video_url} poster={content.poster_url || ''} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem', background: '#111' }}>
                    <Video size={48} opacity={0.5} />
                    <span style={{ fontSize: '0.9rem' }}>Default App Video</span>
                  </div>
                )
              ) : (
                content.carousel_images.length > 0 ? (
                  <img src={content.carousel_images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem', background: '#111' }}>
                    <ImageIcon size={48} opacity={0.5} />
                    <span style={{ fontSize: '0.9rem' }}>Empty Carousel</span>
                  </div>
                )
              )}
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
              Changes will appear in the app once saved.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
