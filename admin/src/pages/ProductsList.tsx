import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ProductsList = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    // Real schema query
    const { data, error } = await supabase
      .from('products')
      .select('*, series(name, categories(name))');
    
    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const uniqueCategories = Array.from(new Set(products.map(p => p.series?.categories?.name).filter(Boolean)));
  const uniqueSeries = Array.from(new Set(products.map(p => p.series?.name).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.series?.categories?.name === categoryFilter : true;
    const matchesSeries = seriesFilter ? p.series?.name === seriesFilter : true;
    return matchesSearch && matchesCategory && matchesSeries;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Products Catalog</h1>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)} 
            style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => <option key={cat as string} value={cat as string}>{cat as string}</option>)}
          </select>

          <select 
            value={seriesFilter} 
            onChange={(e) => setSeriesFilter(e.target.value)} 
            style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">All Series</option>
            {uniqueSeries.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Code</th>
                <th>Category</th>
                <th>Series</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No products found.</td></tr>
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/products/edit/${product.id}`} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }}>
                          <Trash2 size={14} />
                        </button>
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

export default ProductsList;
