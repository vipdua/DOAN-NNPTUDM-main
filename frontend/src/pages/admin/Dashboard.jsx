import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, ShoppingBag, Layers, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, categoriesRes] = await Promise.all([
          api.get('/users'),
          api.get('/products'),
          api.get('/categories')
        ]);
        setStats({
          users: usersRes.data.length,
          products: productsRes.data.length,
          categories: categoriesRes.data.length,
          loading: false
        });
      } catch (err) {
        console.error(err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Tổng người dùng', value: stats.users, icon: <Users size={24} />, color: 'var(--primary)', bg: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Tổng sản phẩm', value: stats.products, icon: <ShoppingBag size={24} />, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Danh mục', value: stats.categories, icon: <Layers size={24} />, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Hoạt động', value: 'Active', icon: <Activity size={24} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bảng Điều Khiển Admin</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Chào mừng bạn trở lại, hệ thống đang hoạt động ổn định.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {statCards.map((card, idx) => (
          <div key={idx} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '12px', 
              backgroundColor: card.bg, 
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {card.icon}
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{card.title}</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stats.loading ? '...' : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', backgroundColor: 'transparent' }}>
        <p style={{ color: 'var(--text-muted)' }}>Các biểu đồ chi tiết sẽ sớm được cập nhật trong phiên bản tiếp theo.</p>
      </div>
    </div>
  );
}
