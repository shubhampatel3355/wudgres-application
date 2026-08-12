import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Save, X, Edit2, TableProperties } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Category configuration — column headers & slugs
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    slug: 'nfc-frames',
    label: 'NFC Frames',
    columns: [
      { key: 'description', label: 'Description' },
      { key: 'col2',        label: 'Average Density' },
      { key: 'col3',        label: 'Rate' },
    ],
  },
  {
    slug: 'window-shutters',
    label: 'Window Shutters',
    columns: [
      { key: 'description', label: 'Description' },
      { key: 'col2',        label: 'Rate' },
    ],
  },
  {
    slug: 'eng-wood-frames',
    label: 'Engineered Wood Frames',
    columns: [
      { key: 'description', label: 'Description' },
      { key: 'col2',        label: 'Length' },
      { key: 'col3',        label: 'Elite' },
      { key: 'col4',        label: 'Rich' },
      { key: 'col5',        label: 'Eco' },
    ],
  },
  {
    slug: 'flush-doors',
    label: 'Flush Doors',
    columns: [
      { key: 'description', label: 'Thickness' },
      { key: 'col2',        label: 'Rate / Sqft' },
    ],
  },
];

const EMPTY_ROW = { description: '', col2: '', col3: '', col4: '', col5: '' };

const FrameDimensionsManager = () => {
  const [activeSlug, setActiveSlug] = useState(CATEGORIES[0].slug);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [newRow, setNewRow] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const activeCategory = CATEGORIES.find(c => c.slug === activeSlug)!;

  useEffect(() => {
    fetchRows();
    setEditingId(null);
    setNewRow(null);
  }, [activeSlug]);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('frame_dimensions')
      .select('*')
      .eq('series_slug', activeSlug)
      .order('sort_order');
    if (error) console.error(error);
    else setRows(data || []);
    setLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setEditForm({ ...row });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('frame_dimensions')
      .update({
        description: editForm.description,
        col2: editForm.col2 || null,
        col3: editForm.col3 || null,
        col4: editForm.col4 || null,
        col5: editForm.col5 || null,
      })
      .eq('id', editingId);
    setSaving(false);
    if (error) { alert('Error saving: ' + error.message); return; }
    setEditingId(null);
    showSuccess('Row updated!');
    await fetchRows();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this row?')) return;
    const { error } = await supabase.from('frame_dimensions').delete().eq('id', id);
    if (error) { alert('Error deleting: ' + error.message); return; }
    showSuccess('Row deleted.');
    await fetchRows();
  };

  const handleAddNew = () => {
    setNewRow({ ...EMPTY_ROW });
    setEditingId(null);
  };

  const handleSaveNew = async () => {
    if (!newRow.description.trim()) { alert('Description is required.'); return; }
    setSaving(true);
    const maxOrder = rows.length > 0 ? Math.max(...rows.map(r => r.sort_order || 0)) : 0;
    const { error } = await supabase.from('frame_dimensions').insert([{
      series_slug: activeSlug,
      description: newRow.description,
      col2: newRow.col2 || null,
      col3: newRow.col3 || null,
      col4: newRow.col4 || null,
      col5: newRow.col5 || null,
      sort_order: maxOrder + 1,
    }]);
    setSaving(false);
    if (error) { alert('Error adding row: ' + error.message); return; }
    setNewRow(null);
    showSuccess('Row added!');
    await fetchRows();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--accent-gold)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const cellStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
    borderRight: '1px solid var(--border-subtle)',
    verticalAlign: 'middle',
  };

  const headerCellStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    background: 'var(--bg-tertiary)',
    borderRight: '1px solid var(--border-subtle)',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <TableProperties size={24} color="var(--accent-gold)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Frame Dimensions
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Manage the dimension table shown in each product's detail screen on the mobile app.
        </p>
      </div>

      {/* Success message */}
      {successMsg && (
        <div style={{ background: 'rgba(100,200,100,0.12)', border: '1px solid rgba(100,200,100,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#6ec96e', fontSize: '0.875rem' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setActiveSlug(cat.slug)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: activeSlug === cat.slug ? 'var(--accent-gold)' : 'var(--border-subtle)',
              background: activeSlug === cat.slug ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: activeSlug === cat.slug ? '#000' : 'var(--text-primary)',
              fontWeight: activeSlug === cat.slug ? 700 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table Header bar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {activeCategory.label}
            <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              {rows.length} row{rows.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <button
            onClick={handleAddNew}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--accent-gold)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Plus size={16} /> Add Row
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {activeCategory.columns.map(col => (
                  <th key={col.key} style={headerCellStyle}>{col.label}</th>
                ))}
                <th style={{ ...headerCellStyle, borderRight: 'none', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeCategory.columns.length + 1} style={{ ...cellStyle, textAlign: 'center', color: 'var(--text-secondary)', borderRight: 'none' }}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 && !newRow ? (
                <tr>
                  <td colSpan={activeCategory.columns.length + 1} style={{ ...cellStyle, textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem', borderRight: 'none' }}>
                    No rows yet. Click <strong>Add Row</strong> to add the first entry.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}
                  >
                    {editingId === row.id ? (
                      // Edit mode
                      <>
                        {activeCategory.columns.map(col => (
                          <td key={col.key} style={cellStyle}>
                            <input
                              style={inputStyle}
                              value={editForm[col.key] || ''}
                              onChange={e => setEditForm({ ...editForm, [col.key]: e.target.value })}
                              placeholder={col.label}
                            />
                          </td>
                        ))}
                        <td style={{ ...cellStyle, borderRight: 'none' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={handleSaveEdit}
                              disabled={saving}
                              style={{ padding: '0.4rem 0.75rem', background: 'var(--accent-gold)', border: 'none', borderRadius: '6px', color: '#000', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Save size={13} /> {saving ? '...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        {activeCategory.columns.map(col => (
                          <td key={col.key} style={cellStyle}>
                            {row[col.key] || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>—</span>}
                          </td>
                        ))}
                        <td style={{ ...cellStyle, borderRight: 'none' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleEdit(row)}
                              style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--accent-gold)', cursor: 'pointer' }}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '6px', color: '#dc3c3c', cursor: 'pointer' }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}

              {/* New Row form */}
              {newRow && (
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(var(--accent-gold-rgb, 212,175,55), 0.05)' }}>
                  {activeCategory.columns.map(col => (
                    <td key={col.key} style={cellStyle}>
                      <input
                        style={inputStyle}
                        value={newRow[col.key] || ''}
                        onChange={e => setNewRow({ ...newRow, [col.key]: e.target.value })}
                        placeholder={col.label}
                        autoFocus={col.key === 'description'}
                      />
                    </td>
                  ))}
                  <td style={{ ...cellStyle, borderRight: 'none' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={handleSaveNew}
                        disabled={saving}
                        style={{ padding: '0.4rem 0.75rem', background: 'var(--accent-gold)', border: 'none', borderRadius: '6px', color: '#000', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Save size={13} /> {saving ? '...' : 'Add'}
                      </button>
                      <button
                        onClick={() => setNewRow(null)}
                        style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FrameDimensionsManager;
