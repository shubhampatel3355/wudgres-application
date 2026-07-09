import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Phone, Mail, Clock } from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
  product_id: string;
  products?: { name: string };
}

const LeadManager = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      fetchInquiries();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' };
      case 'Contacted': return { bg: 'rgba(212, 175, 55, 0.2)', text: 'var(--primary-color)' };
      case 'Converted': return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981' };
      case 'Closed': return { bg: 'rgba(107, 114, 128, 0.2)', text: '#9ca3af' };
      default: return { bg: 'rgba(255,255,255,0.1)', text: 'white' };
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={24} className="text-primary" /> Lead & Inquiry Management
        </h1>
      </div>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          <p>Loading inquiries...</p>
        ) : inquiries.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <MessageSquare size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No inquiries or leads yet.</p>
          </div>
        ) : (
          inquiries.map(inq => {
            const statusColors = getStatusColor(inq.status);
            return (
              <div key={inq.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {inq.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {inq.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14}/> {inq.phone}</span>}
                      {inq.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14}/> {inq.email}</span>}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14}/> {new Date(inq.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ background: statusColors.bg, color: statusColors.text, padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      {inq.status}
                    </span>
                    <select 
                      className="form-control" 
                      style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                      value={inq.status}
                      onChange={(e) => updateStatus(inq.id, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                {inq.products && (
                  <div style={{ background: 'rgba(212,175,55,0.05)', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary-color)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Interested in Product:</span>
                    <strong style={{ marginLeft: '0.5rem', color: 'var(--text-primary)' }}>{inq.products.name}</strong>
                  </div>
                )}
                
                {inq.message && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', color: 'var(--text-secondary)' }}>
                    "{inq.message}"
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeadManager;
