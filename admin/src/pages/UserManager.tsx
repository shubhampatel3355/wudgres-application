import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { Users, Mail, Phone, Calendar, Edit2, X, Save } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState("");



  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdmin = async (id: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin privileges for this user?`)) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error updating user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    if (newPassword && newPassword.length < 6) {
      alert("If providing a new password, it must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      // Calls the new custom Postgres function (RPC) to update user comprehensively
      const { error } = await supabase.rpc('admin_update_user', {
        target_user_id: editingUser.id,
        new_name: editingUser.name,
        new_email: editingUser.email || '',
        new_phone: editingUser.phone || '',
        new_password: newPassword
      });
      
      if (error) throw error;
      
      alert(`Successfully updated details for ${editingUser.name || 'user'}`);
      setEditingUser(null);
      setNewPassword("");
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error updating user. Make sure the admin_update_user RPC is created in your database.');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} className="text-primary" /> User Management
        </h1>
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: 'var(--primary-color)', fontWeight: 600 }}>
          Total Users: {users.length}
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {error ? (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <strong>Database Error:</strong><br/>{error}
          </div>
        ) : loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>User</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Contact Info</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Role</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Joined</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', 
                        borderRadius: '50%', 
                        background: 'rgba(212, 175, 55, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary-color)', fontWeight: 'bold'
                      }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name || 'Unknown User'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {user.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Phone size={14} /> {user.phone}
                      </div>
                    )}
                    {user.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        <Mail size={14} /> {user.email}
                      </div>
                    )}
                    {!user.phone && !user.email && (
                      <span style={{ color: 'var(--text-muted)' }}>No contact provided</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {user.is_admin ? (
                      <span style={{ padding: '4px 8px', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--primary-color)', borderRadius: '4px', fontSize: '0.875rem' }}>Admin</span>
                    ) : (
                      <span style={{ padding: '4px 8px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', borderRadius: '4px', fontSize: '0.875rem' }}>Customer</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} /> {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingUser(user);
                          setNewPassword("");
                        }}
                        style={{ padding: '6px 12px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                      >
                        <Edit2 size={14} /> Edit User
                      </button>
                      <button 
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        style={{ padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        {user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="btn" style={{ padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editingUser.name || ''} 
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editingUser.phone || ''} 
                  onChange={e => setEditingUser({...editingUser, phone: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                <input 
                  type="email" 
                  value={editingUser.email || ''} 
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>New Password (Leave blank to keep current)</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                  placeholder="Enter new password (optional)"
                  minLength={6}
                />
              </div>
            
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)} style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-color)', color: 'var(--bg-color)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserManager;
