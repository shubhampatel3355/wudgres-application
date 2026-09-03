import React, { useEffect, useState } from 'react';
import { Save, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BrassManager = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Settings Form State
  const [formData, setFormData] = useState({
    brass_dome_price: '0',
    hrztl_pcs_brass_domes_price: '0',
  });

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('brass_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          brass_dome_price: data.brass_dome_price?.toString() || '0',
          hrztl_pcs_brass_domes_price: data.hrztl_pcs_brass_domes_price?.toString() || '0',
        });
      }
    } catch (error) {
      console.error('Error fetching brass settings:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const domePrice = parseFloat(formData.brass_dome_price);
    const hrztlPrice = parseFloat(formData.hrztl_pcs_brass_domes_price);

    if (isNaN(domePrice) || domePrice < 0) {
      alert("Brass Dome Price must be a valid positive number.");
      return;
    }
    if (isNaN(hrztlPrice) || hrztlPrice < 0) {
      alert("Horizontal Pieces & Brass Domes Price must be a valid positive number.");
      return;
    }

    try {
      setLoading(true);
      
      const { data: existingSettings } = await supabase.from('brass_settings').select('id').limit(1).maybeSingle();

      if (existingSettings) {
        const { error } = await supabase
          .from('brass_settings')
          .update({
            brass_dome_price: domePrice,
            hrztl_pcs_brass_domes_price: hrztlPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('brass_settings')
          .insert({
            brass_dome_price: domePrice,
            hrztl_pcs_brass_domes_price: hrztlPrice,
          });

        if (error) throw error;
      }

      alert('Brass Management settings updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem', paddingTop: '1.5rem' ,paddingRight: '2rem' ,paddingLeft: '2rem'}}>
      <h1 className="page-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield size={24} className="text-primary" /> Brass Pricing
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Configure the global prices for Brass options. To enable or disable these options for a specific product, edit that product and use the Brass toggles.
      </p>

      <div style={{ width: '100%' }}>
        <form onSubmit={handleUpdateSettings} className="glass-panel" style={{ padding: '3rem' }}>
          
          <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Pricing Configuration</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                Brass Dome Price (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  value={formData.brass_dome_price}
                  onChange={(e) => setFormData({ ...formData, brass_dome_price: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                Horizontal Pieces & Brass Domes Price (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  value={formData.hrztl_pcs_brass_domes_price}
                  onChange={(e) => setFormData({ ...formData, hrztl_pcs_brass_domes_price: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrassManager;
