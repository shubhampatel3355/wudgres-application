import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Upload, Video, Image as ImageIcon, Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';

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
             // Fallback
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

      const { error: uploadError, data } = await supabase.storage
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
    
    setContent({
      ...content,
      carousel_images: [...content.carousel_images, ...newUrls]
    });
    setUploading(false);
  };

  const removeCarouselImage = (index: number) => {
    if (!content) return;
    const newImages = [...content.carousel_images];
    newImages.splice(index, 1);
    setContent({ ...content, carousel_images: newImages });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (!content) return;
    const newImages = [...content.carousel_images];
    if (direction === 'up' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'down' && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    }
    setContent({ ...content, carousel_images: newImages });
  };

  if (loading) {
    return <div className="page-header"><h2>Loading...</h2></div>;
  }

  return (
    <div className="home-content-manager">
      <div className="page-header">
        <div>
          <h2>Home Screen Content</h2>
          <p>Manage the main hero section of the mobile app</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleSave} 
          disabled={saving || uploading}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="alert error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert success">
          <Save size={20} />
          <span>{success}</span>
        </div>
      )}

      {content && (
        <div className="content-container" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          {/* Settings Panel */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Media Type</h3>
            
            <div className="type-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div 
                className={`type-option ${content.media_type === 'video' ? 'active' : ''}`}
                onClick={() => setContent({ ...content, media_type: 'video' })}
                style={{ 
                  flex: 1, padding: '1.5rem', borderRadius: '8px', border: `2px solid ${content.media_type === 'video' ? 'var(--primary-color)' : '#eee'}`, 
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  backgroundColor: content.media_type === 'video' ? 'var(--primary-light)' : 'white'
                }}
              >
                <Video size={32} color={content.media_type === 'video' ? 'var(--primary-color)' : '#666'} />
                <span style={{ fontWeight: 'bold' }}>Auto-playing Video</span>
              </div>
              
              <div 
                className={`type-option ${content.media_type === 'carousel' ? 'active' : ''}`}
                onClick={() => setContent({ ...content, media_type: 'carousel' })}
                style={{ 
                  flex: 1, padding: '1.5rem', borderRadius: '8px', border: `2px solid ${content.media_type === 'carousel' ? 'var(--primary-color)' : '#eee'}`, 
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  backgroundColor: content.media_type === 'carousel' ? 'var(--primary-light)' : 'white'
                }}
              >
                <ImageIcon size={32} color={content.media_type === 'carousel' ? 'var(--primary-color)' : '#666'} />
                <span style={{ fontWeight: 'bold' }}>Image Carousel</span>
              </div>
            </div>

            {/* Video Settings */}
            {content.media_type === 'video' && (
              <div className="settings-section">
                <div className="form-group">
                  <label>Video File (MP4)</label>
                  <div className="upload-box" style={{ padding: '1.5rem', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
                    <input type="file" accept="video/mp4,video/quicktime" onChange={handleVideoUpload} style={{ display: 'none' }} id="video-upload" />
                    <label htmlFor="video-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload size={24} color="#666" />
                      <span>{uploading ? 'Uploading...' : 'Click to upload a new video'}</span>
                    </label>
                  </div>
                  {content.video_url && (
                    <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                      <strong>Current:</strong> {content.video_url}
                    </div>
                  )}
                  {!content.video_url && (
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Using default built-in video</div>
                  )}
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label>Poster Image (Shows while video loads)</label>
                  <div className="upload-box" style={{ padding: '1.5rem', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
                    <input type="file" accept="image/*" onChange={handlePosterUpload} style={{ display: 'none' }} id="poster-upload" />
                    <label htmlFor="poster-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={24} color="#666" />
                      <span>{uploading ? 'Uploading...' : 'Click to upload a poster image'}</span>
                    </label>
                  </div>
                  {content.poster_url && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img src={content.poster_url} alt="Poster" style={{ height: '100px', borderRadius: '4px', objectFit: 'cover' }} />
                    </div>
                  )}
                  {!content.poster_url && (
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Using default built-in poster</div>
                  )}
                </div>
              </div>
            )}

            {/* Carousel Settings */}
            {content.media_type === 'carousel' && (
              <div className="settings-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ margin: 0 }}>Carousel Images</label>
                  <input type="file" accept="image/*" multiple onChange={handleCarouselImageUpload} style={{ display: 'none' }} id="carousel-upload" />
                  <label htmlFor="carousel-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Add Images
                  </label>
                </div>
                
                {content.carousel_images.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#888' }}>
                    No images added yet. Add at least one image to display the carousel.
                  </div>
                ) : (
                  <div className="image-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {content.carousel_images.map((url, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                          <button onClick={() => moveImage(idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                          <button onClick={() => moveImage(idx, 'down')} disabled={idx === content.carousel_images.length - 1} style={{ background: 'none', border: 'none', cursor: idx === content.carousel_images.length - 1 ? 'default' : 'pointer', opacity: idx === content.carousel_images.length - 1 ? 0.3 : 1 }}>▼</button>
                        </div>
                        <img src={url} alt={`Slide ${idx + 1}`} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ flex: 1, fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</span>
                        <button onClick={() => removeCarouselImage(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="card" style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>App Preview</h3>
            <div style={{ width: '100%', height: '400px', backgroundColor: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '4px solid #333' }}>
              {content.media_type === 'video' ? (
                content.video_url ? (
                  <video src={content.video_url} poster={content.poster_url || ''} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: '1rem' }}>
                    <Video size={48} color="#666" />
                    <span>Default App Video</span>
                  </div>
                )
              ) : (
                content.carousel_images.length > 0 ? (
                  <img src={content.carousel_images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: '1rem' }}>
                    <ImageIcon size={48} color="#666" />
                    <span>Empty Carousel</span>
                  </div>
                )
              )}
            </div>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', marginTop: '1rem' }}>
              Changes will appear in the app once saved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
