import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, FolderTree, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ProductsList = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [activeSeries, setActiveSeries] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
    fetchSeries();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, series(name, categories(name))');
    
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const fetchSeries = async () => {
    const { data, error } = await supabase.from('series').select('*').order('name');
    if (!error && data) setSeries(data);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const topLevelSeries = series.filter(s => !s.parent_id);
  const getSubSeries = (parentId: string) => series.filter(s => s.parent_id === parentId);

  const toggleCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    
    let matchesSeries = true;
    if (activeSeries) {
      if (activeSeries.parent_id) {
         matchesSeries = p.series_id === activeSeries.id;
      } else {
         const subSeriesIds = series.filter(s => s.parent_id === activeSeries.id).map(s => s.id);
         matchesSeries = p.series_id === activeSeries.id || subSeriesIds.includes(p.series_id);
      }
    }
    return matchesSearch && matchesSeries;
  });

  return (
    <div className="animate-fade-in pricing-layout">
      {/* Sidebar for Series Selection */}
      <div className="pricing-sidebar">
        <div style={{ padding: '2rem 1.5rem 1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Products Catalog</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select a series to view products</p>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 1rem 2rem' }}>
          {/* "All Products" Button */}
          <div 
            onClick={() => setActiveSeries(null)}
            style={{ 
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: !activeSeries ? 'var(--bg-secondary)' : 'transparent',
              border: !activeSeries ? '1px solid var(--accent-gold)' : '1px solid transparent',
              marginBottom: '0.5rem'
            }}
          >
            <FolderTree size={16} style={{ color: !activeSeries ? 'var(--accent-gold)' : 'var(--text-muted)' }} />
            <div style={{ fontWeight: !activeSeries ? 600 : 500, fontSize: '0.95rem', color: !activeSeries ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              All Products
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {topLevelSeries.map(s => {
              const subSeries = getSubSeries(s.id);
              const hasSub = subSeries.length > 0;
              const isExpanded = expandedCats[s.id];
              const isActive = activeSeries?.id === s.id;

              return (
                <div key={s.id}>
                  <div 
                    onClick={() => setActiveSeries(s)}
                    style={{ 
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: isActive ? 'var(--bg-secondary)' : 'transparent',
                      border: isActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                    }}
                  >
                    {hasSub ? (
                      <div onClick={(e) => toggleCategory(s.id, e)} style={{ padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    ) : (
                      <div style={{ width: '24px' }}></div>
                    )}
                    <FolderTree size={16} style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)' }} />
                    <div style={{ fontWeight: isActive ? 600 : 500, fontSize: '0.95rem', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {s.name}
                    </div>
                  </div>

                  {hasSub && isExpanded && (
                    <div style={{ marginLeft: '2.5rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {subSeries.map(sub => {
                        const isSubActive = activeSeries?.id === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => setActiveSeries(sub)}
                            style={{ 
                              padding: '0.6rem 1rem',
                              cursor: 'pointer',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: isSubActive ? 'var(--bg-secondary)' : 'transparent',
                              border: isSubActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                            }}
                          >
                            <Layers size={14} style={{ color: isSubActive ? 'var(--accent-gold)' : 'var(--text-muted)' }} />
                            <div style={{ fontWeight: isSubActive ? 600 : 400, fontSize: '0.9rem', color: isSubActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {sub.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pricing-content">
        <div className="pricing-content-main">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
            </div>
            
            <Link to="/products/new" className="btn btn-primary">
              <Plus size={18} />
              Add Product
            </Link>
          </div>

          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>
                {activeSeries ? `${activeSeries.name} Products` : 'All Products'}
              </h2>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table className="data-table" style={{ width: '100%', minWidth: '800px' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                  <tr>
                    <th>Image</th>
                    <th>Product Code</th>
                    <th>Category</th>
                    <th>Series</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No products found.</td></tr>
                  ) : (
                    filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                        </td>
                        <td>{product.series?.categories?.name || 'N/A'}</td>
                        <td>{product.series?.name || product.series_id || 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Link to={`/products/edit/${product.id}`} className="btn btn-icon"><Edit2 size={16} /></Link>
                            <button onClick={() => handleDelete(product.id)} className="btn btn-icon" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
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
      </div>
    </div>
  );
};

export default ProductsList;
