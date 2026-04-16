import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Loader2, Plus } from 'lucide-react';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    minprice: '',
    maxprice: '',
    title: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.minprice) params.append('minprice', filter.minprice);
      if (filter.maxprice) params.append('maxprice', filter.maxprice);
      if (filter.title) params.append('title', filter.title);

      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter.category]); // Re-fetch when category changes

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const addToCart = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post('/carts/add', { product: id });
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      alert(err.response?.data?.message || 'Bạn cần đăng nhập để thêm vào giỏ hàng');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1rem' }}>
      <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em' }}>Bộ sưu tập iPhone</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Khám phá những công nghệ đột phá nhất từ Apple.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Filters Sidebar */}
        <aside className="card" style={{ padding: '2rem', border: 'none', boxShadow: 'var(--shadow-lg)', position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Filter size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Bộ lọc</h2>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Tìm kiếm</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Tên sản phẩm..." 
                  value={filter.title}
                  onChange={e => setFilter({...filter, title: e.target.value})}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Danh mục</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="radio" name="category" checked={filter.category === ''} onChange={() => setFilter({...filter, category: ''})} />
                  <span style={{ fontSize: '0.95rem' }}>Tất cả các dòng</span>
                </label>
                {categories.map(cat => (
                  <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="radio" name="category" checked={filter.category === cat._id} onChange={() => setFilter({...filter, category: cat._id})} />
                    <span style={{ fontSize: '0.95rem' }}>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Khoảng giá ($)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" className="input-field" placeholder="Từ" value={filter.minprice} onChange={e => setFilter({...filter, minprice: e.target.value})} />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input type="number" className="input-field" placeholder="Đến" value={filter.maxprice} onChange={e => setFilter({...filter, maxprice: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>Áp dụng bộ lọc</button>
            <button type="button" onClick={() => setFilter({category: '', minprice: '', maxprice: '', title: ''})} style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>Xóa tất cả</button>
          </form>
        </aside>

        {/* Product Grid */}
        <main>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
              <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {products.map(product => (
                <Link to={`/products/${product._id}`} key={product._id} className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', border: 'none', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }} onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                }} onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
                    <img 
                      src={product.images?.[0] || 'https://placehold.co/400x400'} 
                      alt={product.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                    />
                    <div className="btn-add-quick" onClick={(e) => addToCart(e, product._id)} style={{ position: 'absolute', bottom: '1rem', right: '1rem', backgroundColor: 'white', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <ShoppingCart size={20} />
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      {product.category?.name || 'iPhone'}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{product.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>${product.price?.toLocaleString()}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sẵn hàng</span>
                    </div>
                  </div>
                </Link>
              ))}
              {products.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '10rem 2rem', textAlign: 'center' }}>
                  <ShoppingCart size={64} style={{ opacity: 0.1, margin: '0 auto 2rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Không tìm thấy sản phẩm</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Hãy thử điều chỉnh bộ lọc để tìm sản phẩm mong muốn.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
