import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const goldIcon = L.divIcon({
  className: 'custom-gold-pin',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4AF37" width="28px" height="28px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface Dealer {
  id: string;
  store_name: string;
  owner_name: string;
  contact: string;
  address: string;
  pincode: string;
  google_maps_url: string;
  lat: number;
  lon: number;
  is_active: boolean;
}

const DealerManager = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDealer, setCurrentDealer] = useState<Partial<Dealer>>({ is_active: true });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .order('store_name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        setError(`DB Error: ${error.message} (code: ${error.code})`);
      } else {
        console.log('Dealers fetched:', data?.length, data);
        setDealers(data || []);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!currentDealer.store_name || !currentDealer.address) {
      setError('Store Name and Address are required');
      return;
    }

    try {
      if (currentDealer.id) {
        // Update
        const { error } = await supabase
          .from('dealers')
          .update(currentDealer)
          .eq('id', currentDealer.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('dealers')
          .insert([currentDealer]);
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentDealer({ is_active: true });
      fetchDealers();
    } catch (err: any) {
      setError(err.message || 'Error saving dealer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this dealer?')) return;
    try {
      const { error } = await supabase.from('dealers').delete().eq('id', id);
      if (error) throw error;
      fetchDealers();
    } catch (err: any) {
      alert(err.message || 'Error deleting dealer');
    }
  };

  const filteredDealers = dealers.filter(d => 
    d.store_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.pincode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.owner_name && d.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in split-layout" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
      {/* List Section */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} className="text-primary" /> Dealer Locator
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search dealers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem 1rem 0.5rem 2.2rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  width: '240px',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setCurrentDealer({ is_active: true });
                setIsEditing(true);
              }}
              style={{ padding: '0.5rem 1rem' }}
            >
              <Plus size={16} /> Add Dealer
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {error && !isEditing && (
            <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <strong>Error loading data:</strong><br/>{error}
            </div>
          )}
          
          {loading ? (
            <p>Loading dealers...</p>
          ) : filteredDealers.length === 0 && !error ? (
            <p style={{ color: 'var(--text-muted)' }}>No dealers found.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredDealers.map((dealer, index) => (
                <div key={dealer.id} style={{ 
                  background: 'rgba(28, 26, 23, 0.5)', 
                  border: '1px solid rgba(212, 175, 55, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{index + 1}. {dealer.store_name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{dealer.address}, {dealer.pincode}</p>
                    {dealer.owner_name && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Owner: {dealer.owner_name} | {dealer.contact}</p>}
                    {!dealer.is_active && <span style={{ fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>Inactive</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn"
                      onClick={() => {
                        setCurrentDealer(dealer);
                        setIsEditing(true);
                      }}
                      style={{ padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary-color)' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="btn"
                      onClick={() => handleDelete(dealer.id)}
                      style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Section */}
      {!isEditing && (
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 0 }}>
          <MapContainer 
            center={[20.5937, 78.9629]} // Center of India
            zoom={5} 
            style={{ height: '100%', width: '100%', background: 'var(--bg-secondary)' }}
          >
            {/* Dark mode friendly map tiles */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {dealers.map(dealer => dealer.lat && dealer.lon ? (
              <Marker key={dealer.id} position={[dealer.lat, dealer.lon]} icon={goldIcon}>
                <Popup>
                  <div style={{ color: '#000', padding: '4px' }}>
                    <strong>{dealer.store_name}</strong><br />
                    {dealer.address}<br />
                    {dealer.contact && <span>📞 {dealer.contact}</span>}
                  </div>
                </Popup>
              </Marker>
            ) : null)}
          </MapContainer>
        </div>
      )}

      {/* Edit Form Section */}
      {isEditing && (
        <div className="glass-panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{currentDealer.id ? 'Edit Dealer' : 'Add New Dealer'}</h2>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>{error}</div>}
            
            <form id="dealer-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Store Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentDealer.store_name || ''} 
                  onChange={e => setCurrentDealer({...currentDealer, store_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentDealer.owner_name || ''} 
                  onChange={e => setCurrentDealer({...currentDealer, owner_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentDealer.contact || ''} 
                  onChange={e => setCurrentDealer({...currentDealer, contact: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea 
                  className="form-control" 
                  rows={2}
                  value={currentDealer.address || ''} 
                  onChange={e => setCurrentDealer({...currentDealer, address: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentDealer.pincode || ''} 
                  onChange={e => setCurrentDealer({...currentDealer, pincode: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-control" 
                    value={currentDealer.lat || ''} 
                    onChange={e => setCurrentDealer({...currentDealer, lat: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-control" 
                    value={currentDealer.lon || ''} 
                    onChange={e => setCurrentDealer({...currentDealer, lon: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Google Maps URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  value={currentDealer.google_maps_url || ''} 
                  onChange={e => setCurrentDealer({...currentDealer, google_maps_url: e.target.value})}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={currentDealer.is_active || false}
                  onChange={e => setCurrentDealer({...currentDealer, is_active: e.target.checked})}
                />
                <label htmlFor="isActive" style={{ margin: 0 }}>Active Location</label>
              </div>
            </form>
          </div>

          <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(212, 175, 55, 0.1)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              form="dealer-form"
              type="submit"
            >
              Save Dealer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerManager;
