import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Layers } from 'lucide-react';

export const FinishesManager = () => {
  const [finishes, setFinishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchFinishes();
  }, []);

  const fetchFinishes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('finishes').select('*').order('name');
    if (error) {
      console.error('Error fetching finishes:', error);
    } else {
      setFinishes(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null
    };

    if (isEditing && isEditing !== 'new') {
      const { error } = await supabase.from('finishes').update(payload).eq('id', isEditing);
      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('finishes').insert([payload]);
      if (error) {
        alert(error.message);
        return;
      }
    }
    
    setIsEditing(null);
    fetchFinishes();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete finish "${name}"? This might break pricing rules that rely on it.`)) {
      await supabase.from('finishes').delete().eq('id', id);
      fetchFinishes();
    }
  };

  const startEdit = (finish?: any) => {
    if (finish) {
      setIsEditing(finish.id);
      setFormData({
        name: finish.name || '',
        description: finish.description || ''
      });
    } else {
      setIsEditing('new');
      setFormData({ name: '', description: '' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Global Finishes & Shades</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Manage the finishes available across the entire catalog</p>
        </div>
        {!isEditing && (
          <button onClick={() => startEdit()} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
            <Plus size={18} /> Add New Finish
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {isEditing ? (
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{isEditing === 'new' ? 'Create New Finish' : 'Edit Finish'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', maxWidth: '800px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Finish Name *</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g., 1-Side, Matte, Gloss"
                />
              </div>
              <div style={{ flex: 2 }}>
                <label className="form-label">Description (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="e.g., Front face design only, back is plain"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.8rem' }}>
                <button type="submit" className="btn btn-primary"><Save size={16}/> Save</button>
                <button type="button" onClick={() => setIsEditing(null)} className="btn btn-secondary"><X size={16}/> Cancel</button>
              </div>
            </form>
          </div>
        ) : null}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '250px' }}>Finish Name</th>
                <th>Description</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>Loading finishes...</td></tr>
              ) : finishes.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No finishes found. Add one above.</td></tr>
              ) : (
                finishes.map(finish => (
                  <tr key={finish.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={14} style={{ opacity: 0.5 }} />
                        {finish.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{finish.description || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => startEdit(finish)} className="btn btn-icon"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(finish.id, finish.name)} className="btn btn-icon" style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinishesManager;
