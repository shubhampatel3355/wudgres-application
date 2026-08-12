import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Send, CheckCircle, Clock } from 'lucide-react';

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  sent_at: string;
  success_count: number;
}

const NotificationCenter = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('sent_at', { ascending: false });

      if (!error && data) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Error fetching notification logs', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    if (!window.confirm('Are you sure you want to send this push notification to all users?')) return;

    try {
      setLoading(true);
      
      // 1. Fetch all push tokens from profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .not('expo_push_token', 'is', null)
        .neq('expo_push_token', '');
      
      if (profileError) throw profileError;

      const tokens = profiles?.map(p => p.expo_push_token).filter(Boolean) || [];
      let successCount = 0;

      // 2. Send via Expo Push API
      if (tokens.length > 0) {
        const messages = tokens.map(token => ({
          to: token,
          sound: 'default',
          title: title,
          body: body,
        }));

        // Send in chunks of 100 as recommended by Expo
        const chunks = [];
        for (let i = 0; i < messages.length; i += 100) {
          chunks.push(messages.slice(i, i + 100));
        }

        for (const chunk of chunks) {
          try {
            const res = await fetch('/expo-api/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(chunk),
            });
            const resData = await res.json();
            // Count successful receipts
            if (resData.data) {
              successCount += resData.data.filter((receipt: any) => receipt.status === 'ok').length;
            }
          } catch (e) {
            console.error('Error sending chunk to Expo:', e);
          }
        }
      }

      // 3. Log to database
      const { error } = await supabase
        .from('push_notifications')
        .insert([{ title, body }]);
      
      if (error) throw error;
      
      setTitle('');
      setBody('');
      alert(`Notification sent! Delivered to ${successCount} devices.`);
      fetchLogs();
    } catch (err: any) {
      alert(err.message || 'Error sending notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in split-layout" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
      {/* Compose Section */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} className="text-primary" /> Send Push Notification
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Broadcast a message to all users who have the Wudgres app installed.
          </p>
        </div>
        
        <form onSubmit={handleSend} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <div className="form-group">
            <label>Notification Title *</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. New Lamorous Series Launched!"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={64}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{title.length}/64 characters</span>
          </div>

          <div className="form-group">
            <label>Message Body *</label>
            <textarea 
              className="form-control" 
              placeholder="Check out our latest premium door collection in the app now."
              rows={5}
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              maxLength={256}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{body.length}/256 characters</span>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !title || !body}
              style={{ padding: '0.75rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Sending...' : <><Send size={18} /> Send Blast</>}
            </button>
          </div>
        </form>
      </div>

      {/* History Section */}
      <div className="glass-panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Broadcast History</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {logs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No notifications sent yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.map(log => (
                <div key={log.id} style={{ 
                  background: 'rgba(28, 26, 23, 0.5)', 
                  border: '1px solid rgba(212, 175, 55, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{log.title}</h4>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      <CheckCircle size={12} /> Sent
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{log.body}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {new Date(log.sent_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
