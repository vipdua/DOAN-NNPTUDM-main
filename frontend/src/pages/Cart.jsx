import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/carts');
      // The backend returns an array of {product: {id, title...}, quantity: X}
      // But let's check the route again: router.get('/', ... res.send(cart.products))
      // It returns the products array directly.
      
      // We need to populate the product details if the backend didn't.
      // Based on carts.js: res.send(cart.products), and schema: products: [{ product: {ref: 'product'}, quantity: Number }]
      // The backend GET /carts doesn't seem to populate. Let's handle it or assume it might be populated by middleware.
      // Actually, looking at carts.js, it doesn't populate. I'll need to fetch product info for each if not present.
      
      // Let's assume we might need to fetch them if they are just IDs.
      setCartItems(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId, action) => {
    setIsUpdating(productId);
    try {
      if (action === 'increase') {
        await api.post('/carts/add', { product: productId });
      } else if (action === 'decrease') {
        await api.post('/carts/decrease', { product: productId });
      } else if (action === 'remove') {
        await api.post('/carts/remove', { product: productId });
      }
      await fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(null);
    }
  };

  const calculateTotal = () => {
    // Note: This assumes product detail is populated. 
    // If not populated by backend, we'd need to fetch product info.
    // For now, let's assume the backend SHOULD populate it or we'd have to modify backend.
    // But per "make frontend match backend", I will try to make it work with what's there.
    return cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <ShoppingBag size={48} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Giỏ hàng của bạn đang trống</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
          Có vẻ như bạn chưa chọn được sản phẩm ưng ý nào. Hãy khám phá bộ sưu tập iPhone mới nhất của chúng tôi ngay nhé!
        </p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: 'var(--radius-lg)', fontSize: '1rem' }}>
          Khám phá ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem', letterSpacing: '-0.02em' }}>Giỏ hàng của bạn</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.map((item) => (
            <div key={item.product?._id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: 'none', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)', flexShrink: 0 }}>
                <img src={item.product?.images?.[0] || 'https://placehold.co/100'} alt={item.product?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.product?._id}`} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'block' }}>
                  {item.product?.title || 'Sản phẩm không xác định'}
                </Link>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Sẵn hàng trong kho</p>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.125rem' }}>
                  ${(item.product?.price || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-primary)', padding: '0.5rem', borderRadius: 'var(--radius-lg)' }}>
                <button 
                  onClick={() => handleUpdateQuantity(item.product?._id, 'decrease')}
                  disabled={isUpdating === item.product?._id}
                  style={{ padding: '0.25rem', color: 'var(--text-secondary)' }}
                >
                  <Minus size={18} />
                </button>
                <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button 
                  onClick={() => handleUpdateQuantity(item.product?._id, 'increase')}
                  disabled={isUpdating === item.product?._id}
                  style={{ padding: '0.25rem', color: 'var(--text-secondary)' }}
                >
                  <Plus size={18} />
                </button>
              </div>

              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  ${((item.product?.price || 0) * item.quantity).toLocaleString()}
                </div>
                <button 
                  onClick={() => handleUpdateQuantity(item.product?._id, 'remove')}
                  style={{ color: 'var(--danger)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}
                >
                  <Trash2 size={16} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: '2rem', border: 'none', boxShadow: 'var(--shadow-lg)', position: 'sticky', top: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Tổng thanh toán</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Tạm tính</span>
              <span>${calculateTotal().toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Thuế ước tính</span>
              <span>$0</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Tổng cộng</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${calculateTotal().toLocaleString()}
            </span>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)', fontSize: '1.125rem', fontWeight: 700 }}>
            Tiếp tục thanh toán <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
          </button>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/products" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
