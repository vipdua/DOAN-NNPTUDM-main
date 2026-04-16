import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, Loader2, Shield } from 'lucide-react';
import api from '../api/axios';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    setIsAdding(true);
    try {
      await api.post('/carts/add', { product: id });
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Bạn cần đăng nhập để thêm vào giỏ hàng');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
    </div>
  );
  
  if (!data || !data.product) return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sản phẩm không tồn tại</h2>
      <button onClick={() => navigate('/products')} className="btn btn-primary">Quay lại cửa hàng</button>
    </div>
  );

  const { product, inventory } = data;

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1rem' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
        {/* Left: Product Images */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ border: 'none', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '1/1' }}>
            <img 
              src={product.images && product.images[0] ? product.images[0] : 'https://placehold.co/800x800'} 
              alt={product.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Right: Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category?.name || 'Điện thoại'}
            </span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            {product.title}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${product.price?.toLocaleString()}
            </span>
            <div style={{ 
              padding: '0.375rem 0.75rem', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: inventory?.stock > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: inventory?.stock > 0 ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.875rem',
              fontWeight: 700
            }}>
              {inventory?.stock > 0 ? `Còn hàng: ${inventory.stock}` : 'Hết hàng'}
            </div>
          </div>
          
          <div style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Mô tả sản phẩm</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
              {product.description || 'Sản phẩm cao cấp với thiết kế tinh xảo và hiệu năng vượt trội. Đảm bảo mang lại trải nghiệm tốt nhất cho người dùng.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={addToCart}
              disabled={isAdding || inventory?.stock <= 0}
              className="btn btn-primary" 
              style={{ flex: 1, padding: '1.25rem', fontSize: '1.25rem', fontWeight: 700, borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)' }}
            >
              {isAdding ? <Loader2 className="animate-spin" size={24} /> : (added ? <><Check size={24} /> Đã thêm</> : <><ShoppingCart size={24} /> Thêm vào giỏ hàng</>)}
            </button>
          </div>
          
          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: 'var(--primary)' }}><Shield size={24} /></div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Bảo hành chính hãng 12 tháng</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: 'var(--primary)' }}><ArrowLeft size={24} style={{ transform: 'rotate(180deg)' }} /></div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Miễn phí vận chuyển toàn quốc</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
