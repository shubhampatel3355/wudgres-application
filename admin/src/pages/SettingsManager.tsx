import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Moon, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SettingsManager = () => {
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  
  // Settings Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    newPassword: '',
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    smsAlerts: false,
    darkMode: true,
    twoFactor: false
  });



  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSessionUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setFormData({
            name: profile.name || '',
            email: profile.email || session.user.email || '',
            phone: profile.phone || '',
            newPassword: ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) {
      alert("You must be logged in to update your profile.");
      return;
    }

    try {
      setLoading(true);
      // Use the RPC we created earlier to update everything securely
      const { error } = await supabase.rpc('admin_update_user', {
        target_user_id: sessionUser.id,
        new_name: formData.name,
        new_email: formData.email,
        new_phone: formData.phone,
        new_password: formData.newPassword
      });

      if (error) throw error;

      alert('Profile updated successfully!');
      setFormData(prev => ({ ...prev, newPassword: '' }));
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <h1 className="page-title" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <SettingsIcon size={24} className="text-primary" /> System Settings
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Left Column - Admin Profile */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <User size={20} className="text-primary" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Admin Profile</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                placeholder="Enter your phone"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>New Password</label>
              <input 
                type="password" 
                value={formData.newPassword}
                onChange={e => setFormData({...formData, newPassword: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                placeholder="Leave blank to keep current"
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--primary-color)', color: 'var(--bg-color)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column - Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Notifications */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <Bell size={20} className="text-primary" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Notifications</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'white' }}>Email Alerts</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Receive email when a new inquiry is submitted</div>
                </div>
                <button 
                  onClick={() => togglePreference('emailAlerts')}
                  style={{ width: '48px', height: '24px', borderRadius: '12px', background: preferences.emailAlerts ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: preferences.emailAlerts ? '26px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: preferences.emailAlerts ? 'var(--bg-color)' : '#999', transition: 'all 0.3s' }} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'white' }}>SMS Alerts</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Receive text messages for urgent dealer updates</div>
                </div>
                <button 
                  onClick={() => togglePreference('smsAlerts')}
                  style={{ width: '48px', height: '24px', borderRadius: '12px', background: preferences.smsAlerts ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: preferences.smsAlerts ? '26px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: preferences.smsAlerts ? 'var(--bg-color)' : '#999', transition: 'all 0.3s' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Security & Appearance */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <Shield size={20} className="text-primary" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Security & Appearance</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Moon size={16} /> Dark Mode
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Admin dashboard theme</div>
                </div>
                <button 
                  onClick={() => togglePreference('darkMode')}
                  style={{ width: '48px', height: '24px', borderRadius: '12px', background: preferences.darkMode ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: preferences.darkMode ? '26px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: preferences.darkMode ? 'var(--bg-color)' : '#999', transition: 'all 0.3s' }} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'white' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Require 2FA for admin login</div>
                </div>
                <button 
                  onClick={() => togglePreference('twoFactor')}
                  style={{ width: '48px', height: '24px', borderRadius: '12px', background: preferences.twoFactor ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: preferences.twoFactor ? '26px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: preferences.twoFactor ? 'var(--bg-color)' : '#999', transition: 'all 0.3s' }} />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
