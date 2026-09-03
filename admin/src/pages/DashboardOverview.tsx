import { useEffect, useState } from 'react';
import { Package, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#D4AF37', '#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#a855f7'];

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalLeads: 0,
  });

  const [loading, setLoading] = useState(true);

  // Dynamic Chart States
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [inquiryData, setInquiryData] = useState<any[]>([]);
  const [seriesData, setSeriesData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch basic counts
      const [
        { count: productsCount },
        { count: catsCount },
        { count: usersCount },
        { count: leadsCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).neq('status', 'Closed')
      ]);

      setStats({
        totalProducts: productsCount || 0,
        totalCategories: catsCount || 0,
        totalUsers: usersCount || 0,
        totalLeads: leadsCount || 0,
      });

      // 2. Fetch data for User Growth Chart
      const { data: profiles } = await supabase.from('profiles').select('created_at');
      if (profiles) {
        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthCounts = new Array(12).fill(0);
        
        profiles.forEach(p => {
          if (p.created_at) {
            const date = new Date(p.created_at);
            monthCounts[date.getMonth()] += 1;
          }
        });

        let cumulative = 0;
        const growth = months.map((month, idx) => {
          cumulative += monthCounts[idx];
          return { name: month, users: cumulative };
        });
        
        // Show up to current month
        const currentMonth = new Date().getMonth();
        setUserGrowthData(growth.slice(0, currentMonth + 1));
      }

      // 3. Fetch data for Category Engagement
      const { data: categories } = await supabase.from('categories').select('id, name');
      const { data: products } = await supabase.from('products').select('id, category_id');
      const { data: wishlists } = await supabase.from('wishlists').select('product_id');

      if (categories && products) {
        const catStats = categories.map(cat => {
          const catProducts = products.filter(p => p.category_id === cat.id);
          const productIds = catProducts.map(p => p.id);
          
          let wishlistedCount = 0;
          if (wishlists) {
             wishlistedCount = wishlists.filter(w => productIds.includes(w.product_id)).length;
          }

          return {
            name: cat.name,
            products: catProducts.length,
            wishlisted: wishlistedCount
          };
        });
        setCategoryData(catStats);
      }

      // 4. Fetch Inquiries Status for Pie Chart
      const { data: inquiries } = await supabase.from('inquiries').select('status');
      if (inquiries) {
        const counts = { Pending: 0, Contacted: 0, Closed: 0 };
        inquiries.forEach(i => {
          if (i.status === 'Pending') counts.Pending++;
          else if (i.status === 'Contacted') counts.Contacted++;
          else if (i.status === 'Closed') counts.Closed++;
        });
        setInquiryData([
          { name: 'Pending', value: counts.Pending },
          { name: 'Contacted', value: counts.Contacted },
          { name: 'Closed', value: counts.Closed },
        ].filter(item => item.value > 0)); // Only show non-zero
      }

      // 5. Fetch Series Distribution
      const { data: series } = await supabase.from('series').select('id, name');
      if (series && products) {
        const { data: productsWithSeries } = await supabase.from('products').select('series_id');
        if (productsWithSeries) {
          const sStats = series.map(s => {
            const count = productsWithSeries.filter(p => p.series_id === s.id).length;
            return { name: s.name, value: count };
          });
          setSeriesData(sStats.filter(s => s.value > 0)); // Only non-zero
        }
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' ,paddingRight: '2rem' ,paddingLeft: '2rem', paddingTop: '1.5rem' }}>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div className="form-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div>
            <div className="stat-value">{loading ? '...' : stats.totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{loading ? '...' : stats.totalCategories}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{loading ? '...' : stats.totalUsers}</div>
            <div className="stat-label">Registered Users</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="stat-value">{loading ? '...' : stats.totalLeads}</div>
            <div className="stat-label">Active Inquiries</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* User Growth Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            User Growth (YTD)
          </h2>
          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} width={50} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1A17', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="users" name="Total Users" stroke="#D4AF37" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
          )}
        </div>

        {/* Category Engagement Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Products & Wishlists by Category
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }} barCategoryGap="20%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} width={40} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1A17', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#fff', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                <Bar dataKey="products" fill="rgba(200, 200, 200, 0.75)" radius={[4, 4, 0, 0]} name="Total Products" />
                <Bar dataKey="wishlisted" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Wishlist Saves" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
          )}
        </div>

        {/* Inquiries Status Pie Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Inquiries by Status
          </h2>
          {inquiryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={inquiryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inquiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'Pending' ? '#f59e0b' : 
                      entry.name === 'Contacted' ? '#60a5fa' : 
                      '#4ade80'
                    } />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1A17', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div style={{ height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No inquiries found</div>
          )}
        </div>

        {/* Products by Series Donut Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Product Distribution by Series
          </h2>
          {seriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={seriesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => (percent || 0) > 0.05 ? name : ''}
                >
                  {seriesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1A17', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No series data available</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
